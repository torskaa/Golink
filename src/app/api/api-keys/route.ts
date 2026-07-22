import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateApiKey(): string {
  return `dub_${crypto.randomBytes(24).toString('hex')}`
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const workspaceId = searchParams.get('workspaceId')

  const where: Record<string, unknown> = { workspace: { userId: session.user.id } }
  if (workspaceId) where.workspaceId = workspaceId

  const keys = await prisma.apiKey.findMany({
    where,
    select: { id: true, name: true, key: true, lastUsedAt: true, expiresAt: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(keys)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { name, workspaceId } = json
  if (!name || !workspaceId) return NextResponse.json({ error: 'name and workspaceId required' }, { status: 400 })

  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId: session.user.id } })
  if (!ws) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rawKey = generateApiKey()
  const hashedKey = hashKey(rawKey)

  const apiKey = await prisma.apiKey.create({
    data: { name, key: rawKey, hashedKey, workspaceId },
  })

  return NextResponse.json({ ...apiKey, key: rawKey }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const key = await prisma.apiKey.findFirst({ where: { id, workspace: { userId: session.user.id } } })
  if (!key) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.apiKey.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
