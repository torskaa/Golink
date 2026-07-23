'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Store, Percent, Link2, Users, Check, Loader2, ExternalLink, ChevronDown, ChevronRight, Package } from 'lucide-react'
import { toast } from 'sonner'

interface Campaign {
  id: string
  title: string
  description: string
  commissionRate: number
  rewardType: string
  links: number
  leads: number
  partners: number
  requestStatus: string | null
  products?: { id: string; name: string; price: number }[]
}

interface Brand {
  id: string
  companyName: string
  websiteUrl: string | null
  campaigns: Campaign[]
}

export default function MarketplacePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState<string | null>(null)
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch('/api/marketplace')
      .then(res => res.json())
      .then(data => { setBrands(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setBrands([]); setLoading(false) })
  }, [status])

  if (status === 'unauthenticated') return null

  const handleRequestJoin = async (campaignId: string) => {
    setRequesting(campaignId)
    try {
      const res = await fetch('/api/marketplace/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed to request'); return }
      toast.success('Join request sent!')
      setBrands(prev => prev.map(b => ({
        ...b,
        campaigns: b.campaigns.map(c => c.id === campaignId ? { ...c, requestStatus: 'PENDING' } : c),
      })))
    } catch { toast.error('Something went wrong') }
    finally { setRequesting(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Marketplace</h1>
        <p className="text-sm text-content-subtle">Browse brands and join their affiliate campaigns</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-border-default bg-bg-default" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={<Store className="h-5 w-5" />}
          title="No brands available"
          description="Check back later for brands running affiliate campaigns"
        />
      ) : (
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.id} className="overflow-hidden rounded-xl border border-border-default bg-bg-default transition-colors">
              <button
                onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-bg-subtle/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-content-emphasis">{brand.companyName}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-content-subtle">{brand.campaigns.length} campaign{brand.campaigns.length !== 1 ? 's' : ''}</span>
                      {brand.websiteUrl && (
                        <a href={brand.websiteUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                          <ExternalLink className="h-3 w-3" /> Visit brand
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {expandedBrand === brand.id ? <ChevronDown className="h-4 w-4 text-content-subtle" /> : <ChevronRight className="h-4 w-4 text-content-subtle" />}
              </button>

              {expandedBrand === brand.id && (
                <div className="border-t border-border-default divide-y divide-border-default animate-slide-up">
                  {brand.campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-content-emphasis">{campaign.title}</h4>
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">
                            <Percent className="h-2.5 w-2.5 mr-0.5" />
                            {campaign.commissionRate}%
                          </Badge>
                        </div>
                        {campaign.description && (
                          <p className="mt-0.5 text-xs text-content-subtle line-clamp-1">{campaign.description}</p>
                        )}
                        {campaign.products && campaign.products.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {campaign.products.map(p => (
                              <span key={p.id} className="inline-flex items-center gap-1 rounded-md bg-bg-subtle px-2 py-0.5 text-[10px] text-content-subtle">
                                <Package className="h-2.5 w-2.5" />{p.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-content-subtle/60">
                          <span className="flex items-center gap-1"><Link2 className="h-3 w-3" />{campaign.links} links</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{campaign.leads} leads</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{campaign.partners} partners</span>
                        </div>
                      </div>
                      {campaign.requestStatus === 'PENDING' ? (
                        <span className="shrink-0 flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Pending
                        </span>
                      ) : campaign.requestStatus === 'APPROVED' ? (
                        <span className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
                          <Check className="h-3 w-3" />
                          Approved
                        </span>
                      ) : (
                        <Button
                          onClick={() => handleRequestJoin(campaign.id)}
                          disabled={requesting === campaign.id}
                          size="sm"
                          className="shrink-0">
                          {requesting === campaign.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            'Request to Join'
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                  {brand.campaigns.length === 0 && (
                    <div className="px-5 py-6 text-center">
                      <p className="text-xs text-content-subtle">No active campaigns available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
