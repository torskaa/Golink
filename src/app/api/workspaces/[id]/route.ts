import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateWorkspaceSchema } from '@/lib/schemas'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
    include: {
      campaigns: { include: { _count: { select: { links: true } } } },
      partners: true,
      links: { include: { clickEvents: true } },
    },
  })

  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(workspace)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const json = await req.json()
  const parsed = updateWorkspaceSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.workspace.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const workspace = await prisma.workspace.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!workspace) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.workspace.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
