import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  const where: Record<string, unknown> = { workspace: { userId: session.user.id } }
  if (workspaceId) where.workspaceId = workspaceId

  const tags = await prisma.tag.findMany({ where, include: { _count: { select: { links: true } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(tags)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { name, color, workspaceId } = json
  if (!name || !workspaceId) return NextResponse.json({ error: 'name and workspaceId required' }, { status: 400 })

  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId: session.user.id } })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const existing = await prisma.tag.findUnique({ where: { workspaceId_name: { workspaceId, name } } })
  if (existing) return NextResponse.json({ error: 'Tag already exists' }, { status: 409 })

  const tag = await prisma.tag.create({ data: { name, color: color || '#2563eb', workspaceId } })
  return NextResponse.json(tag, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const tag = await prisma.tag.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!tag) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.tag.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
