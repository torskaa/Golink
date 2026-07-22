import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createLinkSchema } from '@/lib/schemas'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')
  const campaignId = searchParams.get('campaignId')
  const partnerId = searchParams.get('partnerId')

  const where: Record<string, unknown> = {
    workspace: { userId: session.user.id },
  }
  if (workspaceId) where.workspaceId = workspaceId
  if (campaignId) where.campaignId = campaignId
  if (partnerId) where.partnerId = partnerId

  const links = await prisma.link.findMany({
    where,
    include: {
      campaign: { select: { title: true, commissionRate: true } },
      partner: { select: { name: true } },
      _count: { select: { clickEvents: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(links)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = createLinkSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id: parsed.data.workspaceId, userId: session.user.id },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  const existing = await prisma.link.findFirst({
    where: { workspaceId: parsed.data.workspaceId, key: parsed.data.key },
  })
  if (existing) {
    return NextResponse.json({ error: 'Link key already exists in this workspace' }, { status: 409 })
  }

  const link = await prisma.link.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      campaignId: parsed.data.campaignId,
      partnerId: parsed.data.partnerId,
      key: parsed.data.key,
      url: parsed.data.url,
      title: parsed.data.title,
    },
  })

  return NextResponse.json(link, { status: 201 })
}
