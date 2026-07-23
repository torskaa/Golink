'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateCampaignModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type RewardType = 'percentage' | 'flat' | 'tiered'

interface GeoReward {
  country: string
  url: string
  rewardType: 'percentage' | 'flat'
  rewardRate: number
}

interface ProductReward {
  productName: string
  rewardType: 'percentage' | 'flat'
  rewardRate: number
}

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'TH', name: 'Thailand' },
]

export function CreateCampaignModal({ open, onOpenChange }: CreateCampaignModalProps) {
  const router = useRouter()
  const [workspaceId, setWorkspaceId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rewardType, setRewardType] = useState<RewardType>('percentage')
  const [commissionRate, setCommissionRate] = useState(10)
  const [tierLowRate, setTierLowRate] = useState(10)
  const [tierHighRate, setTierHighRate] = useState(15)
  const [tierThreshold, setTierThreshold] = useState(50)
  const [flatFee, setFlatFee] = useState(5)
  const [maxCap, setMaxCap] = useState(0)
  const [minClicks, setMinClicks] = useState(0)
  const [targetUrl, setTargetUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [status, setStatus] = useState('DRAFT')
  const [submitting, setSubmitting] = useState(false)

  const [referralRewardEnabled, setReferralRewardEnabled] = useState(false)
  const [referralRewardType, setReferralRewardType] = useState<'percentage' | 'flat'>('percentage')
  const [referralRewardRate, setReferralRewardRate] = useState(5)
  const [geoRewards, setGeoRewards] = useState<GeoReward[]>([])
  const [productRewards, setProductRewards] = useState<ProductReward[]>([])
  const [brandProducts, setBrandProducts] = useState<{ id: string; name: string; price: number }[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setLoadingMeta(true)
    Promise.all([
      fetch('/api/workspaces').then(res => res.json()),
      fetch('/api/brand').then(res => res.json()),
    ]).then(([workspaces, brand]) => {
      const ws = Array.isArray(workspaces) ? workspaces[0] : null
      if (ws?.id) setWorkspaceId(ws.id)
      if (brand?.id) {
        setBrandId(brand.id)
        fetch(`/api/products?brandId=${brand.id}`)
          .then(r => r.json())
          .then(products => {
            setBrandProducts(Array.isArray(products) ? products : [])
            setSelectedProductIds([])
          })
          .catch(() => {})
      }
    }).catch(() => {}).finally(() => setLoadingMeta(false))
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let rewardConfig: Record<string, unknown> = {}
    if (rewardType === 'tiered') {
      rewardConfig = { tiers: [{ minSales: 0, rate: tierLowRate }, { minSales: tierThreshold, rate: tierHighRate }], maxCap }
    } else if (rewardType === 'flat') {
      rewardConfig = { flatFee, maxCap }
    } else {
      rewardConfig = { minClicks, maxCap }
    }

    if (!workspaceId) {
      toast.error('Workspace not loaded. Please close and reopen the modal.')
      setSubmitting(false)
      return
    }

    try {
      const partnerReferralReward = referralRewardEnabled
        ? { enabled: true, type: referralRewardType, rate: referralRewardRate }
        : { enabled: false }

      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          brandId: brandId || undefined,
          title,
          description,
          commissionRate: rewardType === 'flat' ? flatFee : commissionRate,
          rewardType,
          rewardConfig: JSON.stringify(rewardConfig),
          partnerReferralReward: JSON.stringify(partnerReferralReward),
          rewardConfigJson: JSON.stringify({
            geoRewards,
            productRewards,
          }),
          targetUrl,
          status,
          isPublic,
          productIds: selectedProductIds,
        }),
      })
      if (!res.ok) {
        let msg = 'Failed to create campaign'
        try { const err = await res.json(); msg = typeof err.error === 'string' ? err.error : JSON.stringify(err.error) } catch {}
        toast.error(msg)
        return
      }
      toast.success('Campaign created successfully')
      onOpenChange(false)
      router.refresh()
    } catch (e) {
      toast.error(String(e))
    } finally { setSubmitting(false) }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-content-emphasis">Create Campaign</h2>
              <p className="text-xs text-content-subtle">Set up a new affiliate campaign</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-bg-subtlehover:text-content-emphasis transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-content-emphasis">Campaign Name</label>
              <input type="text" placeholder="Summer Launch 2026" value={title} onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                autoFocus required />
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Description</label>
              <textarea placeholder="Describe your campaign..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none" />
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Reward Strategy</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {[
                  { value: 'percentage' as const, label: '% Commission', desc: 'Per sale %' },
                  { value: 'flat' as const, label: 'Flat Fee', desc: 'Fixed per sale' },
                  { value: 'tiered' as const, label: 'Tiered', desc: 'Volume tiers' },
                ].map((option) => (
                  <button key={option.value} type="button" onClick={() => setRewardType(option.value)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${rewardType === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-input text-content-subtle hover:text-content-emphasis hover:border-border-default'}`}>
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-[10px] opacity-70">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {rewardType === 'percentage' && (
              <div>
                <label className="text-sm font-medium text-content-emphasis">Commission Rate (%)</label>
                <input type="number" min={0} max={100} step={0.1} value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" required />
                <div className="mt-3">
                  <label className="text-xs text-content-subtle">Min. clicks to qualify</label>
                  <input type="number" min={0} value={minClicks} onChange={(e) => setMinClicks(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                </div>
              </div>
            )}

            {rewardType === 'flat' && (
              <div>
                <label className="text-sm font-medium text-content-emphasis">Flat Fee per Sale ($)</label>
                <input type="number" min={0} step={0.5} value={flatFee} onChange={(e) => setFlatFee(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" required />
              </div>
            )}

            {rewardType === 'tiered' && (
              <div className="space-y-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
                <p className="text-xs font-medium text-content-subtle">Tier Configuration</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-content-subtle">Tier 1 Rate (%)</label>
                    <input type="number" min={0} max={100} step={0.1} value={tierLowRate} onChange={(e) => setTierLowRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-content-subtle">Tier 2 Rate (%)</label>
                    <input type="number" min={0} max={100} step={0.1} value={tierHighRate} onChange={(e) => setTierHighRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-content-subtle">Tier threshold (sales)</label>
                  <input type="number" min={1} value={tierThreshold} onChange={(e) => setTierThreshold(Number(e.target.value))}
                    className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-content-emphasis">Max Commission Cap ($)</label>
              <input type="number" min={0} value={maxCap} onChange={(e) => setMaxCap(Number(e.target.value))} placeholder="0 = no cap"
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              <p className="mt-0.5 text-[10px] text-content-subtle">Maximum commission per affiliate (0 = unlimited)</p>
            </div>

            <div className="space-y-4 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-content-emphasis">Partner Referral Rewards</p>
                  <p className="text-xs text-content-subtle">Reward partners for referring other partners to your program</p>
                </div>
                <button
                  type="button"
                  onClick={() => setReferralRewardEnabled(!referralRewardEnabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${referralRewardEnabled ? 'bg-primary' : 'bg-border-default'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${referralRewardEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {referralRewardEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-content-subtle">Reward Type</label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {(['percentage', 'flat'] as const).map((rt) => (
                        <button key={rt} type="button" onClick={() => setReferralRewardType(rt)}
                          className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${referralRewardType === rt ? 'border-primary bg-primary/10 text-primary' : 'border-input text-content-subtle hover:text-content-emphasis'}`}>
                          {rt === 'percentage' ? '% Rate' : 'Flat Fee'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-content-subtle">{referralRewardType === 'percentage' ? 'Reward Rate (%)' : 'Reward Amount ($)'}</label>
                    <input type="number" min={0} step={0.1} value={referralRewardRate} onChange={(e) => setReferralRewardRate(Number(e.target.value))}
                      className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-content-emphasis">Geo-specific Rewards</p>
                  <p className="text-xs text-content-subtle">Override rewards for specific countries</p>
                </div>
                <button type="button" onClick={() => setGeoRewards([...geoRewards, { country: 'TH', url: '', rewardType: 'percentage', rewardRate: 10 }])}
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  <Plus className="h-3 w-3" /> Add Country
                </button>
              </div>
              {geoRewards.length === 0 && (
                <p className="text-xs text-content-subtle">No geo-specific rewards configured.</p>
              )}
              {geoRewards.map((gr, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 rounded-md border border-border-default bg-bg-default p-2.5">
                  <div className="col-span-3">
                    <label className="text-[10px] text-content-subtle">Country</label>
                    <select value={gr.country} onChange={(e) => { const g = [...geoRewards]; g[i] = { ...g[i], country: e.target.value }; setGeoRewards(g) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis">
                      {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <label className="text-[10px] text-content-subtle">URL Override</label>
                    <input type="text" placeholder="https://..." value={gr.url} onChange={(e) => { const g = [...geoRewards]; g[i] = { ...g[i], url: e.target.value }; setGeoRewards(g) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis placeholder:text-content-subtle" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-content-subtle">Type</label>
                    <select value={gr.rewardType} onChange={(e) => { const g = [...geoRewards]; g[i] = { ...g[i], rewardType: e.target.value as 'percentage' | 'flat' }; setGeoRewards(g) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis">
                      <option value="percentage">%</option>
                      <option value="flat">$</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-content-subtle">Rate</label>
                    <input type="number" min={0} step={0.1} value={gr.rewardRate} onChange={(e) => { const g = [...geoRewards]; g[i] = { ...g[i], rewardRate: Number(e.target.value) }; setGeoRewards(g) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis" />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <button type="button" onClick={() => setGeoRewards(geoRewards.filter((_, j) => j !== i))}
                      className="rounded p-1 text-content-subtle hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-content-emphasis">Product-specific Rewards</p>
                  <p className="text-xs text-content-subtle">Set different rewards for specific products</p>
                </div>
                <button type="button" onClick={() => setProductRewards([...productRewards, { productName: '', rewardType: 'percentage', rewardRate: 10 }])}
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  <Plus className="h-3 w-3" /> Add Product
                </button>
              </div>
              {productRewards.length === 0 && (
                <p className="text-xs text-content-subtle">No product-specific rewards configured.</p>
              )}
              {productRewards.map((pr, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 rounded-md border border-border-default bg-bg-default p-2.5">
                  <div className="col-span-5">
                    <label className="text-[10px] text-content-subtle">Product Name</label>
                    <input type="text" placeholder="e.g. Pro Plan" value={pr.productName} onChange={(e) => { const p = [...productRewards]; p[i] = { ...p[i], productName: e.target.value }; setProductRewards(p) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis placeholder:text-content-subtle" />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-content-subtle">Type</label>
                    <select value={pr.rewardType} onChange={(e) => { const p = [...productRewards]; p[i] = { ...p[i], rewardType: e.target.value as 'percentage' | 'flat' }; setProductRewards(p) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis">
                      <option value="percentage">% Commission</option>
                      <option value="flat">Flat Fee</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <label className="text-[10px] text-content-subtle">Rate</label>
                    <input type="number" min={0} step={0.1} value={pr.rewardRate} onChange={(e) => { const p = [...productRewards]; p[i] = { ...p[i], rewardRate: Number(e.target.value) }; setProductRewards(p) }}
                      className="mt-0.5 w-full rounded border border-input bg-bg-default px-1.5 py-1 text-xs text-content-emphasis" />
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    <button type="button" onClick={() => setProductRewards(productRewards.filter((_, j) => j !== i))}
                      className="rounded p-1 text-content-subtle hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {brandProducts.length > 0 && (
              <div className="space-y-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
                <div>
                  <p className="text-sm font-medium text-content-emphasis">Linked Products</p>
                  <p className="text-xs text-content-subtle">Select products this campaign promotes</p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {brandProducts.map((p) => {
                    const selected = selectedProductIds.includes(p.id)
                    return (
                      <label key={p.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-input hover:border-border-default'}`}>
                        <input type="checkbox" checked={selected} onChange={() => {
                          setSelectedProductIds(prev => selected ? prev.filter(id => id !== p.id) : [...prev, p.id])
                        }} className="h-4 w-4 rounded border-border-default text-primary focus:ring-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-content-emphasis">{p.name}</p>
                        </div>
                        <span className="text-xs text-content-subtle">${p.price.toFixed(2)}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-content-emphasis">Target URL (optional)</label>
              <input type="url" placeholder="https://example.com/landing" value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
                <span className="text-sm text-content-emphasis">Public — show in partner discovery</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => onOpenChange(false)}
                className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-content-emphasis hover:bg-bg-bg-subtletransition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting || loadingMeta || !title}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
                {loadingMeta ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Loading...</span> : submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span> : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
