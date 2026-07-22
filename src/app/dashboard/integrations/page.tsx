'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  RefreshCw,
  Plug,
  Cable,
  Settings,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ExternalLink,
  Clock,
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: 'Analytics' | 'CRM' | 'Payments' | 'Communication'
  icon: string
  connected: boolean
  comingSoon: boolean
  configFields?: { key: string; label: string; type: 'text' | 'password' | 'select' }[]
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Sync payments and subscription data automatically',
    category: 'Payments',
    icon: '💳',
    connected: true,
    comingSoon: false,
    configFields: [
      { key: 'apiKey', label: 'Secret Key', type: 'password' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
    ],
  },
  {
    id: 'segment',
    name: 'Segment',
    description: 'Send conversion events to Segment',
    category: 'Analytics',
    icon: '📊',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'writeKey', label: 'Write Key', type: 'password' },
      { key: 'sourceName', label: 'Source Name', type: 'text' },
    ],
  },
  {
    id: 'tinybird',
    name: 'Tinybird',
    description: 'Real-time analytics pipeline',
    category: 'Analytics',
    icon: '🐦',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'token', label: 'API Token', type: 'password' },
      { key: 'workspace', label: 'Workspace', type: 'text' },
    ],
  },
  {
    id: 'rudderstack',
    name: 'RudderStack',
    description: 'Open-source CDP integration',
    category: 'Analytics',
    icon: '🔄',
    connected: false,
    comingSoon: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get payout and partner notifications',
    category: 'Communication',
    icon: '💬',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text' },
      { key: 'channel', label: 'Channel Name', type: 'text' },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts and deals',
    category: 'CRM',
    icon: '🎯',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'portalId', label: 'Portal ID', type: 'text' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM sync',
    category: 'CRM',
    icon: '☁️',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'instanceUrl', label: 'Instance URL', type: 'text' },
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce integration',
    category: 'Payments',
    icon: '🛍️',
    connected: false,
    comingSoon: false,
    configFields: [
      { key: 'storeUrl', label: 'Store URL', type: 'text' },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
    ],
  },
]

const categoryColors: Record<string, string> = {
  Analytics: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CRM: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  Payments: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  Communication: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.id, i.connected]))
  )
  const [configuring, setConfiguring] = useState<string | null>(null)
  const [configValues, setConfigValues] = useState<Record<string, Record<string, string>>>({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'unauthenticated') return null
  if (status === 'loading') return <div className="flex h-96 items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-content-subtle" /></div>

  const toggleConnection = (id: string) => {
    const integration = integrations.find((i) => i.id === id)
    if (integration?.comingSoon) {
      toast.error(`${integration.name} is coming soon`)
      return
    }
    if (connected[id]) {
      setConnected((prev) => ({ ...prev, [id]: false }))
      setConfiguring(null)
      toast.success('Integration disconnected')
    } else {
      setConfiguring(id)
    }
  }

  const saveConfig = (id: string) => {
    setConnected((prev) => ({ ...prev, [id]: true }))
    setConfiguring(null)
    toast.success('Integration connected successfully')
  }

  const filteredIntegrations = integrations.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = ['Analytics', 'CRM', 'Payments', 'Communication'] as const

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Integrations</h1>
          <p className="text-sm text-content-subtle">Connect your favorite tools and services</p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-bg-default px-3 py-2 pl-9 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-content-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {categories.map((category) => {
        const categoryIntegrations = filteredIntegrations.filter((i) => i.category === category)
        if (categoryIntegrations.length === 0) return null

        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-content-emphasis">{category}</h2>
              <div className="h-px flex-1 bg-border-default" />
              <span className="text-xs text-content-subtle">{categoryIntegrations.length} integration{categoryIntegrations.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {categoryIntegrations.map((integration) => (
                <Card key={integration.id} className="border-border-default bg-bg-default">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-subtle text-lg">
                        {integration.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-content-emphasis">{integration.name}</h3>
                          {integration.comingSoon && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              <Clock className="mr-0.5 h-2.5 w-2.5" />
                              Coming soon
                            </Badge>
                          )}
                          {connected[integration.id] && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0">
                              <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-content-subtle mb-3">{integration.description}</p>
                        <Badge variant="secondary" className={`text-[10px] ${categoryColors[integration.category]}`}>
                          {integration.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {connected[integration.id] ? (
                          <Button size="sm" variant="outline" onClick={() => setConfiguring(integration.id)}>
                            <Settings className="mr-1 h-3 w-3" />
                            Configure
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => toggleConnection(integration.id)} disabled={integration.comingSoon}>
                            <Plug className="mr-1 h-3 w-3" />
                            Connect
                          </Button>
                        )}
                        <button
                          onClick={() => toggleConnection(integration.id)}
                          className="text-content-subtle hover:text-red-500 transition-colors"
                          title={connected[integration.id] ? 'Disconnect' : ''}
                        >
                          {connected[integration.id] && <XCircle className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {configuring === integration.id && (
                      <div className="mt-4 pt-4 border-t border-border-default space-y-3">
                        {integration.configFields?.map((field) => (
                          <div key={field.key}>
                            <label className="text-xs font-medium text-content-subtle">{field.label}</label>
                            <input
                              type={field.type}
                              value={configValues[integration.id]?.[field.key] || ''}
                              onChange={(e) =>
                                setConfigValues((prev) => ({
                                  ...prev,
                                  [integration.id]: {
                                    ...(prev[integration.id] || {}),
                                    [field.key]: e.target.value,
                                  },
                                }))
                              }
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className="mt-1 w-full rounded-lg border border-input bg-bg-default px-3 py-2 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                            />
                          </div>
                        ))}
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setConfiguring(null); setConnected((prev) => ({ ...prev, [integration.id]: false })) }}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={() => saveConfig(integration.id)}>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-subtle">
            <Cable className="h-8 w-8 text-content-subtle" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-content-emphasis">No integrations found</h3>
          <p className="mt-1 text-sm text-content-subtle">Try adjusting your search query</p>
        </div>
      )}
    </div>
  )
}
