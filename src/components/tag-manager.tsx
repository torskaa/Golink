'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { toast } from 'sonner'

const TAG_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

interface Tag {
  id: string
  name: string
  color: string
  _count?: { links: number }
}

interface TagManagerProps {
  workspaceId: string
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
}

export function TagManager({ workspaceId, selectedTags, onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#2563eb')

  useEffect(() => {
    fetch(`/api/tags?workspaceId=${workspaceId}`)
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {})
  }, [workspaceId])

  const createTag = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), color: newColor, workspaceId }),
    })
    if (res.ok) {
      const tag = await res.json()
      setTags((prev) => [...prev, tag])
      onTagsChange([...selectedTags, tag.id])
      setNewName('')
      setShowNew(false)
      toast.success('Tag created')
    } else {
      const err = await res.json()
      toast.error(err.error || 'Failed to create tag')
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag.id)
          return (
            <button
              key={tag.id}
              onClick={() => {
                onTagsChange(
                  active
                    ? selectedTags.filter((t) => t !== tag.id)
                    : [...selectedTags, tag.id]
                )
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                active ? 'ring-1 ring-white/20' : 'opacity-70 hover:opacity-100'
              )}
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
              {active && <X className="h-2.5 w-2.5" />}
            </button>
          )
        })}
        <button
          onClick={() => setShowNew(!showNew)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-content-subtle hover:text-content-emphasis transition-colors"
        >
          <Plus className="h-3 w-3" /> New
        </button>
      </div>

      {showNew && (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="flex gap-1">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={cn('h-5 w-5 rounded-full transition-transform', newColor === c && 'scale-125 ring-1 ring-white')}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="text"
            placeholder="Tag name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTag()}
            className="flex-1 rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none"
            autoFocus
          />
          <button onClick={createTag} className="rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90">
            Add
          </button>
        </div>
      )}
    </div>
  )
}
