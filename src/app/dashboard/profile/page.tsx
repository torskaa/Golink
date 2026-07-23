'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Copy, Check, Upload, Trash2,
} from 'lucide-react'

const MOCK_PROFILE = {
  id: 'cm123abc',
  name: 'Somchai Affiliate',
  email: 'somchai@example.com',
  image: null as string | null,
  role: 'AFFILIATE',
  taxId: '123-45-6789',
  taxCountry: 'TH',
  paypalEmail: 'somchai@paypal.me',
  promptpayId: '081-234-5678',
  totalRevenue: 12450,
  totalPayouts: 8900,
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border-default bg-bg-default">
      <div className="flex flex-col gap-1 px-6 pt-6 pb-4 border-b border-border-default">
        <h2 className="text-sm font-semibold text-content-emphasis">{title}</h2>
        <p className="text-xs text-content-subtle">{description}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis placeholder-content-subtle/50 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
      {...props}
    />
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-bg-subtle'}`}>
      <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  )
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [p, setP] = useState(MOCK_PROFILE)
  const [copied, setCopied] = useState('')
  const [name, setName] = useState(p.name)
  const [email, setEmail] = useState(p.email)
  const [paypal, setPaypal] = useState(p.paypalEmail)
  const [promptpay, setPromptpay] = useState(p.promptpayId)
  const [taxId, setTaxId] = useState(p.taxId)
  const [taxCountry, setTaxCountry] = useState(p.taxCountry)

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
    toast.success('Copied!')
  }

  const handleSave = () => {
    setP(prev => ({ ...prev, name, email, paypalEmail: paypal, promptpayId: promptpay, taxId, taxCountry }))
    toast.success('Saved')
  }

  const referralUrl = `https://link.dubpartner.co/r/${p.name.toLowerCase().replace(/\s+/g, '-')}`
  const embedCode = `<script src="https://link.dubpartner.co/embed.js" data-id="${p.id}"></script>`

  return (
    <div className="animate-fade-in max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Profile</h1>
        <p className="text-sm text-content-subtle mt-1">Manage your account and payout settings</p>
      </div>

      {/* Avatar */}
      <div className="rounded-xl border border-border-default bg-bg-default">
        <div className="px-6 pt-6 pb-4 border-b border-border-default">
          <h2 className="text-sm font-semibold text-content-emphasis">Your Avatar</h2>
          <p className="text-xs text-content-subtle mt-0.5">This is your avatar on DubPartner.</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-subtle text-xl font-bold text-content-subtle overflow-hidden ring-2 ring-border-default">
                {p.image ? (
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  p.name.charAt(0).toUpperCase()
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-4 w-4 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => toast.success('Avatar updated')} />
            </div>
            <div className="flex flex-col gap-1">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="mr-1.5 h-3 w-3" /> Upload
              </Button>
              <button className="text-xs text-content-subtle hover:text-content-emphasis transition-colors text-left">Remove</button>
            </div>
          </div>
        </div>
      </div>

      {/* Name */}
      <FormSection title="Your Name" description="This is your display name on DubPartner.">
        <div className="flex items-start justify-between gap-6">
          <div className="w-48 shrink-0 pt-2">
            <p className="text-sm text-content-emphasis">Name</p>
            <p className="mt-0.5 text-xs text-content-subtle">Max 32 characters.</p>
          </div>
          <div className="flex-1 max-w-sm space-y-3">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Steve Jobs" maxLength={32} />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Email */}
      <FormSection title="Your Email" description="This is the email you use to log in and receive notifications.">
        <div className="flex items-start justify-between gap-6">
          <div className="w-48 shrink-0 pt-2">
            <p className="text-sm text-content-emphasis">Email</p>
          </div>
          <div className="flex-1 max-w-sm space-y-3">
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Referral Link */}
      <FormSection title="Your Referral Link" description="Share this link to get credit for referrals.">
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle/30 px-3.5 py-2.5">
            <code className="flex-1 text-sm text-content-emphasis font-mono truncate">{referralUrl}</code>
            <button onClick={() => handleCopy('link', referralUrl)} className="shrink-0 text-content-subtle hover:text-content-emphasis transition-colors">
              {copied === 'link' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-content-subtle/60">Embed code:</p>
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle/30 px-3.5 py-2.5">
            <code className="flex-1 text-xs text-content-emphasis font-mono truncate">{embedCode}</code>
            <button onClick={() => handleCopy('embed', embedCode)} className="shrink-0 text-content-subtle hover:text-content-emphasis transition-colors">
              {copied === 'embed' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </FormSection>

      {/* Payout Methods */}
      <div className="rounded-xl border border-border-default bg-bg-default">
        <div className="px-6 pt-6 pb-4 border-b border-border-default">
          <h2 className="text-sm font-semibold text-content-emphasis">Payout Methods</h2>
          <p className="text-xs text-content-subtle mt-0.5">Manage your payout methods for receiving commissions.</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">PayPal</p>
              <p className="mt-0.5 text-xs text-content-subtle">Receive payouts to your PayPal account.</p>
            </div>
            <div className="flex-1 max-w-sm space-y-3">
              <Input value={paypal} onChange={e => setPaypal(e.target.value)} type="email" placeholder="paypal@email.com" />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-border-default" />
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">PromptPay (Thailand)</p>
              <p className="mt-0.5 text-xs text-content-subtle">For Thai affiliates.</p>
            </div>
            <div className="flex-1 max-w-sm space-y-3">
              <Input value={promptpay} onChange={e => setPromptpay(e.target.value)} placeholder="Phone number or PromptPay ID" />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Information */}
      <div className="rounded-xl border border-border-default bg-bg-default">
        <div className="px-6 pt-6 pb-4 border-b border-border-default">
          <h2 className="text-sm font-semibold text-content-emphasis">Tax Information</h2>
          <p className="text-xs text-content-subtle mt-0.5">Manage your tax information for compliance.</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">Tax Residency</p>
            </div>
            <div className="flex-1 max-w-sm">
              <select value={taxCountry} onChange={e => setTaxCountry(e.target.value)}
                className="w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="TH">Thailand</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="SG">Singapore</option>
                <option value="JP">Japan</option>
                <option value="KR">South Korea</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border-default" />
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">Tax ID</p>
              <p className="mt-0.5 text-xs text-content-subtle">Your Tax ID is encrypted and stored securely.</p>
            </div>
            <div className="flex-1 max-w-sm space-y-3">
              <Input value={taxId} onChange={e => setTaxId(e.target.value)} placeholder="XX-XXXXXXX" />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
          <div className="border-t border-border-default" />
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">W-9 Form (US)</p>
              <p className="mt-0.5 text-xs text-content-subtle">Submit your taxpayer information.</p>
            </div>
            <div className="flex-1 max-w-sm">
              <Button variant="outline" size="sm"><Upload className="mr-1.5 h-3 w-3" />Upload</Button>
            </div>
          </div>
          <div className="border-t border-border-default" />
          <div className="flex items-start justify-between gap-6">
            <div className="w-48 shrink-0 pt-2">
              <p className="text-sm text-content-emphasis">W-8BEN (Non-US)</p>
              <p className="mt-0.5 text-xs text-content-subtle">For international affiliates.</p>
            </div>
            <div className="flex-1 max-w-sm">
              <Button variant="outline" size="sm"><Upload className="mr-1.5 h-3 w-3" />Upload</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border-default bg-bg-default">
        <div className="px-6 pt-6 pb-4 border-b border-border-default">
          <h2 className="text-sm font-semibold text-content-emphasis">Notifications</h2>
          <p className="text-xs text-content-subtle mt-0.5">Manage your email notification preferences.</p>
        </div>
        <div className="divide-y divide-border-default">
          {[
            { id: 'payout', label: 'Payout received', desc: 'Get notified when you receive a payout' },
            { id: 'campaign', label: 'New campaign available', desc: 'Get notified when brands launch new campaigns' },
            { id: 'approved', label: 'Join request approved', desc: 'Get notified when a brand approves your request' },
            { id: 'weekly', label: 'Weekly summary', desc: 'Receive a weekly summary of your earnings' },
          ].map((n) => (
            <div key={n.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-content-emphasis">{n.label}</p>
                <p className="text-xs text-content-subtle mt-0.5">{n.desc}</p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-red-500/20 bg-bg-default">
        <div className="px-6 pt-6 pb-4 border-b border-red-500/20">
          <h2 className="text-sm font-semibold text-content-emphasis">Danger Zone</h2>
          <p className="text-xs text-content-subtle mt-0.5">Irreversible actions for your account.</p>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-content-emphasis">Delete Account</p>
              <p className="text-xs text-content-subtle mt-0.5">Permanently delete your account and all data.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={() => toast.error('Please contact support')}>
              <Trash2 className="mr-1.5 h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
