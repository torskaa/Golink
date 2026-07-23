'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useState } from 'react'
import { Shield, Key, Globe, Bell } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings saved')
    }, 500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">System Settings</h1>
        <p className="text-sm text-content-subtle">Manage platform configuration</p>
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-content-emphasis">
            <Globe className="h-4 w-4 text-primary" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-content-emphasis">Platform Name</p>
              <p className="text-xs text-content-subtle">DubPartner SEA</p>
            </div>
            <input
              type="text"
              defaultValue="DubPartner SEA"
              className="rounded-lg border border-input bg-bg-default px-3 py-1.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
          <Separator className="bg-border-default" />
          <div>
            <p className="text-sm font-medium text-content-emphasis">Default Commission Rate</p>
            <p className="text-xs text-content-subtle">Applied to new campaigns</p>
            <input
              type="number"
              defaultValue={10}
              className="mt-1.5 w-32 rounded-lg border border-input bg-bg-default px-3 py-1.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border-default bg-bg-default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-content-emphasis">
            <Shield className="h-4 w-4 text-primary" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-content-emphasis">Rate Limiting</p>
              <p className="text-xs text-content-subtle">Max requests per minute per IP</p>
            </div>
            <input
              type="number"
              defaultValue={60}
              className="w-24 rounded-lg border border-input bg-bg-default px-3 py-1.5 text-sm text-content-emphasis focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
          <Separator className="bg-border-default" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-content-emphasis">New Registration</p>
              <p className="text-xs text-content-subtle">Allow new user registration</p>
            </div>
            <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
              <input type="checkbox" defaultChecked className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-bg-subtle after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-content-subtle after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  )
}
