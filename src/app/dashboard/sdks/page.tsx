'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Code2, Copy, Check, ExternalLink } from 'lucide-react'

const snippets = {
  typescript: {
    label: 'TypeScript',
    code: `import { DubPartner } from 'dubpartner-sdk'

const dp = new DubPartner({
  apiKey: process.env.DUBPARTNER_API_KEY,
})

// Create a short link
const link = await dp.links.create({
  url: 'https://example.com/long-url',
  key: 'my-slug',
  campaignId: 'camp_xxx',
})

// Track a conversion
await dp.track.sale({
  affiliateId: 'aff_xxx',
  amount: 100,
  currency: 'USD',
})

// Get analytics
const stats = await dp.analytics.get({
  linkId: link.id,
  range: '7d',
})`,
  },
  python: {
    label: 'Python',
    code: `from dubpartner import DubPartner

dp = DubPartner(
    api_key="YOUR_API_KEY"
)

# Create a short link
link = dp.links.create(
    url="https://example.com/long-url",
    key="my-slug",
    campaign_id="camp_xxx"
)

# Track a conversion
dp.track.sale(
    affiliate_id="aff_xxx",
    amount=100.00,
    currency="USD"
)

# Get analytics
stats = dp.analytics.get(
    link_id=link.id,
    range="7d"
)`,
  },
  go: {
    label: 'Go',
    code: `package main

import (
    "context"
    "github.com/dubpartner/sdk-go"
)

func main() {
    dp := dubpartner.NewClient("YOUR_API_KEY")

    // Create a short link
    link, _ := dp.Links.Create(context.Background(), &dubpartner.CreateLinkInput{
        Url:        "https://example.com/long-url",
        Key:        "my-slug",
        CampaignID: "camp_xxx",
    })

    // Track a conversion
    dp.Track.Sale(context.Background(), &dubpartner.TrackSaleInput{
        AffiliateID: "aff_xxx",
        Amount:      100.00,
        Currency:    "USD",
    })
}`,
  },
  ruby: {
    label: 'Ruby',
    code: `require 'dubpartner'

dp = DubPartner::Client.new(api_key: "YOUR_API_KEY")

# Create a short link
link = dp.links.create(
  url: "https://example.com/long-url",
  key: "my-slug",
  campaign_id: "camp_xxx"
)

# Track a sale
dp.track.sale(
  affiliate_id: "aff_xxx",
  amount: 100.00,
  currency: "USD"
)`,
  },
  php: {
    label: 'PHP',
    code: `<?php

require 'vendor/autoload.php';

use DubPartner\\Client;

$dp = new Client('YOUR_API_KEY');

// Create a short link
$link = $dp->links->create([
    'url' => 'https://example.com/long-url',
    'key' => 'my-slug',
    'campaign_id' => 'camp_xxx',
]);

// Track a sale
$dp->track->sale([
    'affiliate_id' => 'aff_xxx',
    'amount' => 100.00,
    'currency' => 'USD',
]);`,
  },
  curl: {
    label: 'cURL',
    code: `# Create a short link
curl -X POST https://api.dubpartner.co/v1/links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/long-url",
    "key": "my-slug",
    "campaignId": "camp_xxx"
  }'

# Track a sale
curl -X POST https://api.dubpartner.co/v1/track/sale \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "affiliateId": "aff_xxx",
    "amount": 100.00,
    "currency": "USD"
  }'`,
  },
}

export default function SdksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeLang, setActiveLang] = useState('typescript')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') { router.push('/dashboard') }
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') return null

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang as keyof typeof snippets].code)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">SDKs & API</h1>
        <p className="text-sm text-content-subtle">Integrate DubPartner into your application</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Quick Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <p className="text-xs font-medium text-content-emphasis mb-1">1. Install SDK</p>
              <code className="block rounded-md bg-bg-default px-3 py-2 text-xs text-content-emphasis font-mono">
                npm install dubpartner-sdk
              </code>
            </div>
            <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <p className="text-xs font-medium text-content-emphasis mb-1">2. Get API Key</p>
              <p className="text-xs text-content-subtle">Generate an API key from your dashboard settings</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push('/dashboard/api-keys')}>
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Go to API Keys
              </Button>
            </div>
            <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <p className="text-xs font-medium text-content-emphasis mb-1">3. Start Tracking</p>
              <p className="text-xs text-content-subtle">Use the SDK to create links, track conversions, and pull analytics</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader className="border-b border-border-default py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-content-subtle">Code Examples</CardTitle>
              <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle/50 p-0.5">
                {Object.entries(snippets).map(([key, s]) => (
                  <button key={key} onClick={() => setActiveLang(key)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      activeLang === key
                        ? 'bg-bg-default text-content-emphasis shadow-sm'
                        : 'text-content-subtle hover:text-content-emphasis'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <pre className="overflow-x-auto p-5 text-sm">
                <code className="text-content-emphasis font-mono leading-relaxed whitespace-pre">
                  {snippets[activeLang as keyof typeof snippets].code}
                </code>
              </pre>
              <button onClick={handleCopy}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-border-default bg-bg-default px-2.5 py-1.5 text-xs text-content-subtle hover:text-content-emphasis transition-colors">
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-content-subtle">Available Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[
              { method: 'POST', path: '/v1/links', desc: 'Create a short link' },
              { method: 'GET', path: '/v1/links', desc: 'List all links' },
              { method: 'PATCH', path: '/v1/links/:id', desc: 'Update a link' },
              { method: 'DELETE', path: '/v1/links/:id', desc: 'Delete a link' },
              { method: 'POST', path: '/v1/links/bulk', desc: 'Bulk create links' },
              { method: 'POST', path: '/v1/track/lead', desc: 'Track a lead conversion' },
              { method: 'POST', path: '/v1/track/sale', desc: 'Track a sale conversion' },
              { method: 'GET', path: '/v1/analytics', desc: 'Get analytics data' },
              { method: 'GET', path: '/v1/campaigns', desc: 'List campaigns' },
              { method: 'GET', path: '/v1/links/:id/clicks', desc: 'Get click events for a link' },
            ].map((ep) => (
              <div key={ep.path} className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 px-4 py-3">
                <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-500' :
                  ep.method === 'POST' ? 'bg-blue-500/10 text-blue-500' :
                  ep.method === 'PATCH' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {ep.method}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-content-emphasis truncate">{ep.path}</p>
                  <p className="text-xs text-content-subtle">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
