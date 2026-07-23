'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  GripVertical,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  Star,
  DollarSign,
  MessageSquare,
  HelpCircle,
  FileText,
  AlignLeft,
  Link,
  Mail,
  Phone,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react'

type SectionType = 'hero' | 'how-it-works' | 'rewards' | 'testimonials' | 'faq' | 'apply'

interface Section {
  id: string
  type: SectionType
  label: string
}

interface LandingPageConfig {
  headline: string
  subheadline: string
  description: string
  ctaText: string
  brandColor: string
  logoUrl: string
  features: string[]
  published: boolean
  sections: Section[]
}

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'url' | 'textarea' | 'select'
  required: boolean
  options?: string[]
}

const defaultSections: Section[] = [
  { id: 'hero', type: 'hero', label: 'Hero' },
  { id: 'how-it-works', type: 'how-it-works', label: 'How It Works' },
  { id: 'rewards', type: 'rewards', label: 'Rewards' },
  { id: 'testimonials', type: 'testimonials', label: 'Testimonials' },
  { id: 'faq', type: 'faq', label: 'FAQ' },
  { id: 'apply', type: 'apply', label: 'Apply Form' },
]

const sectionLabels: Record<SectionType, string> = {
  hero: 'Hero',
  'how-it-works': 'How It Works',
  rewards: 'Rewards',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  apply: 'Apply Form',
}

const sectionIcons: Record<SectionType, React.ReactNode> = {
  hero: <Globe className="h-4 w-4" />,
  'how-it-works': <FileText className="h-4 w-4" />,
  rewards: <Star className="h-4 w-4" />,
  testimonials: <MessageSquare className="h-4 w-4" />,
  faq: <HelpCircle className="h-4 w-4" />,
  apply: <FileText className="h-4 w-4" />,
}

export default function LandingPagePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'builder' | 'form'>('builder')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') { router.push('/dashboard') }
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'authenticated' && session?.user?.role !== 'BRAND' && session?.user?.role !== 'ADMIN') return null
  if (status === 'loading') return <div className="flex h-96 items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-content-subtle" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Landing Page</h1>
          <p className="text-sm text-content-subtle">Build and customize your affiliate program landing page</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle/50 p-0.5 w-fit">
        <button
          onClick={() => setActiveTab('builder')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'builder'
              ? 'bg-bg-default text-content-emphasis shadow-sm'
              : 'text-content-subtle hover:text-content-emphasis'
          }`}
        >
          Page Builder
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'form'
              ? 'bg-bg-default text-content-emphasis shadow-sm'
              : 'text-content-subtle hover:text-content-emphasis'
          }`}
        >
          Application Form
        </button>
      </div>

      {activeTab === 'builder' ? <LandingPageBuilder /> : <ApplicationFormBuilder />}
    </div>
  )
}

function LandingPageBuilder() {
  const [config, setConfig] = useState<LandingPageConfig>({
    headline: 'Join Our Affiliate Program',
    subheadline: 'Earn competitive commissions promoting products your audience will love',
    description: 'Partner with us and earn up to 30% recurring commission on every sale you refer. We provide you with all the tools, resources, and support to succeed.',
    ctaText: 'Apply Now',
    brandColor: '#2563eb',
    logoUrl: '',
    features: ['High conversion rates', 'Real-time tracking', 'Weekly payouts', 'Dedicated support'],
    published: false,
    sections: defaultSections,
  })
  const [newFeature, setNewFeature] = useState('')
  const [copied, setCopied] = useState(false)

  const campaignSlug = 'demo-campaign'

  const update = (field: keyof LandingPageConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const addFeature = () => {
    if (!newFeature.trim()) return
    update('features', [...config.features, newFeature.trim()])
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    update('features', config.features.filter((_, i) => i !== index))
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://partners.dubpartner.co/apply/${campaignSlug}`)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const saveConfig = () => {
    toast.success('Landing page saved successfully')
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...config.sections]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.length) return
    ;[sections[index], sections[newIndex]] = [sections[newIndex], sections[index]]
    update('sections', sections)
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-lg text-content-emphasis">Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-content-subtle">Headline</label>
              <Input value={config.headline} onChange={(e) => update('headline', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-content-subtle">Subheadline</label>
              <Input value={config.subheadline} onChange={(e) => update('subheadline', e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-content-subtle">Description</label>
              <textarea value={config.description} onChange={(e) => update('description', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors min-h-[80px]" />
            </div>
            <div>
              <label className="text-sm font-medium text-content-subtle">CTA Button Text</label>
              <Input value={config.ctaText} onChange={(e) => update('ctaText', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-lg text-content-emphasis">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-content-subtle">Brand Color</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input type="color" value={config.brandColor} onChange={(e) => update('brandColor', e.target.value)}
                  className="h-10 w-10 rounded-lg border border-input bg-bg-default cursor-pointer" />
                <Input value={config.brandColor} onChange={(e) => update('brandColor', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-content-subtle">Logo URL</label>
              <Input value={config.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} placeholder="https://example.com/logo.png" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader><CardTitle className="text-lg text-content-emphasis">Features</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {config.features.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-content-emphasis">{f}</span>
                <button onClick={() => removeFeature(i)} className="text-content-subtle hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="Add a feature..." value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addFeature()} />
              <Button size="sm" onClick={addFeature}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-content-emphasis">Sections</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {config.sections.map((section, index) => (
              <div key={section.id} className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 px-3 py-2.5">
                <div className="text-content-subtle cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="text-content-subtle">{sectionIcons[section.type]}</div>
                <span className="flex-1 text-sm text-content-emphasis">{section.label}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveSection(index, 'up')} disabled={index === 0}
                    className="text-content-subtle hover:text-content-emphasis transition-colors disabled:opacity-30">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button onClick={() => moveSection(index, 'down')} disabled={index === config.sections.length - 1}
                    className="text-content-subtle hover:text-content-emphasis transition-colors disabled:opacity-30">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => update('published', !config.published)}
              className={`relative h-5 w-9 rounded-full transition-colors ${config.published ? 'bg-emerald-500' : 'bg-bg-subtle'}`}
            >
              <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${config.published ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-content-emphasis">{config.published ? 'Published' : 'Draft'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyLink}>
              {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button onClick={saveConfig}>Save Page</Button>
          </div>
        </div>
      </div>

      <div className="sticky top-20 h-fit">
        <Card className="border-border-default bg-bg-default overflow-hidden">
          <CardHeader className="border-b border-border-default bg-bg-subtle/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-content-emphasis">Preview</CardTitle>
              <div className="flex items-center gap-2 text-xs text-content-subtle">
                <Eye className="h-3 w-3" />
                Live Preview
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[700px] overflow-y-auto">
              <div style={{ backgroundColor: '#0b0b0f', color: '#fafafa', fontFamily: 'system-ui, sans-serif' }}>
                {config.sections.map((section) => (
                  <div key={section.id}>
                    {section.type === 'hero' && (
                      <div className="px-8 py-12 text-center" style={{ backgroundColor: '#131317' }}>
                        {config.logoUrl && <img src={config.logoUrl} alt="Logo" className="mx-auto h-10 mb-6" />}
                        <h1 className="text-3xl font-bold mb-3">{config.headline}</h1>
                        <p className="text-lg mb-2" style={{ color: '#a1a1aa' }}>{config.subheadline}</p>
                        <p className="text-sm mb-6" style={{ color: '#a1a1aa' }}>{config.description}</p>
                        <div className="flex flex-wrap justify-center gap-3 mb-6">
                          {config.features.map((f, i) => (
                            <span key={i} className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: `${config.brandColor}20`, color: config.brandColor }}>
                              {f}
                            </span>
                          ))}
                        </div>
                        <button style={{ backgroundColor: config.brandColor, color: '#fff' }}
                          className="rounded-lg px-6 py-2.5 text-sm font-semibold">{config.ctaText}</button>
                      </div>
                    )}
                    {section.type === 'how-it-works' && (
                      <div className="px-8 py-10">
                        <h2 className="text-xl font-bold text-center mb-6">How It Works</h2>
                        <div className="grid grid-cols-3 gap-4">
                          {['Sign Up', 'Share Links', 'Earn Rewards'].map((step, i) => (
                            <div key={step} className="rounded-lg p-4 text-center" style={{ backgroundColor: '#131317' }}>
                              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: `${config.brandColor}20`, color: config.brandColor }}>
                                {i + 1}
                              </div>
                              <p className="text-sm font-medium">{step}</p>
                              <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>Lorem ipsum dolor sit amet consectetur</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.type === 'rewards' && (
                      <div className="px-8 py-10" style={{ backgroundColor: '#131317' }}>
                        <h2 className="text-xl font-bold text-center mb-6">Rewards & Commission</h2>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Commission Rate', value: 'Up to 30%' },
                            { label: 'Cookie Duration', value: '30 days' },
                            { label: 'Payout Frequency', value: 'Weekly' },
                            { label: 'Minimum Payout', value: '$50' },
                          ].map((r) => (
                            <div key={r.label} className="rounded-lg border p-4" style={{ borderColor: '#1f1f23' }}>
                              <p className="text-xs" style={{ color: '#a1a1aa' }}>{r.label}</p>
                              <p className="text-lg font-bold mt-1">{r.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.type === 'testimonials' && (
                      <div className="px-8 py-10">
                        <h2 className="text-xl font-bold text-center mb-6">What Partners Say</h2>
                        <div className="space-y-3">
                          {[
                            { name: 'Sarah M.', quote: 'Best affiliate program I\'ve ever joined. The dashboard is amazing!' },
                            { name: 'James K.', quote: 'Highest converting offers in the SEA region. Highly recommend.' },
                          ].map((t) => (
                            <div key={t.name} className="rounded-lg border p-4" style={{ borderColor: '#1f1f23', backgroundColor: '#131317' }}>
                              <div className="flex items-center gap-1 mb-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg key={i} className="h-3 w-3" fill="currentColor" style={{ color: '#f59e0b' }} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                              </div>
                              <p className="text-sm italic" style={{ color: '#a1a1aa' }}>"{t.quote}"</p>
                              <p className="text-xs font-medium mt-2">— {t.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.type === 'faq' && (
                      <div className="px-8 py-10" style={{ backgroundColor: '#131317' }}>
                        <h2 className="text-xl font-bold text-center mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-2">
                          {[
                            { q: 'How do I get started?', a: 'Sign up, get your unique referral link, and start promoting.' },
                            { q: 'When do I get paid?', a: 'Payouts are processed weekly with a 30-day holding period.' },
                            { q: 'Is there a minimum payout?', a: 'Yes, the minimum payout threshold is $50.' },
                          ].map((faq) => (
                            <div key={faq.q} className="rounded-lg border p-4" style={{ borderColor: '#1f1f23' }}>
                              <p className="text-sm font-medium">{faq.q}</p>
                              <p className="text-xs mt-1" style={{ color: '#a1a1aa' }}>{faq.a}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {section.type === 'apply' && (
                      <div className="px-8 py-10 text-center">
                        <h2 className="text-xl font-bold mb-2">Ready to Get Started?</h2>
                        <p className="text-sm mb-6" style={{ color: '#a1a1aa' }}>Apply now and start earning commissions</p>
                        <button style={{ backgroundColor: config.brandColor, color: '#fff' }}
                          className="rounded-lg px-8 py-2.5 text-sm font-semibold">{config.ctaText}</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ApplicationFormBuilder() {
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', label: 'Full Name', type: 'text', required: true },
    { id: '2', label: 'Email Address', type: 'email', required: true },
    { id: '3', label: 'Website', type: 'url', required: false },
    { id: '4', label: 'Phone Number', type: 'text', required: false },
  ])
  const [editingField, setEditingField] = useState<FormField | null>(null)
  const [showAddField, setShowAddField] = useState(false)
  const [newFieldLabel, setNewFieldLabel] = useState('')
  const [newFieldType, setNewFieldType] = useState<FormField['type']>('text')
  const [newFieldRequired, setNewFieldRequired] = useState(false)
  const [formConfigJson, setFormConfigJson] = useState('')

  const addField = () => {
    if (!newFieldLabel.trim()) return
    const field: FormField = {
      id: String(Date.now()),
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
    }
    setFields((prev) => [...prev, field])
    setNewFieldLabel('')
    setNewFieldType('text')
    setNewFieldRequired(false)
    setShowAddField(false)
    toast.success('Field added')
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
    toast.success('Field removed')
  }

  const toggleRequired = (id: string) => {
    setFields((prev) => prev.map((f) => f.id === id ? { ...f, required: !f.required } : f))
  }

  const saveForm = () => {
    const config = { fields }
    setFormConfigJson(JSON.stringify(config, null, 2))
    toast.success('Form configuration saved')
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-content-emphasis">Form Fields</CardTitle>
              <Button size="sm" onClick={() => setShowAddField(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 px-4 py-3">
                <div className="text-content-subtle">
                  {field.type === 'email' ? <Mail className="h-4 w-4" /> :
                   field.type === 'url' ? <Link className="h-4 w-4" /> :
                   field.type === 'textarea' ? <AlignLeft className="h-4 w-4" /> :
                   field.type === 'select' ? <ChevronDown className="h-4 w-4" /> :
                   <FileText className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-content-emphasis">{field.label}</p>
                  <p className="text-xs text-content-subtle">{field.type} · {field.required ? 'Required' : 'Optional'}</p>
                </div>
                <button
                  onClick={() => toggleRequired(field.id)}
                  className={`text-xs font-medium px-2 py-0.5 rounded transition-colors ${field.required ? 'text-emerald-500 bg-emerald-500/10' : 'text-content-subtle bg-bg-subtle/50'}`}
                >
                  {field.required ? 'Required' : 'Optional'}
                </button>
                <button onClick={() => removeField(field.id)} className="text-content-subtle hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-content-subtle text-center py-4">No fields yet. Click "Add Field" to get started.</p>
            )}
          </CardContent>
        </Card>

        {showAddField && (
          <Card className="border-border-default bg-bg-default">
            <CardHeader><CardTitle className="text-lg text-content-emphasis">New Field</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-content-subtle">Field Label</label>
                <Input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}
                  placeholder="e.g. Social Media Handle" />
              </div>
              <div>
                <label className="text-sm font-medium text-content-subtle">Field Type</label>
                <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as FormField['type'])}
                  className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="url">URL</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setNewFieldRequired(!newFieldRequired)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${newFieldRequired ? 'bg-emerald-500' : 'bg-bg-subtle'}`}
                >
                  <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${newFieldRequired ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-content-emphasis">Required field</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddField(false)}>Cancel</Button>
                <Button size="sm" onClick={addField}>Add Field</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-content-subtle">{fields.length} field{fields.length !== 1 ? 's' : ''} configured</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setFields([]); toast.success('Form reset') }}>Reset</Button>
            <Button onClick={saveForm}>Save Configuration</Button>
          </div>
        </div>

        {formConfigJson && (
          <Card className="border-border-default bg-bg-default">
            <CardHeader><CardTitle className="text-lg text-content-emphasis">Configuration JSON</CardTitle></CardHeader>
            <CardContent>
              <pre className="rounded-lg bg-bg-default p-4 text-xs text-content-subtle overflow-x-auto border border-border-default">
                {formConfigJson}
              </pre>
              <Button className="mt-3" size="sm" variant="outline" onClick={() => {
                navigator.clipboard.writeText(formConfigJson)
                toast.success('JSON copied to clipboard')
              }}>
                <Copy className="mr-1.5 h-3 w-3" />
                Copy JSON
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="sticky top-20 h-fit">
        <Card className="border-border-default bg-bg-default overflow-hidden">
          <CardHeader className="border-b border-border-default bg-bg-subtle/30">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-content-emphasis">Form Preview</CardTitle>
              <div className="flex items-center gap-2 text-xs text-content-subtle">
                <Eye className="h-3 w-3" />
                Live Preview
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-content-emphasis">Apply Now</h3>
                <p className="text-xs text-content-subtle mt-1">Fill out the form to get started</p>
              </div>
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="text-sm font-medium text-content-emphasis flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors min-h-[80px]" />
                  ) : field.type === 'select' ? (
                    <select
                      className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                      <option value="">Select {field.label.toLowerCase()}</option>
                      <option value="option1">Option 1</option>
                      <option value="option2">Option 2</option>
                    </select>
                  ) : (
                    <input type={field.type} placeholder={`Enter your ${field.label.toLowerCase()}`}
                      className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
                  )}
                </div>
              ))}
              <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Submit Application
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
