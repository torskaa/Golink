'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-border-default bg-bg-default">
      <div className="flex h-14 items-center border-b border-border-default px-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600">
            <span className="text-xs font-bold text-white">D</span>
          </div>
          <span className="text-sm font-semibold text-content-emphasis">DubPartner</span>
        </Link>
      </div>

      <div className="px-3 pt-3 pb-2">
        <p className="px-3 text-[11px] font-medium uppercase text-content-subtle/60">
          Admin
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {adminNavItems.map((item) => {
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
      </nav>

      <div className="border-t border-border-default p-3">
        <Link href="/dashboard">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis transition-colors mb-1">
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            Dashboard
          </div>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>

        <div className="mt-4 px-3">
          <a
            href="https://dub.co"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-[11px] text-content-subtle/60 hover:text-content-subtle transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Powered by Dub.co
          </a>
        </div>
      </div>
    </aside>
  )
}
