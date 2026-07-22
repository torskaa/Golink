'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MetricCard } from '@/components/dashboard/metric-card'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign, TrendingUp, HandCoins, ArrowUpRight, Download, Wallet, Plus, CheckCircle2,
  Clock, XCircle, FileText, Banknote, ExternalLink, Settings2, Info, Filter, Search, X,
  AlertTriangle, Ban, ShieldAlert
} from 'lucide-react'
import { toast } from 'sonner'

type PayoutStatus = 'pending' | 'processing' | 'sent' | 'completed' | 'failed' | 'canceled'

interface Payout {
  id: string
  partner: string
  email: string
  amount: number
  date: string
  method: string
  status: PayoutStatus
  invoice: string
  eligible: boolean
}

const mockPayouts: Payout[] = [
  { id: '1', partner: 'Jane Cooper', email: 'jane@example.com', amount: 450.00, date: 'Jul 15, 2026', method: 'PromptPay', status: 'completed', invoice: '#INV-2026-001', eligible: true },
  { id: '2', partner: 'Wade Warren', email: 'wade@example.com', amount: 320.00, date: 'Jun 30, 2026', method: 'PayPal', status: 'completed', invoice: '#INV-2026-002', eligible: true },
  { id: '3', partner: 'Esther Howard', email: 'esther@example.com', amount: 567.00, date: 'Jun 15, 2026', method: 'Stripe', status: 'completed', invoice: '#INV-2026-003', eligible: true },
  { id: '4', partner: 'Cameron Williamson', email: 'cameron@example.com', amount: 189.50, date: 'Jul 22, 2026', method: 'PromptPay', status: 'pending', invoice: '', eligible: true },
  { id: '5', partner: 'Brooklyn Simmons', email: 'brooklyn@example.com', amount: 234.00, date: 'Jul 10, 2026', method: 'PayPal', status: 'processing', invoice: '#INV-2026-004', eligible: true },
  { id: '6', partner: 'Robert Fox', email: 'robert@example.com', amount: 78.00, date: 'Jun 01, 2026', method: 'Bank Transfer', status: 'failed', invoice: '', eligible: false },
  { id: '7', partner: 'Jenny Wilson', email: 'jenny@example.com', amount: 12.50, date: 'Jul 05, 2026', method: 'PromptPay', status: 'pending', invoice: '', eligible: false },
  { id: '8', partner: 'Albert Flores', email: 'albert@example.com', amount: 892.00, date: 'Jul 25, 2026', method: 'Stripe', status: 'sent', invoice: '#INV-2026-005', eligible: true },
]

const paymentMethods = [
  { id: 'stripe', name: 'Stripe Connect', description: 'Automatic payouts via Stripe', icon: Banknote, connected: false },
  { id: 'paypal', name: 'PayPal', description: 'Receive payments to your PayPal email', icon: Wallet, connected: true, value: 'creator@example.com' },
  { id: 'promptpay', name: 'PromptPay', description: 'Instant transfers for Thai affiliates', icon: HandCoins, connected: true, value: '089-xxx-xxxx' },
]

const statusVariant: Record<PayoutStatus, 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'> = {
  pending: 'secondary',
  processing: 'warning',
  sent: 'secondary',
  completed: 'success',
  failed: 'destructive',
  canceled: 'outline',
}

const statusIcon: Record<PayoutStatus, React.ReactNode> = {
  pending: <Clock className="mr-1 h-3 w-3 inline" />,
  processing: <Clock className="mr-1 h-3 w-3 inline" />,
  sent: <CheckCircle2 className="mr-1 h-3 w-3 inline" />,
  completed: <CheckCircle2 className="mr-1 h-3 w-3 inline" />,
  failed: <XCircle className="mr-1 h-3 w-3 inline" />,
  canceled: <XCircle className="mr-1 h-3 w-3 inline" />,
}

export default function PayoutsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState('promptpay')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmType, setConfirmType] = useState<'all' | 'selected'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [excludedIds, setExcludedIds] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [holdingPeriod, setHoldingPeriod] = useState(7)
  const [minPayout, setMinPayout] = useState(20)
  const [payoutFeeACH, setPayoutFeeACH] = useState(5)
  const [payoutFeeCard, setPayoutFeeCard] = useState(8)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'unauthenticated') return null

  const totalPaid = mockPayouts.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0)
  const eligiblePayouts = mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').filter(p => p.eligible)
  const ineligiblePayouts = mockPayouts.filter(p => (p.status === 'pending' || p.status === 'processing') && !p.eligible)
  const pendingTotal = eligiblePayouts.reduce((s, p) => s + p.amount, 0)
  const ineligibleTotal = ineligiblePayouts.reduce((s, p) => s + p.amount, 0)

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) { toast.error('Enter a valid amount'); return }
    toast.success(`Withdrawal request for ${formatCurrency(parseFloat(withdrawAmount))} via ${withdrawMethod} submitted`)
    setShowWithdraw(false)
    setWithdrawAmount('')
  }

  const handleConfirmPayouts = () => {
    if (confirmType === 'selected' && selectedIds.length === 0) {
      toast.error('Select at least one payout to confirm')
      return
    }
    toast.success(confirmType === 'all' ? 'All eligible payouts confirmed for processing' : `${selectedIds.length} payout(s) confirmed for processing`)
    setShowConfirmModal(false)
    setSelectedIds([])
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleExclude = (id: string) => {
    setExcludedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const selectAll = () => {
    const selectable = mockPayouts.filter(p => !excludedIds.includes(p.id) && (p.status === 'pending' || p.status === 'processing')).map(p => p.id)
    setSelectedIds(selectable.length === selectedIds.length ? [] : selectable)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Payouts</h1>
          <p className="text-sm text-content-subtle">Withdraw your earnings and manage payment methods</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings2 className="mr-1.5 h-4 w-4" />
            Settings
          </Button>
          <Button onClick={() => setShowWithdraw(true)}>
            <HandCoins className="mr-1.5 h-4 w-4" />
            Withdraw
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Paid Out" value={formatCurrency(totalPaid)} change={18} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Pending/Eligible" value={formatCurrency(pendingTotal)} icon={<Clock className="h-4 w-4" />} />
        <MetricCard label="Available Balance" value={formatCurrency(1234.50)} icon={<Wallet className="h-4 w-4" />} />
        <MetricCard label="Next Payout" value="Jul 31, 2026" icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-4">
            <CardTitle className="text-sm font-medium text-content-subtle">Pending Payouts</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-500">{formatCurrency(pendingTotal)} eligible</span>
              <span className="text-content-subtle">/</span>
              <span className="text-content-subtle relative group cursor-help">
                {formatCurrency(ineligibleTotal)} ineligible
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                  <div className="bg-bg-default border border-border-default rounded-lg px-3 py-2 text-xs text-content-subtle shadow-xl whitespace-nowrap">
                    Payouts below minimum threshold or excluded
                  </div>
                </div>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>
              {selectedIds.length > 0 ? `Deselect All` : `Select All`}
            </Button>
            <Button size="sm" onClick={() => { setConfirmType('selected'); setShowConfirmModal(true) }} disabled={selectedIds.length === 0}>
              <CheckCircle2 className="mr-1.5 h-3 w-3" />
              Confirm Selected ({selectedIds.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selectedIds.length > 0 && mockPayouts.filter(p => !excludedIds.includes(p.id) && (p.status === 'pending' || p.status === 'processing')).every(p => selectedIds.includes(p.id))}
                    onChange={selectAll} className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Partner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Invoice</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-content-subtle uppercase">Amount</th>
                <th className="px-4 py-3 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-bg-subtle/50 transition-colors relative group"
                  onMouseEnter={() => setHoveredRow(p.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      disabled={excludedIds.includes(p.id) || p.status === 'completed' || p.status === 'failed' || p.status === 'canceled'}
                      className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary disabled:opacity-40" />
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm text-content-emphasis">{p.partner}</p>
                      <p className="text-xs text-content-subtle">{p.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-content-subtle">{p.date}</td>
                  <td className="px-4 py-4 text-sm text-content-subtle">{p.method}</td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[p.status]}>
                      {statusIcon[p.status]}
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {p.invoice ? (
                      <button onClick={() => toast.success(`Downloading ${p.invoice}...`)}
                        className="flex items-center gap-1 text-content-subtle hover:text-content-emphasis transition-colors">
                        <FileText className="h-3 w-3" />
                        {p.invoice}
                      </button>
                    ) : (
                      <span className="text-content-subtle/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-content-emphasis">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {(p.status === 'pending' || p.status === 'processing') && (
                      <button onClick={() => toggleExclude(p.id)}
                        className={`text-xs transition-all rounded px-1.5 py-0.5 ${hoveredRow === p.id ? 'opacity-100' : 'opacity-0'} ${excludedIds.includes(p.id) ? 'text-yellow-500 bg-yellow-500/10' : 'text-content-subtle hover:text-content-emphasis'}`}>
                        {excludedIds.includes(p.id) ? 'Included' : 'Exclude'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">Payout History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Invoice</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockPayouts.filter(p => p.status === 'completed' || p.status === 'failed' || p.status === 'canceled' || p.status === 'sent').map((p) => (
                  <tr key={p.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-content-emphasis">{p.date}</td>
                    <td className="px-6 py-4 text-sm text-content-subtle">{p.method}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[p.status]}>
                        {statusIcon[p.status]}
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {p.invoice ? (
                        <button onClick={() => toast.success(`Downloading ${p.invoice}...`)}
                          className="flex items-center gap-1 text-content-subtle hover:text-content-emphasis transition-colors">
                          <FileText className="h-3 w-3" />
                          {p.invoice}
                        </button>
                      ) : (
                        <span className="text-content-subtle/50">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-content-emphasis">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border-default bg-bg-default">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-content-subtle">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon
                return (
                  <div key={pm.id} className="flex items-start gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-subtle">
                      <Icon className="h-4 w-4 text-content-subtle" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-content-emphasis">{pm.name}</p>
                      <p className="text-xs text-content-subtle">{pm.description}</p>
                      {pm.connected && pm.value && (
                        <p className="mt-1 text-xs text-emerald-500">{pm.value}</p>
                      )}
                    </div>
                    {pm.id === 'stripe' ? (
                      <Button size="sm" variant={pm.connected ? 'outline' : 'default'} onClick={() => toast.success('Redirecting to Stripe Connect onboarding...')}>
                        {pm.connected ? 'Manage' : 'Connect'}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">Edit</Button>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-default">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-content-subtle">Payout Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <p className="text-xs text-content-subtle">
                  Payouts are held for {holdingPeriod} days after the sale. Minimum payout amount is {formatCurrency(minPayout)}. ACH fees are {payoutFeeACH}% and credit card fees are {payoutFeeCard}%.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-subtle">Holding Period</span>
                  <span className="text-sm font-medium text-content-emphasis">{holdingPeriod} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-subtle">Min. Payout</span>
                  <span className="text-sm font-medium text-content-emphasis">{formatCurrency(minPayout)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-subtle">ACH Fee</span>
                  <span className="text-sm font-medium text-content-emphasis">{payoutFeeACH}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-content-subtle">Credit Card Fee</span>
                  <span className="text-sm font-medium text-content-emphasis">{payoutFeeCard}%</span>
                </div>
              </div>
              <Separator className="bg-border-default" />
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowSettings(true)}>
                <Settings2 className="mr-1.5 h-3 w-3" />
                Payout Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showConfirmModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-content-emphasis">Confirm Payouts</h2>
              <p className="text-sm text-content-subtle">
                {confirmType === 'all'
                  ? `You are about to process all ${eligiblePayouts.length} eligible payout(s) totaling ${formatCurrency(pendingTotal)}.`
                  : `You are about to process ${selectedIds.length} selected payout(s).`}
              </p>
            </div>
            <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <p className="text-xs text-content-subtle">
                  This will initiate payouts to your partners. ACH fees ({payoutFeeACH}%) apply.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirmPayouts}>
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Confirm Payouts
              </Button>
            </div>
          </div>
        </>
      )}

      {showWithdraw && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdraw(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-content-emphasis">Withdraw Funds</h2>
              <p className="text-sm text-content-subtle">Available balance: {formatCurrency(1234.50)}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-subtle">Amount</label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-content-subtle">$</span>
                  <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-lg border border-input bg-bg-default py-3 pl-8 pr-4 text-lg text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                </div>
                <p className="mt-1 text-xs text-content-subtle">Min. withdrawal: {formatCurrency(minPayout)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-content-subtle">Payout Method</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {['promptpay', 'paypal', 'stripe'].map((m) => (
                    <button key={m} onClick={() => setWithdrawMethod(m)}
                      className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                        withdrawMethod === m
                          ? 'border-primary bg-primary/10 text-content-emphasis'
                          : 'border-input bg-bg-default text-content-subtle hover:border-muted-foreground'
                      }`}>
                      {m === 'promptpay' ? 'PromptPay' : m === 'paypal' ? 'PayPal' : 'Stripe'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleWithdraw}>
                  <HandCoins className="mr-1.5 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showSettings && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md animate-slide-up border-l border-border-default bg-bg-default shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
                <div>
                  <h2 className="text-base font-semibold text-content-emphasis">Payout Settings</h2>
                  <p className="text-xs text-content-subtle">Configure payout rules and fees</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-bg-subtlehover:text-content-emphasis transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-content-emphasis">Holding Period</label>
                  <p className="text-xs text-content-subtle mt-0.5">How long to hold payouts after a sale before they become eligible</p>
                  <div className="mt-2 grid grid-cols-6 gap-1.5">
                    {[0, 7, 14, 30, 60, 90].map(d => (
                      <button key={d} onClick={() => setHoldingPeriod(d)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                          holdingPeriod === d
                            ? 'border-primary bg-primary/10 text-content-emphasis'
                            : 'border-input bg-bg-default text-content-subtle hover:border-muted-foreground'
                        }`}>
                        {d}d
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-content-subtle bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
                    <Info className="h-3 w-3 text-blue-500 shrink-0" />
                    Payouts are held for {holdingPeriod} days after each sale to allow for returns and disputes.
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Minimum Payout Amount</label>
                  <p className="text-xs text-content-subtle mt-0.5">Minimum amount a partner must earn before a payout can be issued</p>
                  <div className="mt-2 grid grid-cols-5 gap-1.5">
                    {[0, 10, 20, 50, 100].map(a => (
                      <button key={a} onClick={() => setMinPayout(a)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                          minPayout === a
                            ? 'border-primary bg-primary/10 text-content-emphasis'
                            : 'border-input bg-bg-default text-content-subtle hover:border-muted-foreground'
                        }`}>
                        ${a}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border-default" />

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Payout Fee Configuration</label>
                  <p className="text-xs text-content-subtle mt-0.5">Percentage fee deducted from each payout</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="text-xs text-content-subtle">ACH / Bank Transfer Fee</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="range" min={0} max={15} step={0.5} value={payoutFeeACH} onChange={(e) => setPayoutFeeACH(Number(e.target.value))}
                          className="flex-1 accent-primary" />
                        <span className="text-sm font-medium text-content-emphasis w-10 text-right">{payoutFeeACH}%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-content-subtle">Credit Card Fee</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="range" min={0} max={15} step={0.5} value={payoutFeeCard} onChange={(e) => setPayoutFeeCard(Number(e.target.value))}
                          className="flex-1 accent-primary" />
                        <span className="text-sm font-medium text-content-emphasis w-10 text-right">{payoutFeeCard}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-default p-6">
                <Button className="w-full" onClick={() => { toast.success('Payout settings saved'); setShowSettings(false) }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
