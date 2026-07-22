import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27' as any,
  })

  let event: any

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const { prisma } = await import('@/lib/prisma')
    const session = event.data.object
    const metadata = session.metadata || {}

    const email = session.customer_email || ''
    const companyName = metadata.company_name
    const campaignId = metadata.campaign_id
    const affiliateId = metadata.affiliate_id
    const revenueAmount = (session.amount_total || 0) / 100

    let affiliateUser = null
    if (affiliateId && affiliateId !== 'direct') {
      affiliateUser = await prisma.user.findUnique({
        where: { id: affiliateId },
      })
    }

    await prisma.lead.create({
      data: {
        campaignId: campaignId || undefined,
        affiliateId: affiliateUser?.id,
        email,
        companyName: companyName || undefined,
        stripeSessionId: session.id,
        revenueAmount,
        status: 'WON',
      },
    })

    if (affiliateUser && campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      })
      if (campaign) {
        const commission = (revenueAmount * Number(campaign.commissionRate)) / 100
        await prisma.lead.updateMany({
          where: { stripeSessionId: session.id },
          data: { revenueAmount: commission },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
