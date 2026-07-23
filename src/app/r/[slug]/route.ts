import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseUserAgent } from '@/lib/utils'

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const url = new URL(req.url)
  const host = req.headers.get('host') || ''

  let link

  if (host !== 'link.dubpartner.co') {
    const domain = await prisma.domain.findFirst({
      where: { slug: host, verified: true },
    })
    if (domain) {
      link = await prisma.link.findFirst({
        where: { key: slug, domainId: domain.id, isActive: true },
        include: { campaign: true, product: true },
      })
    }
  }

  if (!link) {
    link = await prisma.link.findFirst({
      where: { key: slug, isActive: true },
      include: { campaign: true, product: true },
    })
  }

  if (!link) {
    return NextResponse.redirect(new URL('/404', req.url))
  }

  const ua = req.headers.get('user-agent') || ''
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
  const referer = req.headers.get('referer') || ''
  const country = req.headers.get('x-vercel-ip-country') || undefined
  const city = req.headers.get('x-vercel-ip-city') || undefined
  const { device, browser, os } = parseUserAgent(ua)

  let destination: URL | null = null

  if (device === 'Mobile' && link.deviceMobileUrl) {
    destination = new URL(link.deviceMobileUrl)
  } else if (device === 'Tablet' && link.deviceTabletUrl) {
    destination = new URL(link.deviceTabletUrl)
  } else if (device === 'Desktop' && link.deviceDesktopUrl) {
    destination = new URL(link.deviceDesktopUrl)
  }

  if (!destination && link.geoOverrides && link.geoOverrides !== '[]') {
    try {
      const overrides: Array<{ country: string; url: string }> = JSON.parse(link.geoOverrides)
      if (country) {
        const match = overrides.find((o) => o.country.toUpperCase() === country.toUpperCase())
        if (match) {
          destination = new URL(match.url)
        }
      }
    } catch {}
  }

  if (!destination) {
    destination = new URL(link.url)
  }

  if (device === 'Mobile' && link.deepLinkIos && (os === 'iOS' || os === 'macOS')) {
    destination = new URL(link.deepLinkIos)
  } else if (device === 'Mobile' && link.deepLinkAndroid && os === 'Android') {
    destination = new URL(link.deepLinkAndroid)
  }

  const utmSource = url.searchParams.get('utm_source') || link.utmSource || undefined
  const utmMedium = url.searchParams.get('utm_medium') || link.utmMedium || undefined
  const utmCampaign = url.searchParams.get('utm_campaign') || link.utmCampaign || undefined
  const utmTerm = url.searchParams.get('utm_term') || link.utmTerm || undefined
  const utmContent = url.searchParams.get('utm_content') || link.utmContent || undefined

  try {
    await prisma.clickEvent.create({
      data: {
        linkId: link.id,
        productId: link.productId || undefined,
        ip,
        country,
        city,
        referer: referer || undefined,
        device,
        browser,
        os,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      },
    })
  } catch {}

  if (utmSource) destination.searchParams.set('utm_source', utmSource)
  if (utmMedium) destination.searchParams.set('utm_medium', utmMedium)
  if (utmCampaign) destination.searchParams.set('utm_campaign', utmCampaign)
  if (utmTerm) destination.searchParams.set('utm_term', utmTerm)
  if (utmContent) destination.searchParams.set('utm_content', utmContent)

  return NextResponse.redirect(destination)
}
