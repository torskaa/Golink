import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dubpartner.co' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@dubpartner.co',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Admin created: ${admin.email} (role: ${admin.role})`)

  const brandUser = await prisma.user.upsert({
    where: { email: 'brand@example.com' },
    update: {},
    create: {
      name: 'Demo Brand',
      email: 'brand@example.com',
      role: 'BRAND',
    },
  })
  console.log(`✅ Brand created: ${brandUser.email}`)

  const affiliateUser = await prisma.user.upsert({
    where: { email: 'affiliate@example.com' },
    update: {},
    create: {
      name: 'Demo Affiliate',
      email: 'affiliate@example.com',
      role: 'AFFILIATE',
    },
  })
  console.log(`✅ Affiliate created: ${affiliateUser.email}`)

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-brand' },
    update: {},
    create: {
      name: 'Demo Brand Co.',
      slug: 'demo-brand',
      userId: brandUser.id,
    },
  })
  console.log(`✅ Workspace created: ${workspace.name}`)

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
  console.log(`✅ Campaign created: ${campaign.title}`)

  const link = await prisma.link.upsert({
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
  console.log(`✅ Link created: /r/${link.key}`)

  console.log('\n🎉 Seed complete! Login credentials:')
  console.log('   Admin:     admin@dubpartner.co (sign in with Google/Magic Link)')
  console.log('   Brand:     brand@example.com')
  console.log('   Affiliate: affiliate@example.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
