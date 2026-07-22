import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  const where: Record<string, unknown> = { workspace: { userId: session.user.id } }
  if (workspaceId) where.workspaceId = workspaceId

  const webhooks = await prisma.webhook.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(webhooks)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { url, events, workspaceId } = json
  if (!url || !workspaceId) return NextResponse.json({ error: 'url and workspaceId required' }, { status: 400 })

  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId: session.user.id } })
  if (!ws) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const webhook = await prisma.webhook.create({
    data: {
      url,
      events: JSON.stringify(events || ['link.clicked', 'lead.created', 'sale.completed']),
      secret: `whsec_${crypto.randomBytes(16).toString('hex')}`,
      workspaceId,
    },
  })

  return NextResponse.json(webhook, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { id, url, events, isActive } = json
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const wh = await prisma.webhook.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!wh) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.webhook.update({
    where: { id },
    data: {
      ...(url !== undefined && { url }),
      ...(events !== undefined && { events: JSON.stringify(events) }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const wh = await prisma.webhook.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!wh) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.webhook.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
