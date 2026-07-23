import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyticsQuerySchema } from '@/lib/schemas'
import { getDateRange } from '@/lib/utils'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

const CACHE_TTL = 60 // seconds

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = analyticsQuerySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { workspaceId, range } = parsed.data
  const { start, end } = getDateRange(range)

  const cacheKey = `analytics:${workspaceId}:${range}`
  const hasRedis = process.env.UPSTASH_REDIS_REST_URL?.startsWith('https')
  if (hasRedis) {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }
  }

  const [timeseries, topCountries, topReferrers, devicesBreakdown, totalClicks, totalLeads, totalRevenue] =
    await Promise.all([
      prisma.$queryRawUnsafe<Array<{ date: string; clicks: number }>>(
        `SELECT strftime('%Y-%m-%d %H:00:00', "createdAt") AS date, COUNT(*) AS clicks
         FROM ClickEvent
         WHERE linkId IN (SELECT id FROM Link WHERE workspaceId = ?)
           AND "createdAt" >= ? AND "createdAt" <= ?
         GROUP BY date ORDER BY date ASC`,
        workspaceId, start.toISOString(), end.toISOString()
      ),
      prisma.$queryRawUnsafe<Array<{ country: string; clicks: number }>>(
        `SELECT country, COUNT(*) AS clicks
         FROM ClickEvent
         WHERE linkId IN (SELECT id FROM Link WHERE workspaceId = ?)
           AND "createdAt" >= ? AND "createdAt" <= ?
         GROUP BY country ORDER BY clicks DESC LIMIT 5`,
        workspaceId, start.toISOString(), end.toISOString()
      ),
      prisma.$queryRawUnsafe<Array<{ referer: string; clicks: number }>>(
        `SELECT referer, COUNT(*) AS clicks
         FROM ClickEvent
         WHERE linkId IN (SELECT id FROM Link WHERE workspaceId = ?)
           AND "createdAt" >= ? AND "createdAt" <= ?
         GROUP BY referer ORDER BY clicks DESC LIMIT 5`,
        workspaceId, start.toISOString(), end.toISOString()
      ),
      prisma.$queryRawUnsafe<Array<{ device: string; clicks: number }>>(
        `SELECT device, COUNT(*) AS clicks
         FROM ClickEvent
         WHERE linkId IN (SELECT id FROM Link WHERE workspaceId = ?)
           AND "createdAt" >= ? AND "createdAt" <= ?
         GROUP BY device ORDER BY clicks DESC`,
        workspaceId, start.toISOString(), end.toISOString()
      ),
      prisma.clickEvent.count({
        where: {
          link: { workspaceId },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.lead.count({
        where: {
          campaign: { workspaceId },
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.lead.aggregate({
        where: {
          campaign: { workspaceId },
          createdAt: { gte: start, lte: end },
          status: 'WON',
        },
        _sum: { revenueAmount: true },
      }),
    ])

  const totalRevenueValue = totalRevenue._sum.revenueAmount || 0
  const conversionRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0

  const payload = {
    timeseries: timeseries.map((t) => ({ date: t.date, clicks: Number(t.clicks) })),
    topCountries: topCountries.map((c) => ({ country: c.country || 'Unknown', clicks: Number(c.clicks) })),
    topReferrers: topReferrers.map((r) => ({ referer: r.referer || 'Direct', clicks: Number(r.clicks) })),
    devicesBreakdown: devicesBreakdown.map((d) => ({ device: d.device || 'Desktop', clicks: Number(d.clicks) })),
    summary: {
      totalClicks,
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalRevenue: totalRevenueValue,
    },
  }

  if (hasRedis) {
    await redis.set(cacheKey, payload, { ex: CACHE_TTL })
  }

  return NextResponse.json(payload)
}
