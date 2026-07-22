'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/dashboard/metric-card'
import { AnalyticsAreaChart } from '@/components/charts/area-chart'
import { MetricCardSkeleton, ChartSkeleton } from '@/components/ui/skeleton'
import { formatNumber, formatCurrency } from '@/lib/utils'
import {
  Users,
  Building2,
  Megaphone,
  Link2,
  MousePointerClick,
  DollarSign,
  RefreshCw,
} from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
    if (status === 'authenticated') setTimeout(() => setLoading(false), 300)
  }, [status, session, router])

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Admin Overview</h1>
        <p className="text-sm text-content-subtle">System-wide analytics and management</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={formatNumber(128)} change={12} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Workspaces" value={formatNumber(24)} icon={<Building2 className="h-4 w-4" />} />
        <MetricCard label="Campaigns" value={formatNumber(56)} change={8} icon={<Megaphone className="h-4 w-4" />} />
        <MetricCard label="Links" value={formatNumber(342)} change={24} icon={<Link2 className="h-4 w-4" />} />
        <MetricCard label="Total Clicks" value={formatNumber(12450)} change={32} icon={<MousePointerClick className="h-4 w-4" />} />
        <MetricCard label="Total Leads" value={formatNumber(456)} change={15} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Revenue" value={formatCurrency(12340)} change={28} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Pending Payouts" value={formatCurrency(3450)} icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Clicks (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsAreaChart data={mockTimeseries(24)} />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">User Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { role: 'Admin', count: 2 },
              { role: 'Brand', count: 18 },
              { role: 'Affiliate', count: 108 },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between">
                <span className="text-sm text-content-subtle">{r.role}</span>
                <span className="text-sm font-medium text-content-emphasis">{r.count}</span>
              </div>
            ))}
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
