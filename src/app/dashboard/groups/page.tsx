'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Plus, Users, Edit3, Trash2, X, Percent, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

interface PartnerGroup {
  id: string
  name: string
  description: string | null
  campaignId: string
  rewardType: string
  rewardRate: number
  customerDiscount: number
  customerDiscountType: string
  minimumPayoutAmount: number
  payoutHoldingPeriod: number
  isActive: boolean
  _count?: { partners: number }
}

interface Campaign {
  id: string
  title: string
}

export default function GroupsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<PartnerGroup[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PartnerGroup | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [rewardType, setRewardType] = useState('percentage')
  const [rewardRate, setRewardRate] = useState(10)
  const [customerDiscount, setCustomerDiscount] = useState(0)
  const [customerDiscountType, setCustomerDiscountType] = useState('percent')
  const [minimumPayoutAmount, setMinimumPayoutAmount] = useState(0)
  const [payoutHoldingPeriod, setPayoutHoldingPeriod] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      Promise.all([
        fetch('/api/campaigns').then((r) => r.json()).catch(() => []),
        fetch('/api/groups').then((r) => r.json()).catch(() => []),
      ]).then(([c, g]) => {
        setCampaigns(Array.isArray(c) ? c : [])
        setGroups(Array.isArray(g) ? g : [])
      }).finally(() => setLoading(false))
    }
  }, [status, router])

  const resetForm = () => {
    setName('')
    setDescription('')
    setCampaignId('')
    setRewardType('percentage')
    setRewardRate(10)
    setCustomerDiscount(0)
    setCustomerDiscountType('percent')
    setMinimumPayoutAmount(0)
    setPayoutHoldingPeriod(0)
    setIsActive(true)
    setEditing(null)
  }

  const openEdit = (g: PartnerGroup) => {
    setName(g.name)
    setDescription(g.description || '')
    setCampaignId(g.campaignId)
    setRewardType(g.rewardType)
    setRewardRate(g.rewardRate)
    setCustomerDiscount(g.customerDiscount)
    setCustomerDiscountType(g.customerDiscountType)
    setMinimumPayoutAmount(g.minimumPayoutAmount)
    setPayoutHoldingPeriod(g.payoutHoldingPeriod)
    setIsActive(g.isActive)
    setEditing(g)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !campaignId) { toast.error('Name and campaign are required'); return }
    setSubmitting(true)

    const body = { name, description, campaignId, rewardType, rewardRate, customerDiscount, customerDiscountType, minimumPayoutAmount, payoutHoldingPeriod, isActive }
    const url = editing ? `/api/groups?id=${editing.id}` : '/api/groups'
    const method = editing ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSubmitting(false)
    if (res.ok) {
      toast.success(editing ? 'Group updated' : 'Group created')
      setShowModal(false)
      resetForm()
      const updated = await fetch('/api/groups').then((r) => r.json()).catch(() => [])
      setGroups(Array.isArray(updated) ? updated : [])
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this group?')) return
    const res = await fetch(`/api/groups?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Group deleted')
      setGroups((prev) => prev.filter((g) => g.id !== id))
    } else {
      toast.error('Failed to delete')
    }
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Partner Groups</h1>
          <p className="text-sm text-content-subtle">Organize partners into groups with custom reward rules</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true) }}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-border-default bg-bg-default animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No groups yet"
          description="Create your first partner group to organize affiliates"
          action={<Button onClick={() => { resetForm(); setShowModal(true) }}><Plus className="mr-1.5 h-4 w-4" /> Create Group</Button>}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="border-border-default bg-bg-default">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-content-emphasis">{g.name}</CardTitle>
                    {g.description && (
                      <p className="mt-1 text-xs text-content-subtle line-clamp-2">{g.description}</p>
                    )}
                  </div>
                  <Badge variant={g.isActive ? 'success' : 'secondary'}>
                    {g.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-subtle">Reward</span>
                    <span className="text-content-emphasis font-medium">
                      {g.rewardType === 'percentage' ? `${g.rewardRate}%` : `$${g.rewardRate}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-subtle">Members</span>
                    <span className="text-content-emphasis font-medium">{(g as any)._count?.partners ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-subtle">Customer Discount</span>
                    <span className="text-content-emphasis font-medium">
                      {g.customerDiscount > 0
                        ? `${g.customerDiscount}${g.customerDiscountType === 'percent' ? '%' : '$'}`
                        : 'None'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-content-subtle">Min Payout</span>
                    <span className="text-content-emphasis font-medium">${g.minimumPayoutAmount}</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(g)}>
                    <Edit3 className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
            <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-content-emphasis">{editing ? 'Edit Group' : 'Create Group'}</h2>
                  <p className="text-xs text-content-subtle">{editing ? 'Update group settings' : 'Set up a new partner group'}</p>
                </div>
                <button onClick={() => { setShowModal(false); resetForm() }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-bg-subtlehover:text-content-emphasis transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-content-emphasis">Group Name</label>
                  <input type="text" placeholder="Premium Partners" value={name} onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Description</label>
                  <textarea placeholder="Describe this group..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                    className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none" />
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Campaign</label>
                  <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                    <option value="">Select campaign</option>
                    {campaigns.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Reward Type</label>
                    <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Reward Rate</label>
                    <div className="relative mt-1.5">
                      {rewardType === 'percentage' ? (
                        <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
                      ) : (
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
                      )}
                      <input type="number" min={0} step="0.1" value={rewardRate} onChange={(e) => setRewardRate(Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-bg-default py-2.5 pl-10 pr-3 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Customer Discount</label>
                    <input type="number" min={0} step="0.1" value={customerDiscount} onChange={(e) => setCustomerDiscount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Discount Type</label>
                    <select value={customerDiscountType} onChange={(e) => setCustomerDiscountType(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                      <option value="percent">Percent</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Min Payout Amount ($)</label>
                    <input type="number" min={0} step="1" value={minimumPayoutAmount} onChange={(e) => setMinimumPayoutAmount(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-content-emphasis">Payout Hold (days)</label>
                    <input type="number" min={0} step="1" value={payoutHoldingPeriod} onChange={(e) => setPayoutHoldingPeriod(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
                  <span className="text-sm text-content-emphasis">Active</span>
                </label>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm() }}
                    className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-content-emphasis hover:bg-bg-bg-subtletransition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    {submitting ? 'Saving...' : editing ? 'Update Group' : 'Create Group'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
