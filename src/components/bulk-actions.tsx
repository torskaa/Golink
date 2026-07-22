'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Tag as TagIcon, X } from 'lucide-react'
import { toast } from 'sonner'

interface BulkActionsProps {
  selectedIds: string[]
  onClear: () => void
  onBulkTag: () => void
  onBulkDelete: () => void
}

export function BulkActions({ selectedIds, onClear, onBulkTag, onBulkDelete }: BulkActionsProps) {
  if (selectedIds.length === 0) return null

  return (
    <div className="animate-slide-up flex items-center gap-3 rounded-lg border border-border-default bg-bg-default px-4 py-2.5 shadow-sm">
      <span className="text-sm text-content-subtle">
        <strong className="text-content-emphasis">{selectedIds.length}</strong> selected
      </span>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={onBulkTag}>
          <TagIcon className="mr-1 h-3.5 w-3.5" />
          Tag
        </Button>
        <Button variant="outline" size="sm" onClick={onBulkDelete} className="text-red-500 hover:text-red-600">
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Delete
        </Button>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="mr-1 h-3.5 w-3.5" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
