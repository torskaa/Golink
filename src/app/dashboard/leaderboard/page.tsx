'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Trophy, Medal, Award } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PartnerEntry {
  id: string
  name: string
  email: string
  country?: string
  totalRevenue: number
  totalPayouts: number
  totalConversions: number
  status: string
}

const COUNTRY_FLAGS: Record<string, string> = {
  TH: '🇹🇭', ID: '🇮🇩', VN: '🇻🇳', PH: '🇵🇭', MY: '🇲🇾',
  SG: '🇸🇬', US: '🇺🇸', JP: '🇯🇵', KR: '🇰🇷', CN: '🇨🇳',
  IN: '🇮🇳', AU: '🇦🇺', GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷',
}

const TROPHY_ICONS = [Trophy, Medal, Award]

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [partners, setPartners] = useState<PartnerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') { router.push('/dashboard'); return }
    if (status === 'authenticated') {
      fetch('/api/partners')
        .then((r) => r.json())
        .then((data) => setPartners(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') return null

  const sorted = [...partners].sort((a, b) => b.totalRevenue - a.totalRevenue)
  const filtered = searchQuery
    ? sorted.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : sorted

  const getFlag = (country?: string) => {
    if (!country) return ''
    return COUNTRY_FLAGS[country.toUpperCase()] || ` ${country.toUpperCase()}`
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Partner Leaderboard</h1>
        <p className="text-sm text-content-subtle">Top-performing partners ranked by revenue</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-bg-default py-2.5 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-content-subtle">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-content-subtle">No partners found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default text-xs text-content-subtle">
                  <th className="px-6 py-3 text-left font-medium w-12">Rank</th>
                  <th className="px-6 py-3 text-left font-medium">Partner</th>
                  <th className="px-6 py-3 text-right font-medium">Revenue</th>
                  <th className="px-6 py-3 text-right font-medium">Payouts</th>
                  <th className="px-6 py-3 text-right font-medium">Conversions</th>
                  <th className="px-6 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((partner, index) => {
                  const rank = index + 1
                  const TrophyIcon = rank <= 3 ? TROPHY_ICONS[rank - 1] : null

                  return (
                    <tr key={partner.id} className="border-b border-border-default/50 hover:bg-bg-subtle/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {TrophyIcon ? (
                            <TrophyIcon className={`h-4 w-4 ${
                              rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : 'text-amber-600'
                            }`} />
                          ) : (
                            <span className="text-sm text-content-subtle w-4 text-center">{rank}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-subtle text-xs font-bold text-content-emphasis">
                            {partner.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-content-emphasis">{partner.name}</p>
                            <p className="text-xs text-content-subtle">
                              {getFlag(partner.country)} {partner.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-emerald-500">
                        {formatCurrency(partner.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-content-emphasis">
                        {formatCurrency(partner.totalPayouts)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-content-emphasis">{partner.totalConversions}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge variant={partner.status === 'active' ? 'success' : 'secondary'}>
                          {partner.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
