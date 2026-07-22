import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { email, campaignId, affiliateId, companyName, revenueAmount } = json

    if (!email || !campaignId) {
      return NextResponse.json({ error: 'email and campaignId are required' }, { status: 400 })
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const lead = await prisma.lead.create({
      data: {
        campaignId,
        affiliateId: affiliateId || null,
        email,
        companyName: companyName || null,
        revenueAmount: revenueAmount || 0,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ ok: true, leadId: lead.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
