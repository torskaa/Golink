'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useSession } from 'next-auth/react'
import { useCommandPalette } from '@/components/command-palette'
import { WorkspaceSwitcher } from '@/components/workspace-switcher'
import { Command, Search } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()
  const { open, setOpen } = useCommandPalette()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-default bg-bg-default/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border-default bg-bg-subtle/50 px-3 py-1.5 text-sm text-content-subtle hover:bg-bg-bg-subtletransition-colors w-64"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search pages...</span>
          <Kbd>
            <Command className="h-2.5 w-2.5" />K
          </Kbd>
        </button>

        <button
          onClick={() => setOpen(true)}
          className="sm:hidden flex items-center justify-center rounded-lg border border-border-default p-2 text-content-subtle hover:bg-bg-bg-subtletransition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <WorkspaceSwitcher />

        <div className="flex items-center gap-3 pl-3 border-l border-border-default">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-content-emphasis">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-content-subtle">{session?.user?.email}</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ''} />
            <AvatarFallback className="bg-bg-subtle text-xs text-content-subtle">
              {session?.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
