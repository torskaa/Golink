'use client'

import { useState, useEffect } from 'react'
import { X, Megaphone, Link2, ChevronRight, Check, Percent, Users } from 'lucide-react'
import { toast } from 'sonner'

interface AvailableCampaign {
  id: string
  title: string
  description: string
  commissionRate: number
  status: string
  brandName?: string
  links: number
  leads: number
}

interface CampaignSelectorModalProps {
  open: boolean
  onClose: () => void
}

export function CampaignSelectorModal({ open, onClose }: CampaignSelectorModalProps) {
  const [campaigns, setCampaigns] = useState<AvailableCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetch('/api/campaigns/available')
        .then(res => res.json())
        .then(data => {
          setCampaigns(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(() => {
          setCampaigns([])
          setLoading(false)
        })
    }
  }, [open])

  if (!open) return null

  const handleGenerateLink = async (campaign: AvailableCampaign) => {
    setGeneratingFor(campaign.id)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'default',
          campaignId: campaign.id,
          url: campaign.description || 'https://brand.com/campaign',
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed to generate link'); return }
      toast.success(`Referral link generated for ${campaign.title}!`)
      onClose()
    } catch {
      toast.error('Something went wrong')
    }
    finally { setGeneratingFor(null) }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl">
          <div className="flex items-start justify-between border-b border-border-default px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-content-emphasis">Join a Campaign</h2>
              <p className="text-xs text-content-subtle">Select a brand campaign to generate your referral link</p>
            </div>
            <button onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg border border-border-default bg-bg-subtle/30" />
              ))
            ) : campaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Megaphone className="h-8 w-8 text-content-subtle/40" />
                <p className="mt-3 text-sm text-content-subtle">No available campaigns</p>
                <p className="mt-1 text-xs text-content-subtle/60">Check back later for new brand campaigns</p>
              </div>
            ) : (
              campaigns.map((campaign) => (
                <div key={campaign.id}
                  className="group flex items-center gap-4 rounded-lg border border-border-default bg-bg-default p-4 transition-colors hover:border-primary/30 hover:bg-bg-subtle/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-content-emphasis">{campaign.title}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        <Percent className="h-2.5 w-2.5" />
                        {campaign.commissionRate}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-content-subtle line-clamp-1">{campaign.description || 'No description'}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-content-subtle/60">
                      <span className="flex items-center gap-1"><Link2 className="h-3 w-3" />{campaign.links} links</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{campaign.leads} leads</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerateLink(campaign)}
                    disabled={generatingFor === campaign.id}
                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/90 disabled:opacity-50">
                    {generatingFor === campaign.id ? '...' : 'Get Link'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
