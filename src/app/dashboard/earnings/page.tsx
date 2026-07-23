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
import { DollarSign, TrendingUp, HandCoins, ArrowUpRight, Download, CheckCircle2, X } from 'lucide-react'
import { toast } from 'sonner'

const transactions = [
  { id: '1', campaign: 'Summer Launch 2026', amount: 150.00, date: 'Jul 21, 2026', status: 'completed' },
  { id: '2', campaign: 'New Collection', amount: 89.50, date: 'Jul 20, 2026', status: 'completed' },
  { id: '3', campaign: 'TikTok Campaign', amount: 234.00, date: 'Jul 19, 2026', status: 'completed' },
  { id: '4', campaign: 'Flash Sale', amount: 45.00, date: 'Jul 18, 2026', status: 'pending' },
  { id: '5', campaign: 'Summer Launch 2026', amount: 67.50, date: 'Jul 17, 2026', status: 'completed' },
  { id: '6', campaign: 'New Collection', amount: 120.00, date: 'Jul 16, 2026', status: 'pending' },
]

export default function EarningsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [paypalEmail, setPaypalEmail] = useState('creator@example.com')
  const [promptpayId, setPromptpayId] = useState('089-xxx-xxxx')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showPaymentInfo, setShowPaymentInfo] = useState(false)
  const [editPaypal, setEditPaypal] = useState('')
  const [editPromptpay, setEditPromptpay] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'AFFILIATE' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'unauthenticated' || (session && session.user.role !== 'AFFILIATE' && session.user.role !== 'ADMIN')) return null

  const totalEarned = transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0)
  const pendingAmount = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

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

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Payout Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-content-subtle">Available Balance</label>
              <p className="text-2xl font-bold text-content-emphasis">{formatCurrency(1234.50)}</p>
            </div>
            <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setShowWithdraw(true)}>
              <HandCoins className="mr-1.5 h-4 w-4" />
              Withdraw All
            </Button>
            <Separator className="bg-border-default" />
            <div>
              <label className="text-xs font-medium text-content-subtle">PromptPay ID</label>
              <p className="text-sm text-content-emphasis">{promptpayId}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-content-subtle">PayPal Email</label>
              <p className="text-sm text-content-emphasis">{paypalEmail}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => { setEditPaypal(paypalEmail); setEditPromptpay(promptpayId); setShowPaymentInfo(true) }}>
              Update Payment Info
            </Button>
          </CardContent>
        </Card>
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
                <input type="number" defaultValue={1234.50}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-lg text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-content-subtle">Withdraw to</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button className="rounded-lg border border-primary bg-primary/10 px-3 py-2.5 text-xs font-medium text-content-emphasis">PromptPay: {promptpayId}</button>
                  <button className="rounded-lg border border-input bg-bg-default px-3 py-2.5 text-xs font-medium text-content-subtle hover:border-muted-foreground">PayPal: {paypalEmail}</button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => { toast.success('Withdrawal request submitted!'); setShowWithdraw(false) }}>
                  <HandCoins className="mr-1.5 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {showPaymentInfo && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentInfo(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-scale-in rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-content-emphasis">Payment Info</h2>
              <p className="text-sm text-content-subtle">Update your payout methods</p>
              <button onClick={() => setShowPaymentInfo(false)} className="absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-subtle">PayPal Email</label>
                <input type="email" value={editPaypal} onChange={(e) => setEditPaypal(e.target.value)} placeholder="email@example.com"
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-content-subtle">PromptPay ID</label>
                <input type="text" value={editPromptpay} onChange={(e) => setEditPromptpay(e.target.value)} placeholder="Phone number or PromptPay ID"
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowPaymentInfo(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => { setPaypalEmail(editPaypal); setPromptpayId(editPromptpay); setShowPaymentInfo(false); toast.success('Payment info updated') }}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
