'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Link2,
  Megaphone,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Shield,
  Plus,
  Search,
  Command,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  href?: string
  action?: () => void
  shortcut?: string
  group: string
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const { data: session } = useSession()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const role = session?.user?.role
  const isBrand = role === 'BRAND'
  const isAdmin = role === 'ADMIN'

  const items: CommandItem[] = [
    ...(isBrand
      ? [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, href: '/dashboard', group: 'Pages' },
          { id: 'links', label: 'Links', icon: <Link2 className="h-4 w-4" />, href: '/dashboard/links', group: 'Pages' },
          { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="h-4 w-4" />, href: '/dashboard/campaigns', group: 'Pages' },
          { id: 'affiliates', label: 'Affiliates', icon: <Users className="h-4 w-4" />, href: '/dashboard/affiliates', group: 'Pages' },
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, href: '/dashboard/analytics', group: 'Pages' },
          { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/dashboard/settings', group: 'Pages' },
        ]
      : [
          { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" />, href: '/dashboard', group: 'Pages' },
          { id: 'my-links', label: 'My Links', icon: <Link2 className="h-4 w-4" />, href: '/dashboard/links', group: 'Pages' },
          { id: 'earnings', label: 'Earnings', icon: <DollarSign className="h-4 w-4" />, href: '/dashboard/earnings', group: 'Pages' },
          { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/dashboard/settings', group: 'Pages' },
        ]),
    ...(isAdmin
      ? [{ id: 'admin', label: 'Admin Panel', icon: <Shield className="h-4 w-4" />, href: '/admin', group: 'Admin' }]
      : []),
    { id: 'create-link', label: 'Create Link', description: 'Create a new short link', icon: <Plus className="h-4 w-4" />, action: () => {}, shortcut: 'C', group: 'Actions' },
    { id: 'create-campaign', label: 'Create Campaign', description: 'Start a new campaign', icon: <Plus className="h-4 w-4" />, action: () => {}, shortcut: '⇧C', group: 'Actions' },
  ]

  const filtered = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : items

  const groups = filtered.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = []
      acc[item.group].push(item)
      return acc
    },
    {} as Record<string, CommandItem[]>
  )

  const flatItems = filtered
  useEffect(() => { setSelectedIndex(0) }, [query])

  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.href) router.push(item.href)
      if (item.action) item.action()
      onOpenChange(false)
    },
    [router, onOpenChange]
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setSelectedIndex(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault()
        handleSelect(flatItems[selectedIndex])
      }
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, flatItems, handleSelect, onOpenChange])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 animate-scale-in">
        <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl">
          <div className="flex items-center border-b border-border-default px-4">
            <Search className="h-4 w-4 text-content-subtle shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, actions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-3.5 text-sm text-content-emphasis placeholder-content-subtle outline-none"
            />
            <kbd className="hidden h-5 items-center gap-1 rounded-md border border-border-default bg-bg-subtle px-1.5 text-[10px] font-medium text-content-subtle sm:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
            {Object.entries(groups).map(([groupName, groupItems]) => (
              <div key={groupName}>
                <div className="px-2 py-1.5 text-[11px] font-medium uppercase text-content-subtle">
                  {groupName}
                </div>
                {groupItems.map((item, idx) => {
                  const globalIdx = flatItems.indexOf(item)
                  return (
                    <button
                      key={item.id}
                      data-index={globalIdx}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors',
                        globalIdx === selectedIndex
                          ? 'bg-bg-subtle text-content-emphasis'
                          : 'text-content-emphasis hover:bg-bg-subtle/50'
                      )}
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border-default bg-bg-subtle text-content-subtle shrink-0">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.label}</div>
                        {item.description && (
                          <div className="text-xs text-content-subtle truncate">{item.description}</div>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="hidden h-5 items-center gap-1 rounded-md border border-border-default bg-bg-subtle px-1.5 text-[10px] font-medium text-content-subtle sm:inline-flex">
                          {item.shortcut === 'C' ? 'C' : item.shortcut}
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center py-8 text-center">
                <Search className="mb-2 h-5 w-5 text-content-subtle" />
                <p className="text-sm text-content-subtle">No results found</p>
                <p className="text-xs text-content-subtle/60">Try a different search term</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border-default px-4 py-2">
            <div className="flex items-center gap-1 text-[10px] text-content-subtle">
              <kbd className="inline-flex h-4 items-center rounded border border-border-default px-1 text-[9px]">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-content-subtle">
              <kbd className="inline-flex h-4 items-center rounded border border-border-default px-1 text-[9px]">↵</kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-content-subtle">
              <kbd className="inline-flex h-4 items-center rounded border border-border-default px-1 text-[9px]">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return { open, setOpen }
}
