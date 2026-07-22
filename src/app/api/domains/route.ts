import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const workspaces = await prisma.workspace.findMany({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const workspaceIds = workspaces.map((w) => w.id)

  const domains = await prisma.domain.findMany({
    where: { workspaceId: { in: workspaceIds } },
    orderBy: [{ primary: 'desc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json(domains)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { workspaceId, slug, primary } = json

  if (!workspaceId || !slug) {
    return NextResponse.json({ error: 'workspaceId and slug required' }, { status: 400 })
  }

  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id },
  })
  if (!ws) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

  const existing = await prisma.domain.findUnique({ where: { slug } })
  if (existing) return NextResponse.json({ error: 'Domain slug already taken' }, { status: 409 })

  if (primary) {
    await prisma.domain.updateMany({
      where: { workspaceId, primary: true },
      data: { primary: false },
    })
  }

  const domain = await prisma.domain.create({
    data: {
      slug,
      workspaceId,
      primary: primary || false,
      verified: false,
    },
  })

  return NextResponse.json(domain, { status: 201 })
}

export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json()
  const { id, slug, primary } = json
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const domain = await prisma.domain.findUnique({
    where: { id },
    include: { workspace: true },
  })
  if (!domain || domain.workspace.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (primary) {
    await prisma.domain.updateMany({
      where: { workspaceId: domain.workspaceId, primary: true },
      data: { primary: false },
    })
  }

  const updated = await prisma.domain.update({
    where: { id },
    data: {
      slug: slug ?? undefined,
      primary: primary ?? undefined,
    },
  })

  return NextResponse.json(updated)
}
