import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { campaignId, message } = await req.json()
  if (!campaignId) {
    return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } })
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const existing = await prisma.joinRequest.findUnique({
    where: { campaignId_affiliateId: { campaignId, affiliateId: session.user.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'Already requested to join this campaign' }, { status: 409 })
  }

  const request = await prisma.joinRequest.create({
    data: {
      campaignId,
      affiliateId: session.user.id,
      message: message || null,
    },
  })

  return NextResponse.json(request, { status: 201 })
}
