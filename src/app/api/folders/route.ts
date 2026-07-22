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

  const folders = await prisma.folder.findMany({
    where,
    include: { _count: { select: { links: true, children: true } } },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(folders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { name, parentId, workspaceId } = json
  if (!name || !workspaceId) return NextResponse.json({ error: 'name and workspaceId required' }, { status: 400 })

  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId: session.user.id } })
  if (!ws) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const folder = await prisma.folder.create({ data: { name, parentId: parentId || null, workspaceId } })
  return NextResponse.json(folder, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { id, name, parentId } = json
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const folder = await prisma.folder.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.folder.update({
    where: { id },
    data: { ...(name && { name }), ...(parentId !== undefined && { parentId }) },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const folder = await prisma.folder.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.link.updateMany({ where: { folderId: id }, data: { folderId: null } })
  await prisma.folder.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
