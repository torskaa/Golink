import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const brands = await prisma.brand.findMany({
    where: {
      isVerified: true,
      campaigns: { some: { status: 'ACTIVE' } },
    },
    include: {
      user: { select: { name: true, email: true } },
      campaigns: {
        where: { status: 'ACTIVE' },
        include: {
          _count: { select: { links: true, leads: true, joinRequests: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const affiliateId = session.user.id
  const existingRequests = await prisma.joinRequest.findMany({
    where: { affiliateId },
    select: { campaignId: true, status: true },
  })
  const requestMap = new Map(existingRequests.map(r => [r.campaignId, r.status]))

  const mapped = brands.map((brand) => ({
    id: brand.id,
    companyName: brand.companyName,
    websiteUrl: brand.websiteUrl,
    campaigns: brand.campaigns
      .filter(c => c.status === 'ACTIVE')
      .map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        commissionRate: c.commissionRate,
        rewardType: c.rewardType,
        links: c._count.links,
        leads: c._count.leads,
        partners: c._count.joinRequests,
        requestStatus: requestMap.get(c.id) || null,
      })),
  }))

  return NextResponse.json(mapped)
}
