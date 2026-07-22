import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const { leadId, revenueAmount, stripeSessionId } = json

    if (!leadId || !revenueAmount) {
      return NextResponse.json({ error: 'leadId and revenueAmount are required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'WON',
        revenueAmount,
        stripeSessionId: stripeSessionId || null,
      },
    })

    return NextResponse.json({ ok: true, leadId: updated.id })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
