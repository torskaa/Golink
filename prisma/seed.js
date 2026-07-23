require('dotenv').config()
const path = require('path')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { PrismaLibSql } = require('@prisma/adapter-libsql')

async function main() {
  const dbPath = path.resolve(__dirname, 'dev.db')
  const url = `file:${dbPath}`
  console.log('Connecting to:', url)

  const adapter = new PrismaLibSql({ url })
  const prisma = new PrismaClient({ adapter })

  console.log('Seeding database...\n')

  const password = await bcrypt.hash('demo123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dubpartner.co' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@dubpartner.co',
      password,
      role: 'ADMIN',
    },
  })
  console.log(`  Admin:     admin@dubpartner.co / demo123`)

  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@dubpartner.co' },
    update: {},
    create: {
      name: 'Demo Brand',
      email: 'brand@dubpartner.co',
      password,
      role: 'BRAND',
    },
  })
  console.log(`  Brand:     brand@dubpartner.co / demo123`)

  const affiliateUser = await prisma.user.upsert({
    where: { email: 'creator@dubpartner.co' },
    update: {},
    create: {
      name: 'Demo Creator',
      email: 'creator@dubpartner.co',
      password,
      role: 'AFFILIATE',
    },
  })
  console.log(`  Creator:   creator@dubpartner.co / demo123`)

  const brand = await prisma.brand.upsert({
    where: { id: 'demo-brand' },
    update: { isVerified: true, companyName: 'Demo Brand Co.' },
    create: {
      id: 'demo-brand',
      companyName: 'Demo Brand Co.',
      websiteUrl: 'https://example.com',
      isVerified: true,
      userId: brandUser.id,
    },
  })

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-brand' },
    update: { name: 'Demo Brand Co.' },
    create: {
      name: 'Demo Brand Co.',
      slug: 'demo-brand',
      userId: brandUser.id,
    },
  })

  const campaign = await prisma.campaign.upsert({
    where: { id: 'demo-campaign' },
    update: {
      brandId: brand.id,
      status: 'ACTIVE',
      isPublic: true,
    },
    create: {
      id: 'demo-campaign',
      workspaceId: workspace.id,
      brandId: brand.id,
      title: 'Summer Launch 2026',
      description: 'Affiliate campaign for summer product line',
      commissionRate: 15,
      targetUrl: 'https://example.com/summer',
      status: 'ACTIVE',
      isPublic: true,
    },
  })

  await prisma.link.upsert({
    where: { workspaceId_key: { workspaceId: workspace.id, key: 'demo-summer' } },
    update: {},
    create: {
      workspaceId: workspace.id,
      campaignId: campaign.id,
      key: 'demo-summer',
      url: 'https://example.com/summer?ref=demo',
      title: 'Demo Summer Link',
      isActive: true,
    },
  })

  const product1 = await prisma.product.upsert({
    where: { id: 'demo-product-1' },
    update: { name: 'Summer T-Shirt', price: 29.99 },
    create: {
      id: 'demo-product-1',
      brandId: brand.id,
      name: 'Summer T-Shirt',
      description: 'Limited edition summer t-shirt',
      price: 29.99,
      productUrl: 'https://example.com/summer-tshirt',
    },
  })

  const product2 = await prisma.product.upsert({
    where: { id: 'demo-product-2' },
    update: { name: 'Summer Hat', price: 19.99 },
    create: {
      id: 'demo-product-2',
      brandId: brand.id,
      name: 'Summer Hat',
      description: 'Stylish summer hat',
      price: 19.99,
      productUrl: 'https://example.com/summer-hat',
    },
  })

  await prisma.campaignProduct.upsert({
    where: { campaignId_productId: { campaignId: campaign.id, productId: product1.id } },
    update: {},
    create: { campaignId: campaign.id, productId: product1.id },
  })

  await prisma.campaignProduct.upsert({
    where: { campaignId_productId: { campaignId: campaign.id, productId: product2.id } },
    update: {},
    create: { campaignId: campaign.id, productId: product2.id },
  })

  console.log(`  Brand:     ${brand.companyName} (verified: ${brand.isVerified})`)
  console.log(`  Products:  ${product1.name}, ${product2.name}`)
  console.log('\n  Link:      /r/demo-summer')
  console.log('\n  Workspace, Brand & Campaign seeded!')
  console.log('\n===========================')
  console.log('  Login at: http://localhost:3000/login')
  console.log('  Passwords: demo123')
  console.log('===========================')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
