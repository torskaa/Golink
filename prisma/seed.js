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

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-brand' },
    update: {},
    create: {
      name: 'Demo Brand Co.',
      slug: 'demo-brand',
      userId: brandUser.id,
    },
  })

  const campaign = await prisma.campaign.upsert({
    where: { id: 'demo-campaign' },
    update: {},
    create: {
      id: 'demo-campaign',
      workspaceId: workspace.id,
      title: 'Summer Launch 2026',
      description: 'Affiliate campaign for summer product line',
      commissionRate: 15,
      targetUrl: 'https://example.com/summer',
      status: 'ACTIVE',
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

  console.log('\n  Link:      /r/demo-summer')
  console.log('\n  Workspace & Campaign seeded!')
  console.log('\n===========================')
  console.log('  Login at: http://localhost:3999/login')
  console.log('  Passwords: demo123')
  console.log('===========================')

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
