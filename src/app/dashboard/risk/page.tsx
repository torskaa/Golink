'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/dashboard/metric-card'
import { formatNumber } from '@/lib/utils'
import {
  ShieldAlert, AlertTriangle, Ban, Search, Filter, Eye, Flag,
  Users, Smartphone, UserX, Copy, ChevronDown, X
} from 'lucide-react'
import { toast } from 'sonner'

interface RiskPartner {
  id: string
  name: string
  email: string
  riskScore: number
  flags: string[]
  status: string
  totalClicks: number
  totalConversions: number
  revenue: number
}

const mockPartners: RiskPartner[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', riskScore: 85, flags: ['paid_traffic', 'self_referral'], status: 'active', totalClicks: 12453, totalConversions: 23, revenue: 3450 },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', riskScore: 12, flags: [], status: 'active', totalClicks: 2301, totalConversions: 89, revenue: 12300 },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', riskScore: 72, flags: ['duplicate'], status: 'flagged', totalClicks: 8902, totalConversions: 12, revenue: 890 },
  { id: '4', name: 'Lisa Wang', email: 'lisa@example.com', riskScore: 45, flags: ['paid_traffic'], status: 'active', totalClicks: 5678, totalConversions: 45, revenue: 6700 },
  { id: '5', name: 'Tom Brown', email: 'tom@example.com', riskScore: 8, flags: [], status: 'active', totalClicks: 1234, totalConversions: 34, revenue: 4500 },
  { id: '6', name: 'Emma Wilson', email: 'emma@example.com', riskScore: 95, flags: ['self_referral', 'duplicate', 'paid_traffic'], status: 'banned', totalClicks: 34210, totalConversions: 3, revenue: 120 },
  { id: '7', name: 'Alex Kim', email: 'alex@example.com', riskScore: 28, flags: [], status: 'active', totalClicks: 3456, totalConversions: 67, revenue: 8900 },
  { id: '8', name: 'Rachel Green', email: 'rachel@example.com', riskScore: 58, flags: ['duplicate'], status: 'active', totalClicks: 6789, totalConversions: 28, revenue: 3400 },
]

const riskLevels = [
  { label: 'All', value: 'all' },
  { label: 'Low (< 30)', value: 'low' },
  { label: 'Medium (30-70)', value: 'medium' },
  { label: 'High (> 70)', value: 'high' },
]

const flagTypes = [
  { label: 'All Flags', value: 'all' },
  { label: 'Paid Traffic', value: 'paid_traffic' },
  { label: 'Self-Referral', value: 'self_referral' },
  { label: 'Duplicate', value: 'duplicate' },
]

function getRiskColor(score: number): string {
  if (score < 30) return 'text-emerald-500'
  if (score <= 70) return 'text-yellow-500'
  return 'text-red-500'
}

function getRiskBg(score: number): string {
  if (score < 30) return 'bg-emerald-500/10'
  if (score <= 70) return 'bg-yellow-500/10'
  return 'bg-red-500/10'
}

function getRiskBarColor(score: number): string {
  if (score < 30) return 'bg-emerald-500'
  if (score <= 70) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getFlagLabel(flag: string): string {
  switch (flag) {
    case 'paid_traffic': return 'Paid Traffic'
    case 'self_referral': return 'Self-Referral'
    case 'duplicate': return 'Duplicate'
    default: return flag
  }
}

function getFlagBadgeVariant(flag: string): 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline' {
  switch (flag) {
    case 'paid_traffic': return 'warning'
    case 'self_referral': return 'destructive'
    case 'duplicate': return 'secondary'
    default: return 'outline'
  }
}

export default function RiskMonitoringPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [riskFilter, setRiskFilter] = useState('all')
  const [flagFilter, setFlagFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'unauthenticated') return null

  const flaggedPartners = mockPartners.filter(p => p.flags.length > 0)
  const paidTrafficDetections = mockPartners.filter(p => p.flags.includes('paid_traffic'))
  const selfReferrals = mockPartners.filter(p => p.flags.includes('self_referral'))
  const duplicateAccounts = mockPartners.filter(p => p.flags.includes('duplicate'))

  const filteredPartners = mockPartners.filter(p => {
    if (riskFilter === 'low' && (p.riskScore < 0 || p.riskScore >= 30)) return false
    if (riskFilter === 'medium' && (p.riskScore < 30 || p.riskScore > 70)) return false
    if (riskFilter === 'high' && (p.riskScore <= 70)) return false
    if (flagFilter !== 'all' && !p.flags.includes(flagFilter)) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Risk Monitoring</h1>
        <p className="text-sm text-content-subtle">Detect fraudulent activity and monitor partner risk scores</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border-default bg-bg-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-content-subtle">Flagged Partners</p>
              <ShieldAlert className="h-4 w-4 text-red-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content-emphasis">{flaggedPartners.length}</p>
            <p className="text-xs text-content-subtle mt-1">{((flaggedPartners.length / mockPartners.length) * 100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-content-subtle">Paid Traffic Detections</p>
              <Smartphone className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content-emphasis">{paidTrafficDetections.length}</p>
            <p className="text-xs text-content-subtle mt-1">Suspected paid traffic sources</p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-content-subtle">Self-Referrals</p>
              <UserX className="h-4 w-4 text-destructive" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content-emphasis">{selfReferrals.length}</p>
            <p className="text-xs text-content-subtle mt-1">Self-referral attempts</p>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-content-subtle">Duplicate Accounts</p>
              <Copy className="h-4 w-4 text-orange-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-content-emphasis">{duplicateAccounts.length}</p>
            <p className="text-xs text-content-subtle mt-1">Potential duplicate accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">Partners Risk Assessment</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-content-subtle" />
                <input type="text" placeholder="Search partners..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 rounded-md border border-input bg-bg-default py-1.5 pl-8 pr-3 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 px-6 py-2 border-b border-border-default bg-bg-subtle/20">
            <Filter className="h-3 w-3 text-content-subtle" />
            <div className="flex items-center gap-1.5">
              {riskLevels.map(r => (
                <button key={r.value} onClick={() => setRiskFilter(r.value)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    riskFilter === r.value
                      ? 'bg-bg-default text-content-emphasis shadow-sm border border-border-default'
                      : 'text-content-subtle hover:text-content-emphasis'
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
            <span className="text-content-subtle/30 mx-1">|</span>
            <div className="flex items-center gap-1.5">
              {flagTypes.map(f => (
                <button key={f.value} onClick={() => setFlagFilter(f.value)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    flagFilter === f.value
                      ? 'bg-bg-default text-content-emphasis shadow-sm border border-border-default'
                      : 'text-content-subtle hover:text-content-emphasis'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Partner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Flags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Clicks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Conversions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPartners.map((p) => (
                <tr key={p.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getRiskBg(p.riskScore)}`}>
                        <span className={`text-xs font-bold ${getRiskColor(p.riskScore)}`}>{p.riskScore}</span>
                      </div>
                      <div>
                        <p className="text-sm text-content-emphasis">{p.name}</p>
                        <p className="text-xs text-content-subtle">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[120px] h-2 rounded-full bg-bg-subtle overflow-hidden">
                        <div className={`h-full rounded-full ${getRiskBarColor(p.riskScore)} transition-all`} style={{ width: `${p.riskScore}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${getRiskColor(p.riskScore)}`}>{p.riskScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.flags.length === 0 ? (
                        <span className="text-xs text-content-subtle/50">—</span>
                      ) : (
                        p.flags.map(flag => (
                          <Badge key={flag} variant={getFlagBadgeVariant(flag)} className="text-[10px]">
                            {getFlagLabel(flag)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-content-subtle">{formatNumber(p.totalClicks)}</td>
                  <td className="px-6 py-4 text-sm text-content-subtle">{p.totalConversions}</td>
                  <td className="px-6 py-4">
                    <Badge variant={p.status === 'active' ? 'success' : p.status === 'flagged' ? 'warning' : 'destructive'}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.success(`Reviewing ${p.name}`)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.success(`Flagging ${p.name}`)}>
                        <Flag className="h-3.5 w-3.5 text-yellow-500" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast.success(`Banned ${p.name}`)}>
                        <Ban className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPartners.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-content-subtle/30 mb-3" />
              <p className="text-sm text-content-subtle">No matching partners found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
