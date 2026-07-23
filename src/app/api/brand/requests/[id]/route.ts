import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action } = await req.json()
  if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
    return NextResponse.json({ error: 'action must be APPROVED or REJECTED' }, { status: 400 })
  }

  const joinRequest = await prisma.joinRequest.findUnique({
    where: { id },
    include: {
      campaign: { select: { id: true, workspaceId: true, brandId: true, title: true, commissionRate: true } },
    },
  })
  if (!joinRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  const brand = await prisma.brand.findFirst({
    where: { id: joinRequest.campaign.brandId!, userId: session.user.id },
    select: { id: true },
  })
  if (!brand) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await prisma.joinRequest.update({
    where: { id },
    data: { status: action },
  })

  if (action === 'APPROVED') {
    const existingPartner = await prisma.partner.findFirst({
      where: { workspaceId: joinRequest.campaign.workspaceId, email: (await prisma.user.findUnique({ where: { id: joinRequest.affiliateId }, select: { email: true } }))?.email || '' },
    })

    if (!existingPartner) {
      const affiliate = await prisma.user.findUnique({ where: { id: joinRequest.affiliateId }, select: { name: true, email: true } })
      await prisma.partner.create({
        data: {
          workspaceId: joinRequest.campaign.workspaceId,
          name: affiliate?.name || 'Partner',
          email: affiliate?.email || '',
          status: 'active',
        },
      })
    }
  }

  return NextResponse.json({ success: true })
}
