import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const leads = await prisma.lead.findMany({
    where: { status: 'WON' },
    include: {
      campaign: { select: { title: true, commissionRate: true } },
      affiliate: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const payoutsByAffiliate = await prisma.lead.groupBy({
    by: ['affiliateId'],
    where: { status: 'WON', affiliateId: { not: null } },
    _sum: { revenueAmount: true },
    _count: true,
  })

  const affiliateDetails = await prisma.user.findMany({
    where: {
      id: { in: payoutsByAffiliate.map((p) => p.affiliateId!).filter(Boolean) },
    },
    select: { id: true, name: true, email: true },
  })

  const affiliatePayouts = payoutsByAffiliate.map((p) => {
    const details = affiliateDetails.find((a) => a.id === p.affiliateId)
    return {
      affiliateId: p.affiliateId,
      name: details?.name || 'Unknown',
      email: details?.email || '',
      totalRevenue: Number(p._sum.revenueAmount || 0),
      conversions: p._count,
    }
  })

  const totalPendingPayouts = affiliatePayouts.reduce((sum, a) => sum + a.totalRevenue, 0)

  return NextResponse.json({
    totalPendingPayouts,
    affiliatePayouts,
    recentLeads: leads.slice(0, 20),
  })
}
