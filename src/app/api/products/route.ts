import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brandId')

  if (!brandId) {
    return NextResponse.json({ error: 'brandId is required' }, { status: 400 })
  }

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
    select: { id: true },
  })
  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  const products = await prisma.product.findMany({
    where: { brandId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await req.json()
  const { brandId, name, description, price, productUrl, imageUrl, sku } = json

  if (!brandId || !name) {
    return NextResponse.json({ error: 'brandId and name are required' }, { status: 400 })
  }

  const brand = await prisma.brand.findFirst({
    where: { id: brandId, userId: session.user.id },
    select: { id: true },
  })
  if (!brand) {
    return NextResponse.json({ error: 'Brand not found' }, { status: 404 })
  }

  const product = await prisma.product.create({
    data: {
      brandId,
      name,
      description: description || null,
      price: price ? Number(price) : 0,
      productUrl: productUrl || null,
      imageUrl: imageUrl || null,
      sku: sku || null,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
