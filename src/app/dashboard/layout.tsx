'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'
import { CommandPalette, useCommandPalette } from '@/components/command-palette'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommandPalette()

  return (
    <div className="flex min-h-screen bg-bg-default">
      <Sidebar />
      <div className="ml-60 flex-1">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </div>
  )
}
