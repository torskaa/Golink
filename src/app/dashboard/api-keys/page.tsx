'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  key: string
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const fetchKeys = () => {
    fetch('/api/api-keys')
      .then((r) => r.json())
      .then(setKeys)
      .catch(() => {})
  }

  useEffect(() => {
    if (status === 'authenticated') fetchKeys()
  }, [status])

  if (status === 'unauthenticated') { router.push('/login'); return null }

  const createKey = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), workspaceId: 'default' }),
    })
    if (res.ok) {
      const data = await res.json()
      setNewKey(data.key)
      fetchKeys()
      toast.success('API key created — copy it now, you won\'t see it again!')
    } else {
      toast.error('Failed to create key')
    }
  }

  const deleteKey = async (id: string) => {
    const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast.success('Key revoked')
    }
  }

  const toggleVisible = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">API Keys</h1>
          <p className="text-sm text-content-subtle">Manage API access for programmatic link management</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {showNew && (
        <Card className="border-border-default bg-bg-default animate-slide-up">
          <CardContent className="p-6 space-y-4">
            {newKey ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-emerald-500">Key created! Copy it now:</p>
                <div className="flex gap-2">
                  <Input value={newKey} readOnly />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copied!') }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setShowNew(false); setNewKey(null); setNewName('') }}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="My API Key"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createKey()}
                />
                <Button onClick={createKey}>Generate</Button>
                <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {keys.length === 0 && !showNew ? (
        <EmptyState icon={<Key className="h-5 w-5" />} title="No API keys" description="Create your first API key to integrate with external tools" />
      ) : (
        <div className="grid gap-3">
          {keys.map((apiKey) => (
            <Card key={apiKey.id} className="border-border-default bg-bg-default">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-content-emphasis">{apiKey.name}</span>
                    <Badge variant={apiKey.isActive ? 'success' : 'secondary'}>{apiKey.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs font-mono text-content-subtle">
                      {visibleKeys.has(apiKey.id) ? apiKey.key : `${apiKey.key.slice(0, 12)}${'•'.repeat(20)}`}
                    </span>
                    <button onClick={() => toggleVisible(apiKey.id)} className="text-content-subtle hover:text-content-emphasis">
                      {visibleKeys.has(apiKey.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(apiKey.key); toast.success('Copied!') }} className="text-content-subtle hover:text-content-emphasis">
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[10px] text-content-subtle">
                    Created {new Date(apiKey.createdAt).toLocaleDateString()}
                    {apiKey.lastUsedAt ? ` · Last used ${new Date(apiKey.lastUsedAt).toLocaleDateString()}` : ' · Never used'}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-content-subtle hover:text-red-500 shrink-0" onClick={() => deleteKey(apiKey.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
