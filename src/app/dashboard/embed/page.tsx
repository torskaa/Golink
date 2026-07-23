'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReferralDashboard } from '@/components/embed/referral-dashboard'
import { Check, Copy, Code2, RefreshCw } from 'lucide-react'

const htmlCode = `<!-- Embed anywhere in your app -->
<div id="dubpartner-dashboard"></div>
<script src="https://cdn.dubpartner.co/embed.js"
  data-api-key="YOUR_API_KEY"
  data-partner-id="YOUR_PARTNER_ID"
  data-theme="dark">
</script>`

const reactCode = `import { ReferralDashboard } from '@dubpartner/embed'

export function App() {
  return (
    <ReferralDashboard
      apiKey="YOUR_API_KEY"
      partnerId="YOUR_PARTNER_ID"
      theme="dark"
    />
  )
}`

export default function EmbedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copiedHtml, setCopiedHtml] = useState(false)
  const [copiedReact, setCopiedReact] = useState(false)
  const [iframeTheme, setIframeTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'loading') return <div className="flex h-96 items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-content-subtle" /></div>

  const copyToClipboard = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text)
      setter(true)
      setTimeout(() => setter(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Embedded Dashboard</h1>
        <p className="text-sm text-content-subtle">
          Embed the referral dashboard in your own app with an API key
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="border-border-default bg-bg-default">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">HTML Embed</CardTitle>
            <button
              onClick={() => copyToClipboard(htmlCode, setCopiedHtml)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-content-subtle hover:text-content-emphasis transition-colors"
            >
              {copiedHtml ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedHtml ? 'Copied' : 'Copy'}
            </button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-[#0b0b0f] p-4 text-xs text-[#a1a1aa] font-mono">
              <code>{htmlCode}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-border-default bg-bg-default">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-content-subtle">React Component</CardTitle>
            <button
              onClick={() => copyToClipboard(reactCode, setCopiedReact)}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-content-subtle hover:text-content-emphasis transition-colors"
            >
              {copiedReact ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedReact ? 'Copied' : 'Copy'}
            </button>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-lg bg-[#0b0b0f] p-4 text-xs text-[#a1a1aa] font-mono">
              <code>{reactCode}</code>
            </pre>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-content-subtle">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-subtle">Theme:</span>
            <select
              value={iframeTheme}
              onChange={(e) => setIframeTheme(e.target.value as 'light' | 'dark')}
              className="rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <ReferralDashboard
            apiKey="demo-key"
            partnerId="demo-partner-123"
            theme={iframeTheme}
          />
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-content-subtle flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-content-subtle space-y-3">
          <p>
            1. Generate an API key from the <strong className="text-content-emphasis">API Keys</strong> page in your dashboard.
          </p>
          <p>
            2. Get the partner ID from your partner management panel.
          </p>
          <p>
            3. Use the HTML snippet or React component above to embed the dashboard anywhere.
          </p>
          <p>
            4. The component auto-fetches data using the API key and partner ID. Falls back to demo data if unavailable.
          </p>
          <p>
            5. Supports both <code className="rounded bg-[#1c1c21] px-1.5 py-0.5 text-xs text-content-emphasis">dark</code> and <code className="rounded bg-[#1c1c21] px-1.5 py-0.5 text-xs text-content-emphasis">light</code> themes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
