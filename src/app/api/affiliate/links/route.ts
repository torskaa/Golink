import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const partner = await prisma.partner.findFirst({
    where: { email: session.user.email! },
    select: { id: true },
  })
  if (!partner) {
    return NextResponse.json([])
  }

  const links = await prisma.link.findMany({
    where: { partnerId: partner.id, isActive: true },
    include: {
      campaign: { select: { id: true, title: true, commissionRate: true } },
      product: { select: { id: true, name: true, price: true } },
      _count: { select: { clickEvents: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const mapped = links.map((l) => ({
    id: l.id,
    key: l.key,
    url: l.url,
    title: l.title,
    clicks: l._count.clickEvents,
    revenue: l.revenue,
    isActive: l.isActive,
    campaignName: l.campaign?.title || null,
    productName: l.product?.name || null,
    productPrice: l.product?.price || null,
  }))

  return NextResponse.json(mapped)
}
