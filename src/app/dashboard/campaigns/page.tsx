'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { EmptyState } from '@/components/ui/empty-state'
import { CreateCampaignModal } from '@/components/create-campaign-modal'
import {
  Plus, Megaphone, Link2, Users,
  X, PlusCircle, Loader2, ChevronRight, Globe, Package,
  Layers, Clock, DollarSign, ToggleLeft, ToggleRight,
  Check, UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'

interface Campaign {
  id: string
  title: string
  description: string
  commissionRate: number
  status: string
  links: number
  leads: number
  rewardType?: string
  rewardConfig?: string
  isPublic?: boolean
  customerDiscount?: number
  customerDiscountType?: string
  partnerReferralReward?: string
}

interface RewardCondition {
  id: string
  campaignId: string
  type: string
  config: string
  rewardType: string
  rewardRate: number
  isActive: boolean
  createdAt: string
}

interface JoinRequestItem {
  id: string
  affiliateId: string
  status: string
  message: string | null
  createdAt: string
  affiliate: { id: string; name: string | null; email: string | null; image: string | null }
  campaign: { id: string; title: string }
}

const campaignsData: Campaign[] = [
  {
    id: '1',
    title: 'Summer Launch 2026',
    description: 'Affiliate campaign for summer product line',
    commissionRate: 15,
    status: 'ACTIVE',
    links: 12,
    leads: 45,
    rewardType: 'percentage',
    rewardConfig: JSON.stringify({ minClicks: 10, maxCap: 500 }),
    isPublic: true,
    customerDiscount: 20,
    customerDiscountType: 'percent',
    partnerReferralReward: JSON.stringify({ enabled: true, type: 'percentage', rate: 5 }),
  },
  {
    id: '2',
    title: 'New Collection Launch',
    description: 'Influencer campaign for Q3 collection',
    commissionRate: 10,
    status: 'ACTIVE',
    links: 8,
    leads: 23,
    rewardType: 'flat',
    rewardConfig: JSON.stringify({ flatFee: 5, maxCap: 200 }),
  },
  {
    id: '3',
    title: 'TikTok Viral Campaign',
    description: 'TikTok creator affiliate program',
    commissionRate: 20,
    status: 'DRAFT',
    links: 0,
    leads: 0,
    rewardType: 'tiered',
    rewardConfig: JSON.stringify({ tiers: [{ minSales: 0, rate: 15 }, { minSales: 50, rate: 20 }], maxCap: 1000 }),
  },
]

const conditionTypes: Record<string, { label: string; icon: React.ReactNode; desc: string; fields: { key: string; label: string; type: string }[] }> = {
  geo: {
    label: 'Geo-specific',
    icon: <Globe className="h-4 w-4" />,
    desc: 'Override rewards for specific countries',
    fields: [
      { key: 'country', label: 'Country Code', type: 'text' },
      { key: 'url', label: 'URL Override', type: 'text' },
    ],
  },
  product: {
    label: 'Product Spotlight',
    icon: <Package className="h-4 w-4" />,
    desc: 'Different rewards per product',
    fields: [
      { key: 'productName', label: 'Product Name', type: 'text' },
    ],
  },
  partner_tier: {
    label: 'Partner Performance Tiers',
    icon: <Layers className="h-4 w-4" />,
    desc: 'Tiered rewards based on partner performance',
    fields: [
      { key: 'tierName', label: 'Tier Name', type: 'text' },
      { key: 'minSales', label: 'Min Sales', type: 'number' },
    ],
  },
  staggered_duration: {
    label: 'Staggered Durations',
    icon: <Clock className="h-4 w-4" />,
    desc: 'Rewards that increase over time',
    fields: [
      { key: 'durationDays', label: 'Duration (days)', type: 'number' },
    ],
  },
  sale_amount: {
    label: 'Sale Amount Modifiers',
    icon: <DollarSign className="h-4 w-4" />,
    desc: 'Higher rewards for larger sales',
    fields: [
      { key: 'minAmount', label: 'Min Sale Amount ($)', type: 'number' },
      { key: 'maxAmount', label: 'Max Sale Amount ($)', type: 'number' },
    ],
  },
}

export default function CampaignsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isBrand = session?.user?.role === 'BRAND' || session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && !isBrand) router.push('/dashboard/marketplace')
  }, [status, router, isBrand])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [conditions, setConditions] = useState<RewardCondition[]>([])
  const [showAddCondition, setShowAddCondition] = useState(false)
  const [conditionType, setConditionType] = useState('geo')
  const [conditionRewardType, setConditionRewardType] = useState<'percentage' | 'flat'>('percentage')
  const [conditionRewardRate, setConditionRewardRate] = useState(10)
  const [conditionConfig, setConditionConfig] = useState<Record<string, string>>({})
  const [submittingCondition, setSubmittingCondition] = useState(false)
  const [joinRequests, setJoinRequests] = useState<JoinRequestItem[]>([])
  const [showRequests, setShowRequests] = useState(false)
  const [respondingRequest, setRespondingRequest] = useState<string | null>(null)

  useEffect(() => {
    if (selectedCampaign) {
      fetchConditions(selectedCampaign.id)
    }
  }, [selectedCampaign])

  useEffect(() => {
    if (isBrand && showRequests) {
      fetch('/api/brand/requests')
        .then(res => res.json())
        .then(data => setJoinRequests(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [isBrand, showRequests])

  const fetchConditions = async (campaignId: string) => {
    try {
      const res = await fetch(`/api/reward-conditions?campaignId=${campaignId}`)
      if (res.ok) {
        const data = await res.json()
        setConditions(data)
      }
    } catch { /* ignore */ }
  }

  const handleAddCondition = async () => {
    setSubmittingCondition(true)
    try {
      const res = await fetch('/api/reward-conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign!.id,
          type: conditionType,
          rewardType: conditionRewardType,
          rewardRate: conditionRewardRate,
          config: conditionConfig,
        }),
      })
      if (!res.ok) { toast.error('Failed to add condition'); return }
      toast.success('Reward condition added')
      setShowAddCondition(false)
      setConditionConfig({})
      await fetchConditions(selectedCampaign!.id)
    } catch { toast.error('Something went wrong') }
    finally { setSubmittingCondition(false) }
  }

  const handleToggleCondition = async (condition: RewardCondition) => {
    try {
      const res = await fetch(`/api/reward-conditions?id=${condition.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !condition.isActive }),
      })
      if (!res.ok) { toast.error('Failed to update condition'); return }
      await fetchConditions(selectedCampaign!.id)
    } catch { toast.error('Something went wrong') }
  }

  const handleDeleteCondition = async (id: string) => {
    try {
      const res = await fetch(`/api/reward-conditions?id=${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Failed to delete condition'); return }
      toast.success('Condition removed')
      await fetchConditions(selectedCampaign!.id)
    } catch { toast.error('Something went wrong') }
  }

  const handleRespondRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    setRespondingRequest(requestId)
    try {
      const res = await fetch(`/api/brand/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed'); return }
      toast.success(action === 'APPROVED' ? 'Creator approved!' : 'Request rejected')
      setJoinRequests(prev => prev.filter(r => r.id !== requestId))
    } catch { toast.error('Something went wrong') }
    finally { setRespondingRequest(null) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">{isBrand ? 'Campaigns' : 'Available Campaigns'}</h1>
          <p className="text-sm text-content-subtle">{isBrand ? 'Manage your affiliate campaigns' : 'Browse brand campaigns and join to start earning'}</p>
        </div>
        <div className="flex items-center gap-3">
          {isBrand && (
            <>
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-content-subtle/60">
                <Kbd>⇧C</Kbd> New campaign
              </span>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                New Campaign
              </Button>
            </>
          )}
        </div>
      </div>

      {campaignsData.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-5 w-5 text-content-subtle" />}
          title={isBrand ? 'No campaigns yet' : 'No available campaigns'}
          description={isBrand ? 'Create your first affiliate campaign to start recruiting partners' : 'Check back later for new brand campaigns'}
          action={
            isBrand ? (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create Campaign
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {campaignsData.map((campaign) => (
            <Card
              key={campaign.id}
              className="border-border-default bg-bg-default transition-colors hover:border-border-default/80 cursor-pointer"
              onClick={() => !isBrand ? null : setSelectedCampaign(campaign)}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-medium text-content-emphasis">{campaign.title}</h3>
                    <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-content-subtle">{campaign.description}</p>
                  <p className="mt-1 text-sm text-content-subtle">
                    Commission: <span className="text-emerald-500">{campaign.commissionRate}%</span>
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-2 text-sm text-content-subtle">
                    <Link2 className="h-4 w-4" />
                    {campaign.links} links
                  </div>
                  <div className="flex items-center gap-2 text-sm text-content-subtle">
                    <Users className="h-4 w-4" />
                    {campaign.leads} leads
                  </div>
                  <ChevronRight className="h-4 w-4 text-content-subtle" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isBrand && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="flex items-center gap-2 text-sm font-medium text-content-emphasis hover:text-primary transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Join Requests
              {joinRequests.length > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  {joinRequests.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
          </div>

          {showRequests && (
            <div className="rounded-xl border border-border-default bg-bg-default animate-slide-up">
              {joinRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-8 w-8 text-content-subtle/40" />
                  <p className="mt-3 text-sm text-content-subtle">No join requests</p>
                  <p className="mt-1 text-xs text-content-subtle/60">Creators will appear here when they request to join your campaigns</p>
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  {joinRequests.map((req) => (
                    <div key={req.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-subtle text-xs font-medium text-content-emphasis shrink-0">
                        {req.affiliate.name?.[0] || req.affiliate.email?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-content-emphasis">{req.affiliate.name || 'Anonymous'}</p>
                        <p className="text-xs text-content-subtle">{req.affiliate.email}</p>
                        <p className="mt-0.5 text-xs text-content-subtle/60">
                          Requested to join <span className="font-medium text-content-emphasis">{req.campaign.title}</span>
                        </p>
                        {req.message && (
                          <p className="mt-1 text-xs text-content-subtle italic">&ldquo;{req.message}&rdquo;</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === 'PENDING' ? (
                          <>
                            <Button
                              onClick={() => handleRespondRequest(req.id, 'APPROVED')}
                              disabled={respondingRequest === req.id}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                            >
                              {respondingRequest === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleRespondRequest(req.id, 'REJECTED')}
                              disabled={respondingRequest === req.id}
                              size="sm"
                              variant="outline"
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant={req.status === 'APPROVED' ? 'success' : 'warning'}>
                            {req.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {isBrand && (
        <CreateCampaignModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      )}

      {selectedCampaign && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedCampaign(null); setShowAddCondition(false) }} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl animate-slide-up border-l border-border-default bg-bg-default shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-bg-default px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-content-emphasis">{selectedCampaign.title}</h2>
                <p className="text-xs text-content-subtle">Campaign details & reward conditions</p>
              </div>
              <button onClick={() => { setSelectedCampaign(null); setShowAddCondition(false) }} className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border-default bg-bg-default p-4">
                  <p className="text-xs text-content-subtle">Status</p>
                  <Badge variant={selectedCampaign.status === 'ACTIVE' ? 'success' : 'warning'} className="mt-1">
                    {selectedCampaign.status}
                  </Badge>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-default p-4">
                  <p className="text-xs text-content-subtle">Commission</p>
                  <p className="mt-1 text-lg font-bold text-emerald-500">{selectedCampaign.commissionRate}%</p>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-default p-4">
                  <p className="text-xs text-content-subtle">Links</p>
                  <p className="mt-1 text-lg font-bold text-content-emphasis">{selectedCampaign.links}</p>
                </div>
                <div className="rounded-lg border border-border-default bg-bg-default p-4">
                  <p className="text-xs text-content-subtle">Leads</p>
                  <p className="mt-1 text-lg font-bold text-content-emphasis">{selectedCampaign.leads}</p>
                </div>
              </div>

              <Card className="border-border-default bg-bg-default">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-content-emphasis">Reward Conditions</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowAddCondition(true)}>
                    <PlusCircle className="mr-1 h-3.5 w-3.5" />
                    Add Condition
                  </Button>
                </CardHeader>
                <CardContent>
                  {conditions.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border-default p-8 text-center">
                      <p className="text-sm text-content-subtle">No reward conditions yet</p>
                      <p className="mt-1 text-xs text-content-subtle/60">Add geo, product, or performance-based conditions</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border-default">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border-default bg-bg-subtle/30">
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-content-subtle">Type</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-content-subtle">Config</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-content-subtle">Reward</th>
                            <th className="px-4 py-2.5 text-left text-xs font-medium text-content-subtle">Status</th>
                            <th className="px-4 py-2.5 text-right text-xs font-medium text-content-subtle">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {conditions.map((cond) => {
                            const ct = conditionTypes[cond.type] || conditionTypes.geo
                            let configSummary = ''
                            try {
                              const cfg = JSON.parse(cond.config)
                              configSummary = Object.entries(cfg).map(([k, v]) => `${k}: ${v}`).join(', ')
                            } catch { configSummary = cond.config }

                            return (
                              <tr key={cond.id} className="hover:bg-bg-subtle/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {ct.icon}
                                    <span className="text-content-emphasis">{ct.label}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-content-subtle max-w-[200px] truncate">
                                  {configSummary || '—'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-content-emphasis">
                                    {cond.rewardType === 'percentage' ? `${cond.rewardRate}%` : `$${cond.rewardRate}`}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button onClick={() => handleToggleCondition(cond)} className="text-content-subtle hover:text-content-emphasis transition-colors">
                                    {cond.isActive ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5" />}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => handleDeleteCondition(cond.id)}
                                    className="text-xs text-content-subtle hover:text-destructive transition-colors">
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {showAddCondition && (
                <Card className="border-border-default bg-bg-default animate-fade-in">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-content-emphasis">Add Reward Condition</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-content-subtle">Condition Type</label>
                      <div className="mt-1.5 grid grid-cols-2 gap-2">
                        {Object.entries(conditionTypes).map(([key, ct]) => (
                          <button key={key} type="button" onClick={() => { setConditionType(key); setConditionConfig({}) }}
                            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${conditionType === key ? 'border-primary bg-primary/10 text-primary' : 'border-input text-content-subtle hover:text-content-emphasis hover:border-border-default'}`}>
                            {ct.icon}
                            <div>
                              <div className="text-xs font-medium">{ct.label}</div>
                              <div className="text-[10px] opacity-70">{ct.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-content-subtle">Reward Type</label>
                        <select value={conditionRewardType} onChange={(e) => setConditionRewardType(e.target.value as 'percentage' | 'flat')}
                          className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis">
                          <option value="percentage">% Commission</option>
                          <option value="flat">Flat Fee</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-content-subtle">Reward Rate</label>
                        <input type="number" min={0} step={0.1} value={conditionRewardRate} onChange={(e) => setConditionRewardRate(Number(e.target.value))}
                          className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis" />
                      </div>
                    </div>

                    {conditionTypes[conditionType]?.fields.map((field) => (
                      <div key={field.key}>
                        <label className="text-xs text-content-subtle">{field.label}</label>
                        <input type={field.type} min={0} value={conditionConfig[field.key] || ''} onChange={(e) => setConditionConfig({ ...conditionConfig, [field.key]: e.target.value })}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis placeholder:text-content-subtle" />
                      </div>
                    ))}

                    <div className="flex items-center gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddCondition(false)}
                        className="flex-1 rounded-lg border border-input py-2 text-sm font-medium text-content-emphasis hover:bg-bg-subtle transition-colors">
                        Cancel
                      </button>
                      <button type="button" onClick={handleAddCondition} disabled={submittingCondition}
                        className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                        {submittingCondition ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Adding...</span> : 'Add Condition'}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border-default bg-bg-default">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-content-emphasis">Partner Referral Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    try {
                      const rr = JSON.parse(selectedCampaign.partnerReferralReward || '{}')
                      if (rr.enabled) {
                        return (
                          <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-subtle/30 p-3">
                            <div>
                              <p className="text-sm text-content-emphasis">Referral rewards are enabled</p>
                              <p className="text-xs text-content-subtle">
                                {rr.type === 'percentage' ? `${rr.rate}% commission` : `$${rr.rate} flat fee`} for partner referrals
                              </p>
                            </div>
                            <Badge variant="success">Active</Badge>
                          </div>
                        )
                      }
                      return <p className="text-sm text-content-subtle">Partner referral rewards are disabled</p>
                    } catch {
                      return <p className="text-sm text-content-subtle">Partner referral rewards are disabled</p>
                    }
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
