import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const json = await req.json()

  const product = await prisma.product.findUnique({ where: { id }, include: { brand: { select: { userId: true } } } })
  if (!product || product.brand.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: json.name ?? product.name,
      description: json.description !== undefined ? json.description : product.description,
      price: json.price !== undefined ? Number(json.price) : product.price,
      productUrl: json.productUrl !== undefined ? json.productUrl : product.productUrl,
      imageUrl: json.imageUrl !== undefined ? json.imageUrl : product.imageUrl,
      sku: json.sku !== undefined ? json.sku : product.sku,
      isActive: json.isActive !== undefined ? json.isActive : product.isActive,
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const product = await prisma.product.findUnique({ where: { id }, include: { brand: { select: { userId: true } } } })
  if (!product || product.brand.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.product.update({ where: { id }, data: { isActive: false } })

  return NextResponse.json({ success: true })
}
