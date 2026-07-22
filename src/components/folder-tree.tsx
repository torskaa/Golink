'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, Folder, FolderOpen, Plus, MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  _count: { links: number; children: number }
  children?: FolderNode[]
}

interface FolderTreeProps {
  workspaceId: string
  selectedFolderId: string | null
  onSelect: (folderId: string | null) => void
}

function buildTree(folders: FolderNode[]): FolderNode[] {
  const map = new Map<string, FolderNode>()
  const roots: FolderNode[] = []

  folders.forEach((f) => {
    map.set(f.id, { ...f, children: [] })
  })

  folders.forEach((f) => {
    const node = map.get(f.id)!
    if (f.parentId && map.has(f.parentId)) {
      map.get(f.parentId)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export function FolderTree({ workspaceId, selectedFolderId, onSelect }: FolderTreeProps) {
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)

  const fetchFolders = async () => {
    const res = await fetch(`/api/folders?workspaceId=${workspaceId}`)
    if (res.ok) setFolders(buildTree(await res.json()))
  }

  useEffect(() => { if (workspaceId) fetchFolders() }, [workspaceId])

  const createFolder = async (name: string, parentId: string | null) => {
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parentId, workspaceId }),
    })
    if (res.ok) { toast.success('Folder created'); fetchFolders(); setCreating(false); setNewName('') }
    else { const err = await res.json(); toast.error(err.error || 'Failed') }
  }

  const deleteFolder = async (id: string) => {
    const res = await fetch(`/api/folders?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Folder deleted'); fetchFolders(); if (selectedFolderId === id) onSelect(null) }
  }

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderFolder = (folder: FolderNode, depth: number = 0) => {
    const isSelected = selectedFolderId === folder.id
    const isExpanded = expanded.has(folder.id)
    const hasChildren = (folder.children?.length || 0) > 0

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'group flex items-center gap-1 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors',
            isSelected ? 'bg-bg-subtle text-content-emphasis' : 'text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis'
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => {
            onSelect(folder.id)
            if (hasChildren) toggle(folder.id)
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); toggle(folder.id) }}
            className={cn('p-0.5 transition-transform', isExpanded && 'rotate-90')}
          >
            <ChevronRight className="h-3 w-3" />
          </button>
          {isExpanded ? <FolderOpen className="h-3.5 w-3.5 shrink-0" /> : <Folder className="h-3.5 w-3.5 shrink-0" />}
          <span className="flex-1 truncate text-xs">{folder.name}</span>
          <span className="text-[10px] text-content-subtle/60">{folder._count.links}</span>
          <div className="hidden group-hover:flex items-center gap-0.5">
            <button onClick={(e) => { e.stopPropagation(); setParentId(folder.id); setCreating(true) }} className="p-0.5 text-content-subtle hover:text-content-emphasis">
              <Plus className="h-3 w-3" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); deleteFolder(folder.id) }} className="p-0.5 text-content-subtle hover:text-red-500">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="animate-fade-in">
            {folder.children!.map((child) => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-[11px] font-medium uppercase text-content-subtle/60">Folders</span>
        <button onClick={() => { setParentId(null); setCreating(true) }} className="p-0.5 text-content-subtle hover:text-content-emphasis">
          <Plus className="h-3 w-3" />
        </button>
      </div>

      <button
        onClick={() => onSelect(null)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors',
          selectedFolderId === null ? 'bg-bg-subtle text-content-emphasis' : 'text-content-subtle hover:bg-bg-subtle/50 hover:text-content-emphasis'
        )}
      >
        <Folder className="h-3.5 w-3.5" />
        All Links
      </button>

      {folders.map((folder) => renderFolder(folder))}

      {creating && (
        <div className="flex items-center gap-1 px-2 py-1 animate-fade-in">
          <input
            type="text"
            placeholder="Folder name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim() && createFolder(newName.trim(), parentId)}
            className="flex-1 rounded border border-input bg-bg-default px-2 py-0.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none"
            autoFocus
            onBlur={() => { setTimeout(() => setCreating(false), 200) }}
          />
        </div>
      )}
    </div>
  )
}
