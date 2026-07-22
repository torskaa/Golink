import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCampaignSchema } from '@/lib/schemas'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  const where: Record<string, unknown> = {
    workspace: { userId: session.user.id },
  }
  if (workspaceId) where.workspaceId = workspaceId

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      _count: { select: { links: true, leads: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(campaigns)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = createCampaignSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: parsed.data.workspaceId, userId: session.user.id },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  let rewardConfig = parsed.data.rewardConfig || '{}'
  if (json.rewardConfigJson) {
    try {
      const extras = JSON.parse(json.rewardConfigJson)
      const baseConfig = JSON.parse(rewardConfig)
      rewardConfig = JSON.stringify({ ...baseConfig, ...extras })
    } catch {
      rewardConfig = json.rewardConfigJson
    }
  }

  const campaign = await prisma.campaign.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      brandId: parsed.data.brandId,
      title: parsed.data.title,
      description: parsed.data.description,
      commissionRate: parsed.data.commissionRate,
      targetUrl: parsed.data.targetUrl,
      rewardType: parsed.data.rewardType || 'percentage',
      rewardConfig,
      status: parsed.data.status || 'DRAFT',
      isPublic: parsed.data.isPublic ?? false,
      partnerReferralReward: json.partnerReferralReward || '{}',
    },
  })

  return NextResponse.json(campaign, { status: 201 })
}
