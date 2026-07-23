import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      brand: { select: { companyName: true } },
      _count: { select: { links: true, leads: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = campaigns.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    commissionRate: c.commissionRate,
    status: c.status,
    brandName: c.brand?.companyName || null,
    links: c._count.links,
    leads: c._count.leads,
  }))

  return NextResponse.json(mapped)
}
