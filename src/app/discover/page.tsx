'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Megaphone, DollarSign, Users, TrendingUp, ExternalLink, Award } from 'lucide-react'
import { toast } from 'sonner'

const publicCampaigns = [
  {
    id: '1',
    title: 'Summer Launch 2026',
    description: 'Join our summer product line affiliate program — high conversion rates and competitive commissions for fashion & lifestyle creators.',
    brand: 'Demo Brand Co.',
    commissionRate: 15,
    rewardType: 'percentage',
    clicks: 12450,
    leads: 456,
    status: 'ACTIVE',
    tags: ['Fashion', 'Lifestyle', 'Seasonal'],
  },
  {
    id: '2',
    title: 'TikTok Viral Campaign',
    description: 'Create TikTok content featuring our products and earn up to 20% commission. Bonus rewards for viral videos with 100K+ views.',
    brand: 'Demo Brand Co.',
    commissionRate: 20,
    rewardType: 'tiered',
    clicks: 8920,
    leads: 234,
    status: 'ACTIVE',
    tags: ['TikTok', 'Video', 'Social Media'],
  },
  {
    id: '3',
    title: 'New Collection Launch',
    description: 'Exclusive early access to our Q3 collection. Be among the first affiliates to promote our newest product line.',
    brand: 'Demo Brand Co.',
    commissionRate: 12,
    rewardType: 'percentage',
    clicks: 4567,
    leads: 123,
    status: 'ACTIVE',
    tags: ['Exclusive', 'Early Access', 'Fashion'],
  },
  {
    id: '4',
    title: 'Flash Sale Program',
    description: 'Limited-time flash sale affiliate program. Higher commission rates during promotional periods.',
    brand: 'Demo Brand Co.',
    commissionRate: 10,
    rewardType: 'flat',
    clicks: 2100,
    leads: 67,
    status: 'ACTIVE',
    tags: ['Sales', 'Limited Time'],
  },
]

export default function DiscoverPage() {
  const [search, setSearch] = useState('')

  const filtered = search
    ? publicCampaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase()) ||
          c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : publicCampaigns

  return (
    <div className="min-h-screen bg-bg-default">
      <header className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <span className="text-lg font-semibold text-content-emphasis">DubPartner</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost">Sign in</Button></Link>
          <Link href="/register"><Button>Get Started</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-12">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-content-emphasis">Partner Discovery</h1>
          <p className="mt-2 text-content-subtle max-w-xl mx-auto">
            Browse affiliate programs and find the perfect campaigns to promote. Earn commissions for every sale you generate.
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            type="text"
            placeholder="Search campaigns by name, description, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-bg-default py-3 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<Megaphone className="h-5 w-5" />} title="No campaigns found" description="Try adjusting your search terms" />
        ) : (
          <div className="grid gap-4">
            {filtered.map((campaign) => (
              <Card key={campaign.id} className="border-border-default bg-bg-default transition-all hover:border-border-default/80 hover:shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-content-emphasis">{campaign.title}</h2>
                        <Badge variant="success">Open</Badge>
                      </div>
                      <p className="mt-1 text-sm text-content-subtle">{campaign.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {campaign.tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-bg-subtle px-2 py-0.5 text-xs text-content-subtle">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-content-subtle">
                          <Award className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-500 font-medium">{campaign.commissionRate}%</span>
                          <span>commission</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-content-subtle">
                          <Users className="h-4 w-4" />
                          <span>{campaign.clicks.toLocaleString()} clicks</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-content-subtle">
                          <DollarSign className="h-4 w-4" />
                          <span>{campaign.leads} conversions</span>
                        </div>
                      </div>
                    </div>
                    <Button className="shrink-0 ml-4" onClick={() => toast.success('Application submitted! We\'ll review and get back to you.')}>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
