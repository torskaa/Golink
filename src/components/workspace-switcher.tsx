'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Building2 } from 'lucide-react'

const workspaces = [
  { id: 'default', name: 'Demo Brand Co.', slug: 'demo-brand' },
  { id: 'personal', name: 'Personal Workspace', slug: 'personal' },
]

export function WorkspaceSwitcher() {
  const [selected, setSelected] = useState(workspaces[0])
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-content-emphasis hover:bg-bg-bg-subtletransition-colors"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
          <Building2 className="h-3 w-3 text-primary" />
        </div>
        <span className="hidden lg:inline">{selected.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-content-subtle" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-56 animate-scale-in overflow-hidden rounded-lg border border-border-default bg-bg-default shadow-lg">
            <div className="px-3 py-2 text-[11px] font-medium uppercase text-content-subtle">
              Workspaces
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setSelected(ws)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  selected.id === ws.id
                    ? 'bg-bg-subtle text-content-emphasis'
                    : 'text-content-emphasis hover:bg-bg-subtle/50'
                )}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
                  <Building2 className="h-3 w-3 text-primary" />
                </div>
                <span className="flex-1 truncate">{ws.name}</span>
                {selected.id === ws.id && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
