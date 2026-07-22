'use client'

import { useState } from 'react'
import { AnalyticsAreaChart } from '@/components/charts/area-chart'
import { BreakdownList } from '@/components/charts/breakdown-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ChartSkeleton } from '@/components/ui/skeleton'
import { Download, Command } from 'lucide-react'

const mockTimeseries = Array.from({ length: 24 }, (_, i) => ({
  date: `2026-07-22 ${String(i).padStart(2, '0')}:00:00`,
  clicks: Math.floor(Math.random() * 200) + 50,
}))

const mockCountries = [
  { country: 'Thailand', clicks: 3842 },
  { country: 'Indonesia', clicks: 2103 },
  { country: 'Vietnam', clicks: 1456 },
  { country: 'Philippines', clicks: 987 },
  { country: 'Malaysia', clicks: 654 },
]

const mockReferrers = [
  { referer: 'TikTok', clicks: 4521 },
  { referer: 'Facebook', clicks: 2340 },
  { referer: 'Direct', clicks: 1876 },
  { referer: 'Instagram', clicks: 1234 },
  { referer: 'Twitter', clicks: 567 },
]

const mockDevices = [
  { device: 'Mobile', clicks: 6543 },
  { device: 'Desktop', clicks: 3245 },
  { device: 'Tablet', clicks: 765 },
]

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Analytics</h1>
          <p className="text-sm text-content-subtle">Detailed performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
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

      <div className="grid grid-cols-3 gap-6">
        <Card className="border-border-default bg-bg-default col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsAreaChart data={mockTimeseries} />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              title=""
              items={mockReferrers.map((r) => ({ name: r.referer, value: r.clicks }))}
              maxValue={Math.max(...mockReferrers.map((r) => r.clicks))}
            />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              title=""
              items={mockCountries.map((c) => ({ name: c.country, value: c.clicks }))}
              maxValue={Math.max(...mockCountries.map((c) => c.clicks))}
            />
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-content-subtle">Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownList
              title=""
              items={mockDevices.map((d) => ({ name: d.device, value: d.clicks }))}
              maxValue={Math.max(...mockDevices.map((d) => d.clicks))}
              formatValue={(v) => `${((v / mockDevices.reduce((s, d) => s + d.clicks, 0)) * 100).toFixed(1)}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
