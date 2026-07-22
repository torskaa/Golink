import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  campaignId: z.string().min(1),
  type: z.enum(['geo', 'product', 'partner_tier', 'staggered_duration', 'sale_amount']),
  config: z.string().default('{}'),
  rewardType: z.enum(['percentage', 'flat']).default('percentage'),
  rewardRate: z.number().min(0).default(10),
  isActive: z.boolean().default(true),
})

const updateSchema = createSchema.partial().omit({ campaignId: true })

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

  const conditions = await prisma.rewardCondition.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(conditions)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: parsed.data.campaignId, workspace: { userId: session.user.id } },
  })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const condition = await prisma.rewardCondition.create({
    data: {
      campaignId: parsed.data.campaignId,
      type: parsed.data.type,
      config: parsed.data.config,
      rewardType: parsed.data.rewardType,
      rewardRate: parsed.data.rewardRate,
      isActive: parsed.data.isActive,
    },
  })

  return NextResponse.json(condition, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const existing = await prisma.rewardCondition.findFirst({
    where: { id, campaign: { workspace: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Reward condition not found' }, { status: 404 })
  }

  const json = await req.json()
  const parsed = updateSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (parsed.data.type !== undefined) data.type = parsed.data.type
  if (parsed.data.config !== undefined) data.config = parsed.data.config
  if (parsed.data.rewardType !== undefined) data.rewardType = parsed.data.rewardType
  if (parsed.data.rewardRate !== undefined) data.rewardRate = parsed.data.rewardRate
  if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive

  const condition = await prisma.rewardCondition.update({
    where: { id },
    data,
  })

  return NextResponse.json(condition)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const existing = await prisma.rewardCondition.findFirst({
    where: { id, campaign: { workspace: { userId: session.user.id } } },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Reward condition not found' }, { status: 404 })
  }

  await prisma.rewardCondition.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
