'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Webhook, Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_OPTIONS = [
  { value: 'link.clicked', label: 'Link Clicked' },
  { value: 'lead.created', label: 'Lead Created' },
  { value: 'lead.won', label: 'Sale Completed' },
]

interface WebhookItem {
  id: string
  url: string
  events: string
  secret: string
  isActive: boolean
  createdAt: string
}

export default function WebhooksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['link.clicked'])

  const fetchWebhooks = () => {
    fetch('/api/webhooks')
      .then((r) => r.json())
      .then(setWebhooks)
      .catch(() => {})
  }

  useEffect(() => {
    if (status === 'authenticated') fetchWebhooks()
  }, [status])

  if (status === 'unauthenticated') { router.push('/login'); return null }

  const createWebhook = async () => {
    if (!newUrl.trim()) return
    const res = await fetch('/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl.trim(), events: selectedEvents, workspaceId: 'default' }),
    })
    if (res.ok) {
      toast.success('Webhook created')
      setShowNew(false)
      setNewUrl('')
      fetchWebhooks()
    } else {
      toast.error('Failed to create webhook')
    }
  }

  const toggleWebhook = async (wh: WebhookItem) => {
    const res = await fetch('/api/webhooks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: wh.id, isActive: !wh.isActive }),
    })
    if (res.ok) {
      setWebhooks((prev) => prev.map((w) => w.id === wh.id ? { ...w, isActive: !w.isActive } : w))
      toast.success(wh.isActive ? 'Webhook paused' : 'Webhook activated')
    }
  }

  const deleteWebhook = async (id: string) => {
    const res = await fetch(`/api/webhooks?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setWebhooks((prev) => prev.filter((w) => w.id !== id))
      toast.success('Webhook deleted')
    }
  }

  const events: string[] = JSON.parse(webhooks[0]?.events || '[]')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Webhooks</h1>
          <p className="text-sm text-content-subtle">Receive real-time events when links are clicked or conversions happen</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Webhook
        </Button>
      </div>

      {showNew && (
        <Card className="border-border-default bg-bg-default animate-slide-up">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="https://api.your-app.com/webhooks/dubpartner"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
            <div>
              <p className="text-xs font-medium text-content-subtle mb-2">Events</p>
              <div className="flex flex-wrap gap-2">
                {EVENT_OPTIONS.map((ev) => (
                  <button
                    key={ev.value}
                    onClick={() => setSelectedEvents((prev) => prev.includes(ev.value) ? prev.filter((e) => e !== ev.value) : [...prev, ev.value])}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedEvents.includes(ev.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input text-content-subtle hover:text-content-emphasis'
                    }`}
                  >
                    {ev.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createWebhook}>Create Webhook</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {webhooks.length === 0 && !showNew ? (
        <EmptyState icon={<Webhook className="h-5 w-5" />} title="No webhooks" description="Create webhooks to receive real-time events from your links" />
      ) : (
        <div className="grid gap-3">
          {webhooks.map((wh) => (
            <Card key={wh.id} className="border-border-default bg-bg-default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-content-emphasis truncate">{wh.url}</span>
                      <Badge variant={wh.isActive ? 'success' : 'secondary'}>{wh.isActive ? 'Active' : 'Paused'}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-content-subtle">
                      <span>Events: {JSON.parse(wh.events).join(', ')}</span>
                      <span>·</span>
                      <span>Secret: <code className="text-primary">{wh.secret.slice(0, 16)}...</code></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle" onClick={() => toggleWebhook(wh)}>
                      {wh.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-red-500" onClick={() => deleteWebhook(wh.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
