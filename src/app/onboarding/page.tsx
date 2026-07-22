'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Building2, Megaphone, Link2, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const STEPS = [
  { id: 'welcome', icon: Building2, title: 'Welcome to DubPartner' },
  { id: 'workspace', icon: Building2, title: 'Create your Workspace' },
  { id: 'campaign', icon: Megaphone, title: 'First Campaign' },
  { id: 'done', icon: Check, title: 'You\'re all set!' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [workspaceName, setWorkspaceName] = useState('')
  const [campaignTitle, setCampaignTitle] = useState('')
  const [campaignDesc, setCampaignDesc] = useState('')
  const [loading, setLoading] = useState(false)

  const isBrand = session?.user?.role === 'BRAND'

  const handleNext = () => {
    if (step === 1 && !workspaceName.trim()) { toast.error('Enter a workspace name'); return }
    if (step === 2 && !campaignTitle.trim()) { toast.error('Enter a campaign name'); return }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workspaceName, slug: workspaceName.toLowerCase().replace(/\s+/g, '-') }),
      })
      if (isBrand) {
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workspaceId: 'default', title: campaignTitle, description: campaignDesc }),
        })
      }
      toast.success('Setup complete! Welcome to DubPartner')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-default flex items-center justify-center">
      <div className="w-full max-w-lg px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-bg-subtle text-content-subtle'
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 mx-1 rounded transition-colors ${i < step ? 'bg-primary' : 'bg-bg-subtle'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="animate-fade-in">
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-content-emphasis">Welcome to DubPartner{isBrand ? ', Brand' : ', Creator'}</h1>
              <p className="text-content-subtle">
                {isBrand
                  ? 'Launch your affiliate program in minutes. Create links, recruit partners, and track performance — all in one place.'
                  : 'Start earning commissions by promoting products you love. Join campaigns and get paid for every sale.'}
              </p>
              <Button onClick={handleNext} className="mt-4">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-content-emphasis">Name your Workspace</h2>
              <p className="text-sm text-content-subtle">This is your brand&apos;s workspace — you can change it later</p>
              <Input
                placeholder="My Brand Co."
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleNext}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && isBrand && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-content-emphasis">Create your first Campaign</h2>
              <p className="text-sm text-content-subtle">Set up your first affiliate campaign to start recruiting partners</p>
              <Input
                placeholder="Summer Launch 2026"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                autoFocus
              />
              <textarea
                placeholder="Describe your campaign..."
                value={campaignDesc}
                onChange={(e) => setCampaignDesc(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-bg-default px-3 py-2.5 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
              />
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleNext}>Skip <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 2 && !isBrand && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-content-emphasis">Explore Partner Programs</h2>
              <p className="text-sm text-content-subtle">Browse available campaigns in the Partner Discovery page and apply to promote products you love</p>
              <div className="rounded-lg border border-border-default bg-bg-subtle/30 p-4">
                <div className="flex items-center gap-3">
                  <Link2 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-content-emphasis">Pro tip</p>
                    <p className="text-xs text-content-subtle">Use the &quot;Discover&quot; page to find campaigns that match your audience</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleNext}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-content-emphasis">You&apos;re all set!</h1>
              <p className="text-content-subtle">
                {isBrand
                  ? 'Your workspace is ready. Start creating links and inviting affiliates.'
                  : 'Your account is ready. Browse campaigns and start earning.'}
              </p>
              <Button onClick={handleComplete} disabled={loading} className="mt-4">
                {loading ? 'Setting up...' : `Go to Dashboard`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
