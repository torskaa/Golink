'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from '@/components/dashboard/metric-card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  Users, DollarSign, TrendingUp, ShoppingCart, Search, ChevronDown, ChevronRight,
  MousePointerClick, Mail, Phone, MapPin, Globe, Clock, ExternalLink, Link2
} from 'lucide-react'
import { toast } from 'sonner'

interface JourneyEvent {
  id: string
  type: 'click' | 'lead' | 'sale'
  link?: string
  referrer?: string
  device?: string
  country?: string
  campaign?: string
  amount?: number
  timestamp: string
}

interface Customer {
  id: string
  email: string
  firstTouchLink: string
  ltv: number
  totalOrders: number
  lastOrderDate: string
  journey: JourneyEvent[]
}

const mockCustomers: Customer[] = [
  {
    id: '1', email: 'alice@example.com', firstTouchLink: 'summer-sale-jane', ltv: 1250.00, totalOrders: 5, lastOrderDate: 'Jul 20, 2026',
    journey: [
      { id: 'c1', type: 'click', link: 'summer-sale-jane', referrer: 'tiktok.com', device: 'Mobile', country: 'TH', timestamp: 'Jul 15, 2026 14:32' },
      { id: 'l1', type: 'lead', campaign: 'Summer Launch 2026', timestamp: 'Jul 15, 2026 14:35' },
      { id: 's1', type: 'sale', amount: 250.00, timestamp: 'Jul 16, 2026 09:12' },
      { id: 'c2', type: 'click', link: 'summer-sale-jane', referrer: 'direct', device: 'Desktop', country: 'TH', timestamp: 'Jul 18, 2026 10:00' },
      { id: 's2', type: 'sale', amount: 500.00, timestamp: 'Jul 18, 2026 10:05' },
      { id: 'l2', type: 'lead', campaign: 'New Collection', timestamp: 'Jul 19, 2026 16:00' },
      { id: 's3', type: 'sale', amount: 500.00, timestamp: 'Jul 20, 2026 11:30' },
    ],
  },
  {
    id: '2', email: 'bob@example.com', firstTouchLink: 'tiktok-review', ltv: 89.99, totalOrders: 1, lastOrderDate: 'Jul 10, 2026',
    journey: [
      { id: 'c3', type: 'click', link: 'tiktok-review', referrer: 'tiktok.com', device: 'Mobile', country: 'US', timestamp: 'Jul 10, 2026 20:15' },
      { id: 'l3', type: 'lead', campaign: 'TikTok Campaign', timestamp: 'Jul 10, 2026 20:16' },
      { id: 's4', type: 'sale', amount: 89.99, timestamp: 'Jul 10, 2026 20:20' },
    ],
  },
  {
    id: '3', email: 'carol@example.com', firstTouchLink: 'jennie-fav', ltv: 2340.00, totalOrders: 8, lastOrderDate: 'Jul 22, 2026',
    journey: [
      { id: 'c4', type: 'click', link: 'jennie-fav', referrer: 'instagram.com', device: 'Mobile', country: 'ID', timestamp: 'Jul 01, 2026 08:00' },
      { id: 'l4', type: 'lead', campaign: 'Summer Launch 2026', timestamp: 'Jul 01, 2026 08:05' },
      { id: 's5', type: 'sale', amount: 150.00, timestamp: 'Jul 02, 2026 14:00' },
      { id: 's6', type: 'sale', amount: 300.00, timestamp: 'Jul 05, 2026 10:30' },
      { id: 'c5', type: 'click', link: 'jennie-fav', referrer: 'direct', device: 'Desktop', country: 'ID', timestamp: 'Jul 10, 2026 09:00' },
      { id: 's7', type: 'sale', amount: 450.00, timestamp: 'Jul 10, 2026 09:15' },
      { id: 'c6', type: 'click', link: 'summer-sale-jane', referrer: 'facebook.com', device: 'Mobile', country: 'ID', timestamp: 'Jul 15, 2026 19:00' },
      { id: 'l5', type: 'lead', campaign: 'Flash Sale', timestamp: 'Jul 15, 2026 19:02' },
      { id: 's8', type: 'sale', amount: 1440.00, timestamp: 'Jul 22, 2026 12:00' },
    ],
  },
  {
    id: '4', email: 'dave@example.com', firstTouchLink: 'flash-sale-link', ltv: 45.00, totalOrders: 2, lastOrderDate: 'Jun 28, 2026',
    journey: [
      { id: 'c7', type: 'click', link: 'flash-sale-link', referrer: 'twitter.com', device: 'Desktop', country: 'SG', timestamp: 'Jun 25, 2026 15:00' },
      { id: 'l6', type: 'lead', campaign: 'Flash Sale', timestamp: 'Jun 25, 2026 15:01' },
      { id: 's9', type: 'sale', amount: 25.00, timestamp: 'Jun 26, 2026 10:00' },
      { id: 's10', type: 'sale', amount: 20.00, timestamp: 'Jun 28, 2026 11:00' },
    ],
  },
  {
    id: '5', email: 'eve@example.com', firstTouchLink: 'new-collection-launch', ltv: 780.00, totalOrders: 3, lastOrderDate: 'Jul 19, 2026',
    journey: [
      { id: 'c8', type: 'click', link: 'new-collection-launch', referrer: 'google.com', device: 'Desktop', country: 'MY', timestamp: 'Jul 14, 2026 11:30' },
      { id: 'l7', type: 'lead', campaign: 'New Collection', timestamp: 'Jul 14, 2026 11:35' },
      { id: 's11', type: 'sale', amount: 280.00, timestamp: 'Jul 15, 2026 16:00' },
      { id: 's12', type: 'sale', amount: 500.00, timestamp: 'Jul 19, 2026 09:00' },
    ],
  },
]

const eventIcons: Record<string, React.ReactNode> = {
  click: <MousePointerClick className="h-4 w-4" />,
  lead: <Users className="h-4 w-4" />,
  sale: <ShoppingCart className="h-4 w-4" />,
}

const eventColors: Record<string, string> = {
  click: 'border-blue-500 bg-blue-500/10 text-blue-500',
  lead: 'border-yellow-500 bg-yellow-500/10 text-yellow-500',
  sale: 'border-emerald-500 bg-emerald-500/10 text-emerald-500',
}

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') router.push('/dashboard')
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') return null

  const filteredCustomers = mockCustomers.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalCustomers = mockCustomers.length
  const avgLtv = mockCustomers.reduce((s, c) => s + c.ltv, 0) / totalCustomers
  const totalRevenue = mockCustomers.reduce((s, c) => s + c.ltv, 0)
  const totalOrders = mockCustomers.reduce((s, c) => s + c.totalOrders, 0)
  const conversionRate = (totalCustomers / 100) * 100

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Customers</h1>
        <p className="text-sm text-content-subtle">View customer journey timelines and track conversions</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Total Customers" value={formatNumber(totalCustomers)} change={12} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Avg. LTV" value={formatCurrency(avgLtv)} change={8} icon={<DollarSign className="h-4 w-4" />} />
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} change={24} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="Conversion Rate" value={`${conversionRate.toFixed(0)}%`} change={3} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">Customer List</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-content-subtle" />
              <input type="text" placeholder="Search by email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-md border border-input bg-bg-default py-1.5 pl-8 pr-3 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-4 py-3 text-left w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-content-subtle uppercase">First Touch Link</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-content-subtle uppercase">LTV</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-content-subtle uppercase">Total Orders</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-content-subtle uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((c) => (
                <>
                  <tr key={c.id} className="hover:bg-bg-subtle/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <td className="px-4 py-4">
                      {expandedId === c.id
                        ? <ChevronDown className="h-4 w-4 text-content-subtle" />
                        : <ChevronRight className="h-4 w-4 text-content-subtle" />
                      }
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bg-subtle">
                          <Mail className="h-3.5 w-3.5 text-content-subtle" />
                        </div>
                        <span className="text-sm text-content-emphasis">{c.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Link2 className="h-3 w-3 text-primary" />
                        <span className="text-sm text-content-subtle">{c.firstTouchLink}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-emerald-500">{formatCurrency(c.ltv)}</td>
                    <td className="px-4 py-4 text-right text-sm text-content-emphasis">{c.totalOrders}</td>
                    <td className="px-4 py-4 text-right text-sm text-content-subtle">{c.lastOrderDate}</td>
                  </tr>
                  {expandedId === c.id && (
                    <tr key={`${c.id}-details`}>
                      <td colSpan={6} className="px-0 py-0">
                        <div className="border-t border-border-default bg-bg-subtle/20 animate-slide-up">
                          <div className="p-6">
                            <p className="text-xs font-medium text-content-subtle mb-4">Customer Journey Timeline</p>
                            <div className="relative pl-6">
                              <div className="absolute left-[11px] top-1 bottom-1 w-px bg-border-default" />
                              <div className="space-y-4">
                                {c.journey.map((event, idx) => (
                                  <div key={event.id} className="relative">
                                    <div className={`absolute -left-[22px] flex h-5 w-5 items-center justify-center rounded-full border ${eventColors[event.type]} bg-bg-default`}>
                                      {eventIcons[event.type]}
                                    </div>
                                    <div className="rounded-lg border border-border-default bg-bg-default p-3">
                                      <div className="flex items-center justify-between">
                                        <Badge variant={event.type === 'click' ? 'secondary' : event.type === 'lead' ? 'warning' : 'success'}
                                          className="text-[10px] uppercase">
                                          {event.type}
                                        </Badge>
                                        <span className="text-[10px] text-content-subtle">{event.timestamp}</span>
                                      </div>
                                      <div className="mt-1.5 text-xs text-content-subtle space-y-0.5">
                                        {event.link && <p>Link: <span className="text-content-emphasis">{event.link}</span></p>}
                                        {event.referrer && <p>Referrer: <span className="text-content-emphasis">{event.referrer}</span></p>}
                                        {event.device && <p>Device: <span className="text-content-emphasis">{event.device}</span></p>}
                                        {event.country && <p>Country: <span className="text-content-emphasis">{event.country}</span></p>}
                                        {event.campaign && <p>Campaign: <span className="text-content-emphasis">{event.campaign}</span></p>}
                                        {event.amount && <p>Amount: <span className="text-content-emphasis font-medium">{formatCurrency(event.amount)}</span></p>}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-content-subtle/30 mb-3" />
              <p className="text-sm text-content-subtle">No customers found matching your search</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
