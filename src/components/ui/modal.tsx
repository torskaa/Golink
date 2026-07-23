'use client'

import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 animate-scale-in">
        <div className={cn(
          'mx-auto overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl max-h-[90vh] overflow-y-auto',
          className || 'max-w-lg',
        )}>
          <div className="flex items-start justify-between border-b border-border-default px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-content-emphasis">{title}</h2>
              {description && <p className="text-xs text-content-subtle">{description}</p>}
            </div>
            <button onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
