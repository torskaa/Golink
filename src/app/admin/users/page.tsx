'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Kbd } from '@/components/ui/kbd'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search, Shield, ShieldOff, Mail, Command } from 'lucide-react'
import { toast } from 'sonner'

const users = [
  { id: '1', name: 'Admin User', email: 'admin@dubpartner.co', role: 'ADMIN', status: 'active', createdAt: 'Jan 15, 2026' },
  { id: '2', name: 'Demo Brand Co.', email: 'brand@example.com', role: 'BRAND', status: 'active', createdAt: 'Mar 20, 2026' },
  { id: '3', name: 'Jane Doe', email: 'jane@example.com', role: 'AFFILIATE', status: 'active', createdAt: 'Apr 2, 2026' },
  { id: '4', name: 'Jennie Kim', email: 'jennie@example.com', role: 'AFFILIATE', status: 'active', createdAt: 'Apr 5, 2026' },
  { id: '5', name: 'TikTok Creator', email: 'tiktok@example.com', role: 'AFFILIATE', status: 'active', createdAt: 'May 12, 2026' },
  { id: '6', name: 'Lisa Manoban', email: 'lisa@example.com', role: 'AFFILIATE', status: 'suspended', createdAt: 'Jun 1, 2026' },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = searchQuery
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-content-emphasis">Users</h1>
        <p className="text-sm text-content-subtle">Manage platform users</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-subtle" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-bg-default py-2.5 pl-10 pr-4 text-sm text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default">
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-content-subtle uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-content-subtle uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-bg-subtle/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-bg-subtle text-xs text-content-subtle">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-content-emphasis">{user.name}</p>
                        <p className="text-xs text-content-subtle">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'ADMIN' ? 'default' : user.role === 'BRAND' ? 'success' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-content-subtle">{user.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-content-emphasis">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-red-500">
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-emerald-500">
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
