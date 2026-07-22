'use client'

import { useState, useEffect } from 'react'
import { X, Link2, Globe, Lock, Shield, Image, SplitSquareVertical, Smartphone, MapPin, ExternalLink, ChevronDown, Folder, Megaphone, QrCode } from 'lucide-react'
import { slugify } from '@/lib/utils'
import { toast } from 'sonner'
import { TagManager } from '@/components/tag-manager'
import { QRCode } from '@/components/ui/qr-code'

interface LinkBuilderProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

interface GeoOverride {
  country: string
  url: string
}

interface Domain {
  id: string
  slug: string
  verified: boolean
  primary: boolean
}

interface Campaign {
  id: string
  title: string
}

interface Folder {
  id: string
  name: string
}

export function LinkBuilder({ open, onClose, onCreated }: LinkBuilderProps) {
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [folderId, setFolderId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [password, setPassword] = useState('')
  const [cloaked, setCloaked] = useState(false)
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [abTestUrl, setAbTestUrl] = useState('')
  const [abTestTraffic, setAbTestTraffic] = useState(50)
  const [utmSource, setUtmSource] = useState('')
  const [utmMedium, setUtmMedium] = useState('')
  const [utmCampaign, setUtmCampaign] = useState('')
  const [utmTerm, setUtmTerm] = useState('')
  const [utmContent, setUtmContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [mobileUrl, setMobileUrl] = useState('')
  const [desktopUrl, setDesktopUrl] = useState('')
  const [tabletUrl, setTabletUrl] = useState('')
  const [geoOverrides, setGeoOverrides] = useState<GeoOverride[]>([{ country: '', url: '' }])
  const [deepLinkIos, setDeepLinkIos] = useState('')
  const [deepLinkAndroid, setDeepLinkAndroid] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('')
  const [domains, setDomains] = useState<Domain[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [showQr, setShowQr] = useState(false)

  useEffect(() => {
    if (open) {
      fetch('/api/domains')
        .then(res => res.json())
        .then(data => {
          setDomains(data)
          const primary = data.find((d: Domain) => d.primary)
          if (primary) setSelectedDomain(primary.slug)
        })
        .catch(() => {})
      fetch('/api/campaigns')
        .then(res => res.json())
        .then(data => setCampaigns(Array.isArray(data) ? data : []))
        .catch(() => {})
      fetch('/api/folders')
        .then(res => res.json())
        .then(data => setFolders(Array.isArray(data) ? data : []))
        .catch(() => {})
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) { toast.error('Destination URL is required'); return }
    setSubmitting(true)

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: 'default',
          url,
          key: slug || slugify(title || url),
          title: title || undefined,
          description: description || undefined,
          campaignId: campaignId || undefined,
          folderId: folderId || undefined,
          tagIds: selectedTags,
          utmSource: utmSource || undefined,
          utmMedium: utmMedium || undefined,
          utmCampaign: utmCampaign || undefined,
          utmTerm: utmTerm || undefined,
          utmContent: utmContent || undefined,
          expiresAt: expiresAt || undefined,
          password: password || undefined,
          cloaked,
          ogTitle: ogTitle || undefined,
          ogDescription: ogDescription || undefined,
          ogImage: ogImage || undefined,
          abTestUrl: abTestUrl || undefined,
          abTestTraffic: abTestUrl ? abTestTraffic : undefined,
          deviceMobileUrl: mobileUrl || undefined,
          deviceDesktopUrl: desktopUrl || undefined,
          deviceTabletUrl: tabletUrl || undefined,
          geoOverrides: JSON.stringify(geoOverrides.filter(g => g.country && g.url)),
          deepLinkIos: deepLinkIos || undefined,
          deepLinkAndroid: deepLinkAndroid || undefined,
          domainId: domains.find(d => d.slug === selectedDomain)?.id || undefined,
        }),
      })

      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Failed'); return }
      toast.success('Link created!')
      onClose()
      onCreated?.()
    } catch { toast.error('Something went wrong') }
    finally { setSubmitting(false) }
  }

  const addGeoOverride = () => setGeoOverrides([...geoOverrides, { country: '', url: '' }])
  const removeGeoOverride = (index: number) => setGeoOverrides(geoOverrides.filter((_, i) => i !== index))
  const updateGeoOverride = (index: number, field: keyof GeoOverride, value: string) => {
    const updated = [...geoOverrides]
    updated[index] = { ...updated[index], [field]: value }
    setGeoOverrides(updated)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-lg animate-slide-up border-l border-border-default bg-bg-default shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-content-emphasis">Create a Link</h2>
              <p className="text-xs text-content-subtle">Configure your short link</p>
            </div>
            <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-bg-subtlehover:text-content-emphasis transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
              <input
                type="url"
                placeholder="https://example.com/long-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-input bg-bg-default py-3 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Short Link</label>
              <div className="mt-1.5 flex items-center rounded-lg border border-input bg-bg-default focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-colors">
                <span className="shrink-0 pl-3 pr-1 text-xs text-content-subtle">link.dubpartner.co/r/</span>
                <input
                  type="text"
                  placeholder="my-slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-sm text-content-emphasis placeholder-content-subtle focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Domain</label>
              <div className="mt-1.5 relative">
                <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-input bg-bg-default px-3 py-2.5 pr-8 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                  {domains.map(d => (
                    <option key={d.id} value={d.slug} disabled={!d.verified}>{d.slug}{!d.verified ? ' (unverified)' : ''}{d.primary ? ' (default)' : ''}</option>
                  ))}
                  {domains.length === 0 && <option value="">link.dubpartner.co</option>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-content-subtle pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Title</label>
              <input
                type="text"
                placeholder="My Link Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Description</label>
              <textarea
                placeholder="Describe this link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-content-emphasis">Tags</label>
              <div className="mt-1.5">
                <TagManager workspaceId="default" selectedTags={selectedTags} onTagsChange={setSelectedTags} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-content-emphasis">
                  <Megaphone className="h-3.5 w-3.5 text-content-subtle" /> Campaign
                </label>
                <select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                  <option value="">No campaign</option>
                  {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-content-emphasis">
                  <Folder className="h-3.5 w-3.5 text-content-subtle" /> Folder
                </label>
                <select value={folderId} onChange={(e) => setFolderId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                  <option value="">No folder</option>
                  {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
            </div>

            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-content-subtle hover:text-content-emphasis transition-colors">
              <Globe className="h-3 w-3" />
              {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
            </button>

            {showAdvanced && (
              <div className="space-y-4 animate-slide-up">
                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">Link Controls</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-2 text-xs text-content-subtle">
                        <Lock className="h-3 w-3" /> Password protect
                      </label>
                      <input type="text" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs text-content-subtle">
                        <Shield className="h-3 w-3" /> Expires at
                      </label>
                      <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
                    </div>
                  </div>
                  <label className="mt-3 flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cloaked} onChange={(e) => setCloaked(e.target.checked)}
                      className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
                    <span className="text-xs text-content-subtle">Cloak link — hide destination URL</span>
                  </label>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <Smartphone className="h-3 w-3 inline mr-1" /> Device Targeting
                  </p>
                  <div className="space-y-2">
                    <input type="url" placeholder="Mobile URL (e.g. app://deep-link)" value={mobileUrl} onChange={(e) => setMobileUrl(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="url" placeholder="Desktop URL" value={desktopUrl} onChange={(e) => setDesktopUrl(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="url" placeholder="Tablet URL" value={tabletUrl} onChange={(e) => setTabletUrl(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                  </div>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <MapPin className="h-3 w-3 inline mr-1" /> Geo Targeting
                  </p>
                  <div className="space-y-2">
                    {geoOverrides.map((g, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input type="text" placeholder="Country code (e.g. US)" value={g.country} onChange={(e) => updateGeoOverride(i, 'country', e.target.value.toUpperCase())}
                          className="w-24 rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none uppercase" />
                        <input type="url" placeholder="https://example.com/us-specific" value={g.url} onChange={(e) => updateGeoOverride(i, 'url', e.target.value)}
                          className="flex-1 rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                        <button type="button" onClick={() => removeGeoOverride(i)}
                          className="shrink-0 rounded-md p-1.5 text-content-subtle hover:text-content-emphasis hover:bg-bg-bg-subtletransition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addGeoOverride}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                      + Add country override
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <ExternalLink className="h-3 w-3 inline mr-1" /> Deep Links
                  </p>
                  <div className="space-y-2">
                    <input type="text" placeholder="iOS App URL Scheme (e.g. myapp://page)" value={deepLinkIos} onChange={(e) => setDeepLinkIos(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="Android Intent URL (e.g. intent://page#Intent;end)" value={deepLinkAndroid} onChange={(e) => setDeepLinkAndroid(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                  </div>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <Image className="h-3 w-3 inline mr-1" /> Social Preview (OG)
                  </p>
                  <div className="space-y-2">
                    <input type="text" placeholder="OG Title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="OG Description" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="url" placeholder="OG Image URL" value={ogImage} onChange={(e) => setOgImage(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                  </div>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <SplitSquareVertical className="h-3 w-3 inline mr-1" /> A/B Testing
                  </p>
                  <div className="space-y-2">
                    <input type="url" placeholder="https://example.com/variant-b" value={abTestUrl} onChange={(e) => setAbTestUrl(e.target.value)}
                      className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-content-subtle shrink-0">Traffic split:</span>
                      <input type="range" min={5} max={95} value={abTestTraffic} onChange={(e) => setAbTestTraffic(Number(e.target.value))}
                        className="flex-1 accent-primary" />
                      <span className="text-xs text-content-emphasis w-8 text-right">{abTestTraffic}%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border-default pt-4">
                  <p className="text-xs font-medium text-content-subtle mb-3">
                    <Globe className="h-3 w-3 inline mr-1" /> UTM Parameters
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Source" value={utmSource} onChange={(e) => setUtmSource(e.target.value)}
                      className="rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="Medium" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)}
                      className="rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="Campaign" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)}
                      className="rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="Term" value={utmTerm} onChange={(e) => setUtmTerm(e.target.value)}
                      className="rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                    <input type="text" placeholder="Content" value={utmContent} onChange={(e) => setUtmContent(e.target.value)}
                      className="rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none" />
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="border-t border-border-default p-6">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setShowQr(!showQr)}
                className="flex items-center gap-1.5 rounded-lg border border-input px-3 py-2.5 text-xs text-content-subtle hover:text-content-emphasis hover:bg-bg-bg-subtletransition-colors">
                <QrCode className="h-4 w-4" />
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 rounded-lg border border-input py-2.5 text-sm font-medium text-content-emphasis hover:bg-bg-bg-subtletransition-colors">
                Cancel
              </button>
              <button type="submit" onClick={handleSubmit} disabled={submitting}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? 'Creating...' : 'Create Link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showQr && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowQr(false)}>
          <div className="rounded-xl border border-border-default bg-bg-default p-6 shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <QRCode url={`https://link.dubpartner.co/r/${slug || 'my-link'}`} size={200} />
          </div>
        </div>
      )}
    </>
  )
}
