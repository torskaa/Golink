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
  DollarSign, TrendingUp, HandCoins, ArrowUpRight, Download, CheckCircle2, X,
  Wallet, Banknote, Star,
} from 'lucide-react'
import { toast } from 'sonner'

const transactions = [
  { id: '1', campaign: 'Summer Launch 2026', amount: 150.00, date: 'Jul 21, 2026', status: 'completed' },
  { id: '2', campaign: 'New Collection', amount: 89.50, date: 'Jul 20, 2026', status: 'completed' },
  { id: '3', campaign: 'TikTok Campaign', amount: 234.00, date: 'Jul 19, 2026', status: 'completed' },
  { id: '4', campaign: 'Flash Sale', amount: 45.00, date: 'Jul 18, 2026', status: 'pending' },
  { id: '5', campaign: 'Summer Launch 2026', amount: 67.50, date: 'Jul 17, 2026', status: 'completed' },
  { id: '6', campaign: 'New Collection', amount: 120.00, date: 'Jul 16, 2026', status: 'pending' },
]

interface PaymentMethod {
  id: string
  name: string
  icon: typeof Wallet
  value: string
  connected: boolean
}

export default function EarningsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [withdrawMethod, setWithdrawMethod] = useState('promptpay')
  const [withdrawAmount, setWithdrawAmount] = useState('1234.50')
  const [showConnectPaypal, setShowConnectPaypal] = useState(false)
  const [showConnectPromptpay, setShowConnectPromptpay] = useState(false)
  const [paypalInput, setPaypalInput] = useState('')
  const [promptpayInput, setPromptpayInput] = useState('')

  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: 'paypal', name: 'PayPal', icon: Wallet, value: 'creator@example.com', connected: true },
    { id: 'promptpay', name: 'PromptPay (Thailand)', icon: Banknote, value: '089-xxx-xxxx', connected: true },
    { id: 'stripe', name: 'Stripe Connect', icon: DollarSign, value: '', connected: false },
  ])
  const [defaultMethod, setDefaultMethod] = useState('promptpay')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'AFFILIATE' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'unauthenticated' || (session && session.user.role !== 'AFFILIATE' && session.user.role !== 'ADMIN')) return null

  const totalEarned = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

  const handleConnectPaypal = () => {
    if (!paypalInput.includes('@')) { toast.error('Enter a valid PayPal email'); return }
    setMethods(prev => prev.map(m => m.id === 'paypal' ? { ...m, value: paypalInput, connected: true } : m))
    setShowConnectPaypal(false)
    setPaypalInput('')
    toast.success('PayPal connected')
  }

  const handleConnectPromptpay = () => {
    if (!promptpayInput.trim()) { toast.error('Enter your PromptPay ID'); return }
    setMethods(prev => prev.map(m => m.id === 'promptpay' ? { ...m, value: promptpayInput, connected: true } : m))
    setShowConnectPromptpay(false)
    setPromptpayInput('')
    toast.success('PromptPay connected')
  }

  const handleDisconnect = (id: string) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, value: '', connected: false } : m))
    if (defaultMethod === id) {
      const remaining = methods.filter(m => m.id !== id && m.connected)
      if (remaining.length > 0) setDefaultMethod(remaining[0].id)
    }
    toast.success('Payment method disconnected')
  }

  const handleWithdraw = () => {
    const method = methods.find(m => m.id === withdrawMethod)
    if (!method?.connected) { toast.error('Selected payment method is not connected'); return }
    toast.success(`Withdrawal request for $${withdrawAmount} via ${method.name} submitted!`)
    setShowWithdraw(false)
  }

  const defaultMethodObj = methods.find(m => m.id === defaultMethod)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Earnings</h1>
        <p className="text-sm text-content-subtle">Track your commissions and payouts</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Earned" value={formatCurrency(totalEarned)} change={24} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Pending" value={formatCurrency(pendingAmount)} icon={<HandCoins className="h-4 w-4" />} />
        <MetricCard label="This Month" value={formatCurrency(345)} change={12} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="All Time" value={formatCurrency(3450)} change={32} icon={<ArrowUpRight className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">Commission History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-content-emphasis">{t.campaign}</td>
                    <td className="px-6 py-4 text-sm text-content-subtle">{t.date}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.status === 'completed' ? 'success' : 'warning'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-emerald-500">
                      +{formatCurrency(t.amount)}
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
              <CardTitle className="text-sm font-medium text-content-subtle">Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold text-content-emphasis">{formatCurrency(1234.50)}</p>
                <p className="text-xs text-content-subtle mt-1">Available for withdrawal</p>
              </div>
              <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => { setWithdrawMethod(defaultMethod); setShowWithdraw(true) }}>
                <HandCoins className="mr-1.5 h-4 w-4" />
                Withdraw All
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border-default bg-bg-default">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-content-subtle">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {methods.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                    defaultMethod === m.id
                      ? 'border-primary bg-primary/5'
                      : m.connected
                        ? 'border-border-default bg-bg-subtle/30'
                        : 'border-dashed border-border-default bg-transparent'
                  }`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-subtle">
                      <Icon className="h-4 w-4 text-content-subtle" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-content-emphasis">{m.name}</p>
                        {defaultMethod === m.id && m.connected && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {m.connected ? (
                        <>
                          <p className="text-xs text-content-subtle mt-0.5">{m.value}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {defaultMethod !== m.id && (
                              <button onClick={() => setDefaultMethod(m.id)}
                                className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                                Set as default
                              </button>
                            )}
                            <button onClick={() => handleDisconnect(m.id)}
                              className="text-[11px] text-content-subtle hover:text-destructive transition-colors">
                              Disconnect
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-1.5">
                          {m.id === 'stripe' ? (
                            <Button size="sm" variant="outline" className="text-xs" onClick={() => toast.success('Redirecting to Stripe Connect...')}>
                              Connect Stripe
                            </Button>
                          ) : m.id === 'paypal' ? (
                            <button onClick={() => setShowConnectPaypal(true)}
                              className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                              Connect PayPal
                            </button>
                          ) : (
                            <button onClick={() => setShowConnectPromptpay(true)}
                              className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                              Connect PromptPay
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {defaultMethodObj && defaultMethodObj.connected && (
            <Card className="border-border-default bg-bg-default">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-content-subtle">Default Payout Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <defaultMethodObj.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-content-emphasis">{defaultMethodObj.name}</p>
                    <p className="text-xs text-content-subtle">{defaultMethodObj.value}</p>
                  </div>
                  <Star className="ml-auto h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

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
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full rounded-lg border border-input bg-bg-default py-3 pl-8 pr-4 text-lg text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-content-subtle">Withdraw to</label>
                <div className="mt-1.5 space-y-2">
                  {methods.filter(m => m.connected).map((m) => {
                    const Icon = m.icon
                    return (
                      <button key={m.id} onClick={() => setWithdrawMethod(m.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                          withdrawMethod === m.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border-default bg-bg-default hover:border-muted-foreground'
                        }`}>
                        <Icon className="h-4 w-4 text-content-subtle shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-content-emphasis">{m.name}</p>
                          <p className="text-xs text-content-subtle truncate">{m.value}</p>
                        </div>
                        {defaultMethod === m.id && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                        )}
                        {withdrawMethod === m.id && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </button>
                    )
                  })}
                  {methods.filter(m => m.connected).length === 0 && (
                    <p className="text-xs text-content-subtle text-center py-4">No payment methods connected. Add one first.</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleWithdraw} disabled={!methods.find(m => m.id === withdrawMethod)?.connected}>
                  <HandCoins className="mr-1.5 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showConnectPaypal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowConnectPaypal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-content-emphasis">Connect PayPal</h2>
              <p className="text-sm text-content-subtle">Enter your PayPal email to receive payouts</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-subtle">PayPal Email</label>
                <input type="email" value={paypalInput} onChange={e => setPaypalInput(e.target.value)} placeholder="email@example.com"
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConnectPaypal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleConnectPaypal}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showConnectPromptpay && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowConnectPromptpay(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-content-emphasis">Connect PromptPay</h2>
              <p className="text-sm text-content-subtle">Enter your phone number or PromptPay ID</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-subtle">PromptPay ID</label>
                <input type="text" value={promptpayInput} onChange={e => setPromptpayInput(e.target.value)} placeholder="081-234-5678"
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConnectPromptpay(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleConnectPromptpay}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
