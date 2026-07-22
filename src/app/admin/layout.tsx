'use client'

import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { CommandPalette, useCommandPalette } from '@/components/command-palette'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommandPalette()

  return (
    <div className="flex min-h-screen bg-bg-default">
      <AdminSidebar />
      <div className="ml-60 flex-1">
        <main className="p-6">{children}</main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  )
}
