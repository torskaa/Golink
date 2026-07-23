'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { LinkRow } from '@/components/dashboard/link-row'
import { EmptyState } from '@/components/ui/empty-state'
import { LinkBuilder } from '@/components/link-builder'
import { BulkActions } from '@/components/bulk-actions'
import { TagManager } from '@/components/tag-manager'
import { Plus, Search, Link2, Filter, Upload } from 'lucide-react'
import { toast } from 'sonner'

const allBrandLinks = [
  { id: '1', key_: 'summer-sale-jane', url: 'https://brand.com/summer', title: 'Summer Sale 2026', clicks: 1234, conversions: 45, revenue: 1234.50, isActive: true, campaignName: 'Summer Launch 2026', partnerName: 'Jane Doe', tags: [{ id: 't1', name: 'seasonal', color: '#f59e0b' }, { id: 't2', name: 'top-performer', color: '#10b981' }] },
  { id: '2', key_: 'jennie-fav', url: 'https://brand.com/collections/new', title: 'New Collection', clicks: 892, conversions: 23, revenue: 678.00, isActive: true, campaignName: 'New Collection', partnerName: 'Jennie Kim', tags: [{ id: 't3', name: 'fashion', color: '#ec4899' }] },
  { id: '3', key_: 'tiktok-review', url: 'https://brand.com/product/xyz', title: 'TikTok Campaign', clicks: 2451, conversions: 89, revenue: 2345.75, isActive: true, campaignName: 'TikTok Viral', partnerName: 'TikTok Creator', tags: [] },
  { id: '4', key_: 'flash-deal', url: 'https://brand.com/flash', title: 'Flash Sale', clicks: 567, conversions: 12, revenue: 345.00, isActive: false, campaignName: 'Flash Sale', partnerName: '—', tags: [] },
]

const allCreatorLinks = [
  { id: '1', key_: 'jane-summer', url: 'https://brand.com/summer?ref=jane', title: 'My Summer Link', clicks: 1234, conversions: 45, revenue: 185.10, isActive: true, campaignName: 'Summer Launch 2026' },
  { id: '2', key_: 'jane-review', url: 'https://brand.com/product/xyz?ref=jane', title: 'Product Review', clicks: 892, conversions: 23, revenue: 133.80, isActive: true, campaignName: 'Summer Launch 2026' },
  { id: '3', key_: 'jane-tiktok', url: 'https://brand.com/tiktok?ref=jane', title: null, clicks: 2451, conversions: 89, revenue: 367.65, isActive: true, campaignName: 'TikTok Campaign' },
]

export default function LinksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)
  const [filterTags, setFilterTags] = useState<string[]>([])
  const isBrand = session?.user?.role === 'BRAND' || session?.user?.role === 'ADMIN'

  const handleCreateClick = useCallback(() => {
    if (isBrand) {
      setShowCreateModal(true)
    } else {
      router.push('/dashboard/marketplace')
    }
  }, [isBrand, router])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') setTimeout(() => setLoading(false), 200)
  }, [status, router])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) {
        if (isBrand) {
          setShowCreateModal(true)
        } else {
          router.push('/dashboard/marketplace')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isBrand, router])

  if (status === 'unauthenticated') return null

  const allLinks = isBrand ? allBrandLinks : allCreatorLinks
  const filtered = allLinks.filter((l) => {
    const matchesSearch = searchQuery
      ? l.key_.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.campaignName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesTags = filterTags.length > 0
      ? ('tags' in l && Array.isArray(l.tags) && l.tags.some((t: any) => filterTags.includes(t.name)))
      : true
    return matchesSearch && matchesTags
  })

  const handleBulkDelete = () => { toast.success(`${selectedIds.length} links deleted`); setSelectedIds([]) }
  const handleBulkTag = () => { toast.success('Tag modal opened'); setSelectedIds([]) }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">{isBrand ? 'Links' : 'My Links'}</h1>
          <p className="text-sm text-content-subtle">{isBrand ? 'Manage your short links' : 'Your generated referral links'}</p>
        </div>
        <div className="flex items-center gap-3">
          {isBrand ? (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-content-subtle/60">
              <Kbd>C</Kbd> New link
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-content-subtle/60">
              <Kbd>C</Kbd> Join campaign
            </span>
          )}
          {isBrand && (
            <Button variant="outline" onClick={() => toast.success('CSV import coming soon')}>
              <Upload className="mr-1.5 h-4 w-4" />
              Import
            </Button>
          )}
          <Button onClick={handleCreateClick}>
            <Plus className="mr-1.5 h-4 w-4" />
            {isBrand ? 'Create Link' : 'Browse Campaigns'}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-bg-default py-2.5 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
        </div>
        {isBrand && (
          <Button variant="outline" size="icon" onClick={() => setShowTagFilter(!showTagFilter)} className={showTagFilter ? 'border-primary' : ''}>
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showTagFilter && isBrand && (
        <div className="rounded-lg border border-border-default bg-bg-default p-3 animate-slide-up">
          <p className="text-xs font-medium text-content-subtle mb-2">Filter by tags</p>
          <TagManager workspaceId="default" selectedTags={filterTags} onTagsChange={setFilterTags} />
        </div>
      )}

      <BulkActions selectedIds={selectedIds} onClear={() => setSelectedIds([])} onBulkTag={handleBulkTag} onBulkDelete={handleBulkDelete} />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl border border-border-default bg-bg-default animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Link2 className="h-5 w-5" />}
          title={searchQuery ? 'No links match your search' : 'No links yet'}
          description={searchQuery ? 'Try a different search term' : isBrand ? 'Create your first short link to get started' : 'Join a brand campaign to start earning'}
          action={!searchQuery ? <Button onClick={handleCreateClick}><Plus className="mr-1.5 h-4 w-4" /> {isBrand ? 'Create your first link' : 'Browse campaigns'}</Button> : undefined} />
      ) : (
        <div className="space-y-2">
          {filtered.map((link) => (
            <LinkRow key={link.id} {...link} selected={selectedIds.includes(link.id)}
              onSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])} />
          ))}
        </div>
      )}

      {isBrand && (
        <LinkBuilder open={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
