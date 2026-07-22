'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { FolderTree } from '@/components/folder-tree'
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  LogOut,
  Shield,
  ExternalLink,
  Globe,
  Key,
  Webhook,
  ChevronDown,
  Wallet,
  Code2,
  Radio,
  Activity,
  Trophy,
  ShoppingBag,
  ShieldAlert,
  FileText,
  Puzzle,
  UserPlus,
} from 'lucide-react'

const brandNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/links', label: 'Links', icon: Link2 },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/dashboard/affiliates', label: 'Affiliates', icon: Users },
  { href: '/dashboard/partner-groups', label: 'Partner Groups', icon: UserPlus },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/dashboard/customers', label: 'Customers', icon: ShoppingBag },
  { href: '/dashboard/analytics/events', label: 'Live Events', icon: Radio },
  { href: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
  { href: '/dashboard/domains', label: 'Domains', icon: Globe },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { href: '/dashboard/webhooks', label: 'Webhooks', icon: Webhook },
  { href: '/dashboard/sdks', label: 'SDKs & API', icon: Code2 },
  { href: '/dashboard/landing-page', label: 'Landing Page', icon: FileText },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/risk-monitoring', label: 'Risk Monitoring', icon: ShieldAlert },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const creatorNavItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/links', label: 'My Links', icon: Link2 },
  { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/dashboard/payouts', label: 'Payouts', icon: Wallet },
  { href: '/dashboard/analytics/events', label: 'Live Events', icon: Radio },
  { href: '/dashboard/sdks', label: 'SDKs & API', icon: Code2 },
  { href: '/dashboard/landing-page', label: 'Landing Page', icon: FileText },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Puzzle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === 'ADMIN'
  const isBrand = role === 'BRAND'
  const navItems = isBrand ? brandNavItems : creatorNavItems
  const isLinksPage = pathname === '/dashboard/links'
  const [showFolders, setShowFolders] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border-default bg-bg-default">
      <div className="flex h-14 items-center border-b border-border-default px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg',
            isAdmin ? 'bg-purple-600' : 'bg-primary'
          )}>
            <span className="text-xs font-bold text-white">D</span>
          </div>
          <span className="text-sm font-semibold text-content-emphasis">DubPartner</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-bg-subtle text-content-emphasis'
                    : 'text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </div>
            </Link>
          )
        })}

        {isBrand && (
          <div className="pt-2">
            <button
              onClick={() => setShowFolders(!showFolders)}
              className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-medium uppercase text-content-subtle/60 hover:text-content-subtle transition-colors"
            >
              <ChevronDown className={cn('h-3 w-3 transition-transform', !showFolders && '-rotate-90')} />
              Folders
            </button>
            {showFolders && (
              <div className="mt-1">
                <FolderTree
                  workspaceId="default"
                  selectedFolderId={selectedFolder}
                  onSelect={(id) => {
                    setSelectedFolder(id)
                    // Update URL or filter links
                  }}
                />
              </div>
            )}
          </div>
        )}

        {isAdmin && (
          <div className="pt-4">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase text-content-subtle/60">
              Admin
            </p>
            <Link href="/admin">
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  pathname.startsWith('/admin')
                    ? 'bg-bg-subtle text-content-emphasis'
                    : 'text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis'
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                Admin Panel
              </div>
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-border-default p-3">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>

        <div className="mt-4 px-3">
          <a href="https://dub.co" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[11px] text-content-subtle/60 hover:text-content-subtle transition-colors">
            <ExternalLink className="h-3 w-3" />
            Powered by Dub.co
          </a>
        </div>
      </div>
    </aside>
  )
}
