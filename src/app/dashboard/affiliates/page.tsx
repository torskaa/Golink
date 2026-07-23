'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Kbd } from '@/components/ui/kbd'
import { Modal } from '@/components/ui/modal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MetricCard } from '@/components/dashboard/metric-card'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Users, UserPlus, Mail, DollarSign, TrendingUp, Command, Link2 } from 'lucide-react'
import { toast } from 'sonner'

const demoAffiliates = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.com', clicks: 3451, conversions: 45, revenue: 1234.50, status: 'active' },
  { id: '2', name: 'Jennie Kim', email: 'jennie@example.com', clicks: 2892, conversions: 32, revenue: 867.00, status: 'active' },
  { id: '3', name: 'TikTok Creator', email: 'tiktok@example.com', clicks: 5621, conversions: 89, revenue: 2345.75, status: 'active' },
  { id: '4', name: 'Lisa Manoban', email: 'lisa@example.com', clicks: 1234, conversions: 12, revenue: 345.00, status: 'pending' },
  { id: '5', name: 'Park Chaeyoung', email: 'rose@example.com', clicks: 0, conversions: 0, revenue: 0, status: 'invited' },
]

export default function BrandAffiliatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'unauthenticated' || (session && session.user.role !== 'BRAND' && session.user.role !== 'ADMIN')) return null

  const totalRevenue = demoAffiliates.reduce((s, a) => s + a.revenue, 0)
  const totalClicks = demoAffiliates.reduce((s, a) => s + a.clicks, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Affiliates</h1>
          <p className="text-sm text-content-subtle">Manage your partner network</p>
        </div>
        <Button onClick={() => { setShowInviteModal(true); setInviteLink(`https://link.dubpartner.co/ref/${Math.random().toString(36).slice(2, 10)}`) }}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Invite Affiliate
        </Button>
      </div>

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}
        title="Invite Affiliate" description="Send an invitation to a new partner">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-emphasis">Affiliate Email</label>
            <input type="email" placeholder="partner@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-content-emphasis">Referral Link</label>
            <div className="mt-1.5 flex items-center gap-2">
              <input type="text" value={inviteLink} readOnly
                className="flex-1 rounded-lg border border-input bg-bg-subtle px-3 py-2.5 text-sm text-content-emphasis" />
              <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success('Link copied!') }}>
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => { toast.success(`Invitation sent to ${inviteEmail || 'partner'}`); setShowInviteModal(false); setInviteEmail('') }}
              disabled={!inviteEmail.trim()}>
              <Mail className="mr-1.5 h-4 w-4" />
              Send Invitation
            </Button>
            <Button variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Total Affiliates" value={String(demoAffiliates.length)} icon={<Users className="h-4 w-4" />} />
        <MetricCard label="Total Clicks" value={formatNumber(totalClicks)} change={15} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard label="Total Paid Out" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Affiliate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Conversions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Revenue</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {demoAffiliates.map((a) => (
                <tr key={a.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-bg-subtle text-xs text-content-subtle">
                          {a.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-content-emphasis">{a.name}</p>
                        <p className="text-xs text-content-subtle">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={a.status === 'active' ? 'success' : a.status === 'pending' ? 'warning' : 'secondary'}>
                      {a.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-content-subtle">{a.clicks.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-content-subtle">{a.conversions}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-emerald-500">
                    {formatCurrency(a.revenue)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-content-emphasis">
                      <Mail className="h-4 w-4" />
                    </Button>
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
