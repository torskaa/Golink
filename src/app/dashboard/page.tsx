'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MetricCard } from '@/components/dashboard/metric-card'
import { AnalyticsAreaChart } from '@/components/charts/area-chart'
import { BreakdownList } from '@/components/charts/breakdown-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { MetricCardSkeleton, ChartSkeleton } from '@/components/ui/skeleton'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { CreateLinkModal } from '@/components/create-link-modal'
import {
  MousePointerClick,
  Users,
  DollarSign,
  TrendingUp,
  Link2,
  HandCoins,
  Megaphone,
  Command,
  RefreshCw,
} from 'lucide-react'

interface AnalyticsData {
  timeseries: Array<{ date: string; clicks: number }>
  topCountries: Array<{ country: string; clicks: number }>
  topReferrers: Array<{ referer: string; clicks: number }>
  devicesBreakdown: Array<{ device: string; clicks: number }>
  summary: {
    totalClicks: number
    totalLeads: number
    conversionRate: number
    totalRevenue: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [workspaceId, setWorkspaceId] = useState('')
  const role = session?.user?.role
  const isBrand = role === 'BRAND'

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/workspaces')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkspaceId(data[0].id)
        }
      })
      .catch(() => {})
  }, [status])

  const fetchAnalytics = useCallback(async () => {
    if (!workspaceId) return
    try {
      const res = await fetch(`/api/analytics?workspaceId=${workspaceId}&range=${range}`)
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch {
      // use mock fallback
    }
  }, [range, workspaceId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchAnalytics().finally(() => setLoading(false))
    }
  }, [status, router, fetchAnalytics])

  const s = analytics?.summary

  if (status === 'unauthenticated') return null
  if (status === 'loading' || loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse" />
            <div className="mt-2 h-4 w-64 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (isBrand) {
    return <BrandDashboard range={range} setRange={setRange} analytics={analytics} summary={s} />
  }

  return <CreatorDashboard range={range} setRange={setRange} />
}

function BrandDashboard({
  range,
  setRange,
  analytics,
  summary,
}: {
  range: string
  setRange: (r: string) => void
  analytics: AnalyticsData | null
  summary?: { totalClicks: number; totalLeads: number; conversionRate: number; totalRevenue: number }
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Brand Dashboard</h1>
          <p className="text-sm text-content-subtle">Manage your campaigns & track performance</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-content-subtle/60">
            <Kbd>C</Kbd> Create
          </span>
          <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle/50 p-0.5">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  range === r
                    ? 'bg-bg-default text-content-emphasis shadow-sm'
                    : 'text-content-subtle hover:text-content-emphasis'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Total Clicks"
          value={summary ? formatNumber(summary.totalClicks) : '12.4K'}
          change={12}
          icon={<MousePointerClick className="h-4 w-4" />}
        />
        <MetricCard label="Active Campaigns" value="3" icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard
          label="Total Leads"
          value={summary ? String(summary.totalLeads) : '156'}
          change={8}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : '$12,340'}
          change={24}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Clicks Over Time</CardTitle></CardHeader>
          <CardContent>
            <AnalyticsAreaChart data={analytics?.timeseries || mockTimeseries(24)} />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Top Campaigns</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Summer Launch 2026', value: 8421 },
              { name: 'New Collection', value: 4532 },
              { name: 'TikTok Viral', value: 2103 },
              { name: 'Flash Sale', value: 987 },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-3 w-3 text-primary" />
                  <span className="text-sm text-content-subtle">{c.name}</span>
                </div>
                <span className="text-sm font-medium text-content-emphasis">{c.value.toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Top Referrers</CardTitle></CardHeader>
          <CardContent>
            <BreakdownList
              title=""
              items={(analytics?.topReferrers || [])?.map((r) => ({ name: r.referer, value: r.clicks }))?.length
                ? (analytics?.topReferrers || []).map((r) => ({ name: r.referer, value: r.clicks }))
                : [
                    { name: 'TikTok', value: 4521 },
                    { name: 'Facebook', value: 2340 },
                    { name: 'Direct', value: 1876 },
                    { name: 'Instagram', value: 1234 },
                    { name: 'Twitter', value: 567 },
                  ]
              }
              maxValue={Math.max(...((analytics?.topReferrers || [{ clicks: 4521 }, { clicks: 2340 }, { clicks: 1876 }]).map(r => r.clicks)))}
            />
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Top Countries</CardTitle></CardHeader>
          <CardContent>
            <BreakdownList
              title=""
              items={(analytics?.topCountries || []).map((c) => ({ name: c.country, value: c.clicks })).length
                ? (analytics?.topCountries || []).map((c) => ({ name: c.country, value: c.clicks }))
                : [
                    { name: 'Thailand', value: 5234 },
                    { name: 'Indonesia', value: 3210 },
                    { name: 'Vietnam', value: 1456 },
                    { name: 'Philippines', value: 987 },
                    { name: 'Malaysia', value: 654 },
                  ]
              }
              maxValue={Math.max(...((analytics?.topCountries || [{ clicks: 5234 }, { clicks: 3210 }]).map(c => c.clicks)))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CreatorDashboard({ range, setRange }: { range: string; setRange: (r: string) => void }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Creator Dashboard</h1>
          <p className="text-sm text-content-subtle">Track your performance & commissions</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle/50 p-0.5">
          {(['24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r
                  ? 'bg-bg-default text-content-emphasis shadow-sm'
                  : 'text-content-subtle hover:text-content-emphasis'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Clicks" value="3,210" change={18} icon={<MousePointerClick className="h-4 w-4" />} />
        <MetricCard label="Conversions" value="45" change={12} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Commission Rate" value="15%" icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="Total Earned" value="$3,450" change={32} icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Your Clicks Over Time</CardTitle></CardHeader>
          <CardContent>
            <AnalyticsAreaChart data={mockTimeseries(24)} />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Recent Commissions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { campaign: 'Summer Launch', amount: 150.00, date: 'Jul 21' },
              { campaign: 'New Collection', amount: 89.50, date: 'Jul 20' },
              { campaign: 'TikTok Campaign', amount: 234.00, date: 'Jul 19' },
              { campaign: 'Flash Sale', amount: 45.00, date: 'Jul 18' },
            ].map((c) => (
              <div key={c.date} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-content-emphasis">{c.campaign}</p>
                  <p className="text-xs text-content-subtle">{c.date}</p>
                </div>
                <span className="text-sm font-medium text-emerald-500">${c.amount.toFixed(2)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Your Top Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { link: 'summer-sale-jane', clicks: 1234, earned: 185.10 },
              { link: 'jennie-fav', clicks: 892, earned: 133.80 },
              { link: 'tiktok-review', clicks: 2451, earned: 367.65 },
            ].map((l) => (
              <div key={l.link} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-3 w-3 text-primary" />
                  <span className="text-sm text-content-subtle">/r/{l.link}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-content-emphasis">{l.clicks.toLocaleString()} clicks</p>
                  <p className="text-xs text-emerald-500">+${l.earned.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-sm font-medium text-content-subtle">Pending Payout</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <HandCoins className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="mt-4 text-3xl font-bold text-content-emphasis">$1,234.50</p>
              <p className="mt-1 text-sm text-content-subtle">Available for withdrawal</p>
              <Button className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700">
                Request Payout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function mockTimeseries(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    date: `2026-07-22 ${String(i).padStart(2, '0')}:00:00`,
    clicks: Math.floor(Math.random() * 200) + 50,
  }))
}
