'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { RefreshCw, UserPlus, Mail, X, FileText, Upload, CheckCircle2, AlertTriangle, Shield } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const isBrand = session?.user?.role === 'BRAND'

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'loading') return <div className="flex h-96 items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-content-subtle" /></div>

  return isBrand ? <BrandSettings /> : <CreatorSettings session={session} />
}

function BrandSettings() {
  const [workspaceName, setWorkspaceName] = useState('Demo Brand Co.')
  const [websiteUrl, setWebsiteUrl] = useState('https://example.com')
  const [saving, setSaving] = useState(false)
  const [teamMembers, setTeamMembers] = useState([
    { email: 'admin@demo.com', role: 'Admin', status: 'active' },
    { email: 'editor@demo.com', role: 'Editor', status: 'pending' },
  ])
  const [inviteEmail, setInviteEmail] = useState('')
  const [holdingPeriod, setHoldingPeriod] = useState('30')
  const [minPayout, setMinPayout] = useState('50')
  const [achFee, setAchFee] = useState('0')
  const [ccFee, setCcFee] = useState('2.9')
  const [paidTrafficDetection, setPaidTrafficDetection] = useState(true)
  const [selfReferralDetection, setSelfReferralDetection] = useState(true)
  const [duplicateAccountDetection, setDuplicateAccountDetection] = useState(true)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully') }, 500)
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    setTeamMembers((prev) => [...prev, { email: inviteEmail.trim(), role: 'Member', status: 'pending' }])
    setInviteEmail('')
    toast.success(`Invitation sent to ${inviteEmail}`)
  }

  const removeMember = (email: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.email !== email))
    toast.success('Member removed')
  }

  const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
    <div>
      <label className="text-sm font-medium text-content-subtle">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between rounded-lg border border-border-default bg-bg-subtle/30 px-4 py-3">
      <span className="text-sm text-content-emphasis">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-bg-subtle'}`}
      >
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-content-emphasis">Brand Settings</h1><p className="text-sm text-content-subtle">Manage your workspace</p></div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Workspace</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-subtle">Company Name</label>
            <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-content-subtle">Website URL</label>
            <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => { setWorkspaceName('Demo Brand Co.'); setWebsiteUrl('https://example.com') }}>Reset</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Team Members</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <Button onClick={handleInvite}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Invite
            </Button>
          </div>
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <div key={member.email} className="flex items-center justify-between rounded-lg border border-border-default bg-bg-subtle/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-content-subtle" />
                  <div>
                    <p className="text-sm text-content-emphasis">{member.email}</p>
                    <p className="text-xs text-content-subtle">{member.role} · {member.status}</p>
                  </div>
                </div>
                <button onClick={() => removeMember(member.email)} className="text-content-subtle hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Payout Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Holding Period"
              value={holdingPeriod}
              onChange={setHoldingPeriod}
              options={[
                { label: '7 days', value: '7' },
                { label: '14 days', value: '14' },
                { label: '30 days (recommended)', value: '30' },
                { label: '60 days', value: '60' },
              ]}
            />
            <Select
              label="Minimum Payout"
              value={minPayout}
              onChange={setMinPayout}
              options={[
                { label: '$20', value: '20' },
                { label: '$50 (recommended)', value: '50' },
                { label: '$100', value: '100' },
                { label: '$200', value: '200' },
                { label: '$500', value: '500' },
              ]}
            />
          </div>
          <Separator className="bg-border-default" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ACH Transfer Fee (%)"
              value={achFee}
              onChange={setAchFee}
              options={[
                { label: 'Free (0%)', value: '0' },
                { label: '0.5%', value: '0.5' },
                { label: '1%', value: '1' },
                { label: '1.5%', value: '1.5' },
              ]}
            />
            <Select
              label="Credit Card Fee (%)"
              value={ccFee}
              onChange={setCcFee}
              options={[
                { label: '2.9% + $0.30 (Stripe)', value: '2.9' },
                { label: '2.5% + $0.25', value: '2.5' },
                { label: '2.0% + $0.20', value: '2.0' },
              ]}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Risk Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-content-subtle">Configure fraud detection and risk monitoring rules for your affiliate program.</p>
          <div className="space-y-2">
            <Toggle
              label="Enable Paid Traffic Detection"
              checked={paidTrafficDetection}
              onChange={setPaidTrafficDetection}
            />
            <Toggle
              label="Enable Self-Referral Detection"
              checked={selfReferralDetection}
              onChange={setSelfReferralDetection}
            />
            <Toggle
              label="Enable Duplicate Account Detection"
              checked={duplicateAccountDetection}
              onChange={setDuplicateAccountDetection}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Tax Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-emphasis">W-9 Form (US)</p>
              <p className="text-xs text-content-subtle">Required for US-based affiliates. Submit your taxpayer information.</p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="mr-1.5 h-3 w-3" />
              Upload
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-emphasis">W-8BEN Form (Non-US)</p>
              <p className="text-xs text-content-subtle">For international affiliates claiming tax treaty benefits.</p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="mr-1.5 h-3 w-3" />
              Upload
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-emphasis">Tax ID (EIN/SSN)</p>
              <p className="text-xs text-content-subtle">Your Tax ID is verified and on file.</p>
            </div>
            <Badge variant="success">Verified</Badge>
          </div>
          <Separator className="bg-border-default" />
          <div>
            <label className="text-xs font-medium text-content-subtle">Auto-invoice Settings</label>
            <p className="mt-1 text-xs text-content-subtle">Invoices are automatically generated for each completed payout.</p>
            <div className="mt-2 flex items-center gap-2">
              <input type="checkbox" id="autoInvoice" defaultChecked className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
              <label htmlFor="autoInvoice" className="text-sm text-content-emphasis">Auto-generate invoices for payouts</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-content-emphasis">Delete Workspace</p><p className="text-xs text-content-subtle">This action cannot be undone</p></div>
            <Button variant="destructive" size="sm">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Badge({ variant, children }: { variant: 'success' | 'warning' | 'default'; children: React.ReactNode }) {
  const colors = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    default: 'bg-bg-subtle text-content-subtle border-border-default',
  }
  return <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${colors[variant]}`}>{children}</span>
}

function CreatorSettings({ session }: { session: any }) {
  const [promptpayId, setPromptpayId] = useState('089-xxx-xxxx')
  const [paypalEmail, setPaypalEmail] = useState('creator@example.com')
  const [saving, setSaving] = useState(false)
  const [holdingPeriod, setHoldingPeriod] = useState('30')
  const [minPayout, setMinPayout] = useState('50')
  const [achFee, setAchFee] = useState('0')
  const [ccFee, setCcFee] = useState('2.9')

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success('Settings saved successfully') }, 500)
  }

  const Select = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) => (
    <div>
      <label className="text-sm font-medium text-content-subtle">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-content-emphasis">Creator Settings</h1><p className="text-sm text-content-subtle">Manage your payment info</p></div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Payout Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-content-subtle">PromptPay ID</label>
            <input type="text" value={promptpayId} onChange={(e) => setPromptpayId(e.target.value)} placeholder="Phone number or PromptPay ID"
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
            <p className="mt-1 text-xs text-content-subtle">For Thai affiliates — receive payouts directly to PromptPay</p>
          </div>
          <div>
            <label className="text-sm font-medium text-content-subtle">PayPal Email</label>
            <input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors" />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
          <Separator className="bg-border-default" />
          <div>
            <label className="text-xs font-medium text-content-subtle">Profile</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-lg text-content-subtle">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-content-emphasis">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-content-subtle">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Payout Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Holding Period"
              value={holdingPeriod}
              onChange={setHoldingPeriod}
              options={[
                { label: '7 days', value: '7' },
                { label: '14 days', value: '14' },
                { label: '30 days (recommended)', value: '30' },
                { label: '60 days', value: '60' },
              ]}
            />
            <Select
              label="Minimum Payout"
              value={minPayout}
              onChange={setMinPayout}
              options={[
                { label: '$20', value: '20' },
                { label: '$50 (recommended)', value: '50' },
                { label: '$100', value: '100' },
                { label: '$200', value: '200' },
                { label: '$500', value: '500' },
              ]}
            />
          </div>
          <Separator className="bg-border-default" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="ACH Transfer Fee (%)"
              value={achFee}
              onChange={setAchFee}
              options={[
                { label: 'Free (0%)', value: '0' },
                { label: '0.5%', value: '0.5' },
                { label: '1%', value: '1' },
                { label: '1.5%', value: '1.5' },
              ]}
            />
            <Select
              label="Credit Card Fee (%)"
              value={ccFee}
              onChange={setCcFee}
              options={[
                { label: '2.9% + $0.30 (Stripe)', value: '2.9' },
                { label: '2.5% + $0.25', value: '2.5' },
                { label: '2.0% + $0.20', value: '2.0' },
              ]}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader><CardTitle className="text-lg text-content-emphasis">Tax Compliance</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-emphasis">W-9 Form (US)</p>
              <p className="text-xs text-content-subtle">Submit your taxpayer information for US tax reporting.</p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="mr-1.5 h-3 w-3" />
              Upload
            </Button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-content-emphasis">W-8BEN Form (Non-US)</p>
              <p className="text-xs text-content-subtle">For international affiliates claiming tax treaty benefits.</p>
            </div>
            <Button size="sm" variant="outline">
              <Upload className="mr-1.5 h-3 w-3" />
              Upload
            </Button>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-content-emphasis">Tax Withholding</p>
            </div>
            <p className="mt-1 text-xs text-content-subtle">Default withholding rate: 0%. Update your tax forms to change your withholding rate. US affiliates may be subject to 24% backup withholding if W-9 is not provided.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="taxWithholding" className="text-xs text-content-subtle">Withholding rate:</label>
            <input id="taxWithholding" type="number" defaultValue="0" min="0" max="30"
              className="w-20 rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis focus:border-ring focus:outline-none" />
            <span className="text-xs text-content-subtle">%</span>
          </div>
          <Separator className="bg-border-default" />
          <div className="flex items-center gap-3">
            <input type="checkbox" id="autoInvoiceCreator" defaultChecked className="h-4 w-4 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary" />
            <label htmlFor="autoInvoiceCreator" className="text-sm text-content-emphasis">Auto-generate invoices for each payout</label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
