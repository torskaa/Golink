'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MetricCard } from '@/components/dashboard/metric-card'
import {
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

const payouts = [
  { id: '1', affiliate: 'Jane Doe', email: 'jane@example.com', amount: 1234.50, status: 'pending', date: 'Jul 21, 2026', method: 'PromptPay' },
  { id: '2', affiliate: 'Jennie Kim', email: 'jennie@example.com', amount: 867.00, status: 'paid', date: 'Jul 20, 2026', method: 'PayPal' },
  { id: '3', affiliate: 'TikTok Creator', email: 'tiktok@example.com', amount: 2345.75, status: 'pending', date: 'Jul 19, 2026', method: 'Bank Transfer' },
  { id: '4', affiliate: 'Lisa Manoban', email: 'lisa@example.com', amount: 345.00, status: 'paid', date: 'Jul 15, 2026', method: 'PayPal' },
]

export default function AdminPayoutsPage() {
  const pendingTotal = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const paidTotal = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Payouts</h1>
        <p className="text-sm text-content-subtle">Manage affiliate payouts</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Pending Payouts" value={`$${pendingTotal.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Paid Total" value={`$${paidTotal.toFixed(2)}`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <MetricCard label="Pending Count" value={String(payouts.filter(p => p.status === 'pending').length)} icon={<Users className="h-4 w-4" />} />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Affiliate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-content-emphasis">{p.affiliate}</p>
                      <p className="text-xs text-content-subtle">{p.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-content-subtle">{p.date}</td>
                  <td className="px-6 py-4 text-sm text-content-subtle">{p.method}</td>
                  <td className="px-6 py-4">
                    <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-content-emphasis">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === 'pending' ? (
                      <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Mark Paid
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <XCircle className="mr-1 h-3 w-3" />
                        Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
