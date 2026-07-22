'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { formatNumber, formatCurrency } from '@/lib/utils'

interface ReferralDashboardProps {
  apiKey: string
  partnerId: string
  baseUrl?: string
  theme?: 'light' | 'dark'
}

interface DashboardData {
  clicks: number
  leads: number
  sales: number
  revenue: number
  payouts: number
  referralLink: string
  commissionRate: number
  customerDiscount: string
  recentActivity: Array<{
    id: string
    type: 'click' | 'lead' | 'sale'
    description: string
    amount?: number
    timestamp: string
  }>
}

const defaultData: DashboardData = {
  clicks: 2847,
  leads: 143,
  sales: 38,
  revenue: 12840,
  payouts: 9620,
  referralLink: 'ref.dubpartner.co/r/default',
  commissionRate: 15,
  customerDiscount: '20% off first purchase',
  recentActivity: [
    { id: '1', type: 'click', description: 'Clicked link for Summer Launch', timestamp: '2 min ago' },
    { id: '2', type: 'lead', description: 'New lead from Thailand', timestamp: '15 min ago' },
    { id: '3', type: 'sale', description: 'Sale completed - $240.00', amount: 240, timestamp: '1 hour ago' },
    { id: '4', type: 'click', description: 'Clicked link for New Collection', timestamp: '2 hours ago' },
    { id: '5', type: 'sale', description: 'Sale completed - $89.00', amount: 89, timestamp: '3 hours ago' },
    { id: '6', type: 'lead', description: 'New lead from Indonesia', timestamp: '5 hours ago' },
  ],
}

export function ReferralDashboard({
  apiKey,
  partnerId,
  baseUrl = 'http://localhost:3000',
  theme = 'dark',
}: ReferralDashboardProps) {
  const [data, setData] = useState<DashboardData>(defaultData)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/embed/partner-stats`, {
          headers: { 'x-api-key': apiKey, 'x-partner-id': partnerId },
        })
        if (res.ok) {
          const json = await res.json()
          setData((prev) => ({ ...prev, ...json }))
        }
      } catch {
        // use mock data as fallback
      }
    }
    fetchData()
  }, [apiKey, partnerId, baseUrl])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(data.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [data.referralLink])

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Referral Link', text: data.referralLink })
      } catch { /* ignore */ }
    } else {
      handleCopy()
    }
  }, [data.referralLink, handleCopy])

  const isLight = theme === 'light'

  return (
    <div
      className={cn(
        'w-full rounded-xl border p-5 font-sans transition-colors',
        isLight
          ? 'border-gray-200 bg-white text-gray-900'
          : 'border-[#1f1f23] bg-[#131317] text-[#fafafa]'
      )}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style jsx>{`
        .embed-dashboard {
          --bg-bg-default ${isLight ? '#ffffff' : '#131317'};
          --bg-card-hover: ${isLight ? '#f9fafb' : '#1c1c21'};
          --border: ${isLight ? '#e5e7eb' : '#1f1f23'};
          --text: ${isLight ? '#111827' : '#fafafa'};
          --muted: ${isLight ? '#6b7280' : '#a1a1aa'};
          --primary: ${isLight ? '#2563eb' : '#3b82f6'};
        }
      `}</style>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={cn('text-lg font-semibold', isLight ? 'text-gray-900' : 'text-[#fafafa]')}>
              Referral Dashboard
            </h2>
            <p className={cn('text-xs', isLight ? 'text-gray-500' : 'text-[#a1a1aa]')}>
              Partner ID: {partnerId.slice(0, 8)}...
            </p>
          </div>
          <button
            onClick={handleShare}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              isLight
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-[#1c1c21] text-[#a1a1aa] hover:bg-[#1f1f23] hover:text-[#fafafa]'
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            Share
          </button>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {([
            { label: 'Clicks', value: formatNumber(data.clicks) },
            { label: 'Leads', value: formatNumber(data.leads) },
            { label: 'Sales', value: formatNumber(data.sales) },
            { label: 'Revenue', value: formatCurrency(data.revenue) },
            { label: 'Payouts', value: formatCurrency(data.payouts) },
          ] as const).map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'rounded-lg border p-3 transition-colors',
                isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1f1f23] bg-[#1c1c21]'
              )}
            >
              <p className={cn('text-[10px] font-medium uppercase tracking-wider', isLight ? 'text-gray-500' : 'text-[#a1a1aa]')}>
                {stat.label}
              </p>
              <p className={cn('mt-1 text-lg font-bold', isLight ? 'text-gray-900' : 'text-[#fafafa]')}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className={cn('flex items-center gap-3 rounded-lg border p-3', isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1f1f23] bg-[#1c1c21]')}>
          <div className="flex-1 min-w-0">
            <p className={cn('text-xs font-medium', isLight ? 'text-gray-500' : 'text-[#a1a1aa]')}>Your Referral Link</p>
            <p className={cn('mt-0.5 truncate text-sm font-mono', isLight ? 'text-gray-900' : 'text-[#fafafa]')}>
              {data.referralLink}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              copied
                ? 'bg-emerald-500/20 text-emerald-500'
                : isLight
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-[#1f1f23] text-[#a1a1aa] hover:bg-[#27272b] hover:text-[#fafafa]'
            )}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className={cn('rounded-lg border p-3', isLight ? 'border-gray-200 bg-gray-50' : 'border-[#1f1f23] bg-[#1c1c21]')}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-xs font-medium', isLight ? 'text-gray-500' : 'text-[#a1a1aa]')}>Commission Rate</p>
              <p className={cn('text-base font-bold', isLight ? 'text-gray-900' : 'text-[#fafafa]')}>
                {data.commissionRate}%
              </p>
            </div>
            <div className="text-right">
              <p className={cn('text-xs font-medium', isLight ? 'text-gray-500' : 'text-[#a1a1aa]')}>Customer Discount</p>
              <p className={cn('text-base font-bold', isLight ? 'text-gray-900' : 'text-[#fafafa]')}>
                {data.customerDiscount}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className={cn('mb-2 text-sm font-medium', isLight ? 'text-gray-700' : 'text-[#fafafa]')}>
            Recent Activity
          </h3>
          <div className={cn('divide-y rounded-lg border', isLight ? 'border-gray-200 divide-gray-200' : 'border-[#1f1f23] divide-[#1f1f23]')}>
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className={cn('flex items-center gap-3 px-3 py-2.5', isLight ? 'hover:bg-gray-50' : 'hover:bg-[#1c1c21]')}>
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                  activity.type === 'click' && 'bg-blue-500/10 text-blue-500',
                  activity.type === 'lead' && 'bg-amber-500/10 text-amber-500',
                  activity.type === 'sale' && 'bg-emerald-500/10 text-emerald-500',
                )}>
                  {activity.type === 'click' && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A11.25 11.25 0 113 9.75c0 5.34 3.727 9.818 8.692 10.93" />
                    </svg>
                  )}
                  {activity.type === 'lead' && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  )}
                  {activity.type === 'sale' && (
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs', isLight ? 'text-gray-700' : 'text-[#fafafa]')}>{activity.description}</p>
                </div>
                <span className={cn('shrink-0 text-[10px]', isLight ? 'text-gray-400' : 'text-[#a1a1aa]')}>{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
