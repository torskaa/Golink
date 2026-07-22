import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const totalUsers = await prisma.user.count()
  const totalWorkspaces = await prisma.workspace.count()
  const totalCampaigns = await prisma.campaign.count()
  const totalLinks = await prisma.link.count()
  const totalClicks = await prisma.clickEvent.count()
  const totalLeads = await prisma.lead.count()
  const totalRevenue = await prisma.lead.aggregate({
    _sum: { revenueAmount: true },
    where: { status: 'WON' },
  })

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  const recentLeads = await prisma.lead.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      campaign: { select: { title: true } },
      affiliate: { select: { name: true, email: true } },
    },
  })

  const roleDistribution = await prisma.user.groupBy({
    by: ['role'],
    _count: true,
  })

  const clicksLast7Days = await prisma.$queryRawUnsafe<
    Array<{ date: string; clicks: number }>
  >(
    `SELECT strftime('%Y-%m-%d', created_at) AS date, COUNT(*) AS clicks
     FROM ClickEvent
     WHERE created_at >= datetime('now', '-7 days')
     GROUP BY date ORDER BY date ASC`
  )

  return NextResponse.json({
    totalUsers,
    totalWorkspaces,
    totalCampaigns,
    totalLinks,
    totalClicks,
    totalLeads,
    totalRevenue: totalRevenue._sum.revenueAmount || 0,
    roleDistribution: roleDistribution.map((r) => ({ role: r.role, count: r._count })),
    clicksLast7Days: clicksLast7Days.map((d) => ({ date: d.date, clicks: Number(d.clicks) })),
    recentUsers,
    recentLeads,
  })
}
