import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const campaignId = searchParams.get('campaignId')

  const where: Record<string, unknown> = {
    campaign: { workspace: { userId: session.user.id } },
  }
  if (campaignId) where.campaignId = campaignId

  const groups = await prisma.partnerGroup.findMany({
    where,
    include: { _count: { select: { partners: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const parsed = groups.map(g => ({
    ...g,
    rewardConfig: JSON.parse(g.rewardConfig),
  }))

  return NextResponse.json(parsed)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const { name, description, campaignId, rewardType, rewardRate, rewardConfig, customerDiscount, customerDiscountType, customerDiscountDuration, payoutHoldingPeriod, minimumPayoutAmount } = json

  if (!name || !campaignId) {
    return NextResponse.json({ error: 'Name and campaignId are required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, workspace: { userId: session.user.id } },
  })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const group = await prisma.partnerGroup.create({
    data: {
      name,
      description,
      campaignId,
      rewardType: rewardType || 'percentage',
      rewardRate: rewardRate ?? 10.0,
      rewardConfig: typeof rewardConfig === 'object' ? JSON.stringify(rewardConfig) : (rewardConfig || '{}'),
      customerDiscount: customerDiscount ?? 0,
      customerDiscountType: customerDiscountType || 'percent',
      customerDiscountDuration,
      payoutHoldingPeriod: payoutHoldingPeriod ?? 0,
      minimumPayoutAmount: minimumPayoutAmount ?? 0,
    },
    include: { _count: { select: { partners: true } } },
  })

  return NextResponse.json({
    ...group,
    rewardConfig: JSON.parse(group.rewardConfig),
  }, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const { id, ...fields } = json

  if (!id) {
    return NextResponse.json({ error: 'Group id is required' }, { status: 400 })
  }

  const existing = await prisma.partnerGroup.findFirst({
    where: { id, campaign: { workspace: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  const data: Record<string, unknown> = {}
  if (fields.name !== undefined) data.name = fields.name
  if (fields.description !== undefined) data.description = fields.description
  if (fields.rewardType !== undefined) data.rewardType = fields.rewardType
  if (fields.rewardRate !== undefined) data.rewardRate = fields.rewardRate
  if (fields.rewardConfig !== undefined) {
    data.rewardConfig = typeof fields.rewardConfig === 'object' ? JSON.stringify(fields.rewardConfig) : fields.rewardConfig
  }
  if (fields.customerDiscount !== undefined) data.customerDiscount = fields.customerDiscount
  if (fields.customerDiscountType !== undefined) data.customerDiscountType = fields.customerDiscountType
  if (fields.customerDiscountDuration !== undefined) data.customerDiscountDuration = fields.customerDiscountDuration
  if (fields.payoutHoldingPeriod !== undefined) data.payoutHoldingPeriod = fields.payoutHoldingPeriod
  if (fields.minimumPayoutAmount !== undefined) data.minimumPayoutAmount = fields.minimumPayoutAmount
  if (fields.isActive !== undefined) data.isActive = fields.isActive

  const updated = await prisma.partnerGroup.update({
    where: { id },
    data,
    include: { _count: { select: { partners: true } } },
  })

  return NextResponse.json({
    ...updated,
    rewardConfig: JSON.parse(updated.rewardConfig),
  })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Group id is required' }, { status: 400 })
  }

  const existing = await prisma.partnerGroup.findFirst({
    where: { id, campaign: { workspace: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  await prisma.partnerGroup.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
