import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const brand = await prisma.brand.findFirst({ where: { userId: session.user.id }, select: { id: true } })
  if (!brand) {
    return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
  }

  const requests = await prisma.joinRequest.findMany({
    where: {
      campaign: { brandId: brand.id },
    },
    include: {
      affiliate: { select: { id: true, name: true, email: true, image: true } },
      campaign: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}
