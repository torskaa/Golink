'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { slugify } from '@/lib/utils'
import { X, Link2, Loader2, Check, AlertCircle, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { TagManager } from '@/components/tag-manager'

interface CreateLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateLinkModal({ open, onOpenChange }: CreateLinkModalProps) {
  const router = useRouter()
  const [step, setStep] = useState<'url' | 'configure'>('url')
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [campaigns, setCampaigns] = useState<Array<{ id: string; title: string }>>([])
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [showUtm, setShowUtm] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep('url'); setUrl(''); setSlug(''); setTitle('')
      setCampaignId(''); setSlugAvailable(null); setSelectedTags([])
      setUtmSource(''); setUtmMedium(''); setUtmCampaign('')
      setShowUtm(false)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      fetch('/api/campaigns')
        .then((r) => r.json())
        .then((data) => setCampaigns(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [open])

  useEffect(() => {
    if (!slug || slug.length < 2) { setSlugAvailable(null); return }
    const timer = setTimeout(async () => {
      setCheckingSlug(true)
      try {
        const res = await fetch(`/api/links/check?slug=${slug}`)
        const data = await res.json()
        setSlugAvailable(data.available)
      } catch { setSlugAvailable(null) }
      finally { setCheckingSlug(false) }
    }, 400)
    return () => clearTimeout(timer)
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'default',
          campaignId: campaignId || undefined,
          url,
          key: slug || slugify(title || url),
          title: title || undefined,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          tagIds: selectedTags,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to create link')
        return
      }
      toast.success('Link created successfully')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-content-emphasis">Create a Link</h2>
              <p className="text-xs text-content-subtle">Create a new short link for your campaign</p>
            </div>
            <button onClick={() => onOpenChange(false)} className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {step === 'url' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-content-emphasis">Destination URL</label>
                  <div className="mt-1.5 relative">
                    <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
                    <input
                      type="url"
                      placeholder="https://example.com/my-long-url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full rounded-lg border border-input bg-bg-default py-2.5 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                      autoFocus required
                    />
                  </div>
                </div>
                <button type="button" onClick={() => url && setStep('configure')} disabled={!url}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
                  Continue
                </button>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-border-default bg-bg-subtle/50 p-3">
                  <p className="text-xs text-content-subtle">Destination</p>
                  <p className="mt-0.5 truncate text-sm text-content-emphasis">{url}</p>
                  <button type="button" onClick={() => setStep('url')} className="mt-1 text-xs text-primary hover:underline">Change</button>
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Short Link</label>
                  <div className="mt-1.5 flex items-center">
                    <span className="flex h-10 items-center rounded-l-lg border border-input bg-bg-subtle px-3 text-xs text-content-subtle shrink-0">link.dubpartner.co/r/</span>
                    <div className="relative flex-1">
                      <input type="text" placeholder="my-slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))}
                        className={cn('h-10 w-full border border-l-0 border-input bg-bg-default px-3 text-sm text-content-emphasis placeholder-content-subtle focus:outline-none focus:ring-1 transition-colors',
                          slugAvailable === true && 'border-emerald-500 ring-1 ring-emerald-500/30',
                          slugAvailable === false && 'border-red-500 ring-1 ring-red-500/30')} />
                      {checkingSlug && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-content-subtle" />}
                      {!checkingSlug && slugAvailable === true && <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />}
                      {!checkingSlug && slugAvailable === false && <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />}
                    </div>
                  </div>
                  {slugAvailable === false && <p className="mt-1 text-xs text-red-500">This slug is already taken</p>}
                  {slugAvailable === true && <p className="mt-1 text-xs text-emerald-500">Available</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Title (optional)</label>
                  <input type="text" placeholder="My Campaign Link" value={title} onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Campaign (optional)</label>
                  <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                    <option value="">No campaign</option>
                    {campaigns.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-content-emphasis">Tags</label>
                  <div className="mt-1.5">
                    <TagManager workspaceId="default" selectedTags={selectedTags} onTagsChange={setSelectedTags} />
                  </div>
                </div>

                <div>
                  <button type="button" onClick={() => setShowUtm(!showUtm)}
                    className="flex items-center gap-1.5 text-xs text-content-subtle hover:text-content-emphasis transition-colors">
                    <Globe className="h-3 w-3" />
                    {showUtm ? 'Hide UTM parameters' : 'Add UTM parameters'}
                  </button>
                  {showUtm && (
                    <div className="mt-3 grid grid-cols-3 gap-3 animate-slide-up">
                      <div>
                        <label className="text-xs text-content-subtle">Source</label>
                        <input type="text" placeholder="twitter" value={utmSource} onChange={(e) => setUtmSource(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-content-subtle">Medium</label>
                        <input type="text" placeholder="social" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs text-content-subtle">Campaign</label>
                        <input type="text" placeholder="summer-sale" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)}
                          className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => onOpenChange(false)}
                    className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-content-emphasis hover:bg-bg-subtle transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || slugAvailable === false}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors">
                    {submitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Creating...</span> : 'Create Link'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
