'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { Globe, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Domain {
  id: string
  name: string
  customDomain: string | null
  domainVerified: boolean
}

export default function DomainsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [domainInput, setDomainInput] = useState('')
  const [verifying, setVerifying] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/domains').then((r) => r.json()).then(setDomains).catch(() => {})
    }
  }, [status])

  if (status === 'unauthenticated') { router.push('/login'); return null }

  const handleSave = async (workspaceId: string) => {
    const res = await fetch('/api/domains', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, customDomain: domainInput || null }),
    })
    if (res.ok) {
      toast.success('Domain saved')
      setEditing(null)
      setDomains((prev) => prev.map((d) => d.id === workspaceId ? { ...d, customDomain: domainInput } : d))
    } else {
      toast.error('Failed to save domain')
    }
  }

  const handleVerify = async (workspaceId: string) => {
    setVerifying(workspaceId)
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    })
    setVerifying(null)
    if (res.ok) {
      toast.success('Domain verified!')
      setDomains((prev) => prev.map((d) => d.id === workspaceId ? { ...d, domainVerified: true } : d))
    } else {
      toast.error('Verification failed')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Custom Domains</h1>
        <p className="text-sm text-content-subtle">Connect your own domain for branded short links</p>
      </div>

      {domains.length === 0 ? (
        <EmptyState icon={<Globe className="h-5 w-5" />} title="No workspaces" description="Create a workspace to set up a custom domain" />
      ) : (
        <div className="grid gap-4">
          {domains.map((ws) => (
            <Card key={ws.id} className="border-border-default bg-bg-default">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-medium text-content-emphasis">{ws.name}</h3>
                    {ws.customDomain ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-primary">{ws.customDomain}</span>
                        {ws.domainVerified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-xs text-content-subtle">
                          {ws.domainVerified ? 'Verified' : 'Pending verification'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-content-subtle">No custom domain set</p>
                    )}
                  </div>
                </div>

                {editing === ws.id ? (
                  <div className="mt-4 space-y-3">
                    <Input
                      placeholder="links.yourbrand.com"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                    />
                    <p className="text-xs text-content-subtle">
                      Set a CNAME record pointing to <code className="text-primary">link.dubpartner.co</code>
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(ws.id)}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(ws.id); setDomainInput(ws.customDomain || '') }}>
                      {ws.customDomain ? 'Edit' : 'Add Domain'}
                    </Button>
                    {ws.customDomain && !ws.domainVerified && (
                      <Button size="sm" onClick={() => handleVerify(ws.id)} disabled={verifying === ws.id}>
                        {verifying === ws.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        Verify
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
