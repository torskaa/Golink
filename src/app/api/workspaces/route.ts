import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createWorkspaceSchema } from '@/lib/schemas'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { campaigns: true, partners: true, links: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(workspaces)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = createWorkspaceSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await prisma.workspace.findUnique({
    where: { slug: parsed.data.slug },
  })
  if (existing) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
  }

  const workspace = await prisma.workspace.create({
    data: { ...parsed.data, userId: session.user.id },
  })

  return NextResponse.json(workspace, { status: 201 })
}
