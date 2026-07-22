'use client'

import { useState } from 'react'
import { Plus, Trash2, Play } from 'lucide-react'
import { toast } from 'sonner'

interface Bounty {
  id?: string
  platform: string
  metric: string
  target: number
  reward: number
  currency: string
}

interface BountyManagerProps {
  campaignId: string
  bounties?: Bounty[]
  onChange?: (bounties: Bounty[]) => void
}

export function BountyManager({ campaignId, bounties = [], onChange }: BountyManagerProps) {
  const [items, setItems] = useState<Bounty[]>(bounties)

  const add = () => {
    const newItems = [...items, { platform: 'youtube', metric: 'views', target: 10000, reward: 100, currency: 'USD' }]
    setItems(newItems)
    onChange?.(newItems)
  }

  const remove = (i: number) => {
    const newItems = items.filter((_, idx) => idx !== i)
    setItems(newItems)
    onChange?.(newItems)
  }

  const update = (i: number, field: keyof Bounty, value: string | number) => {
    const newItems = items.map((item, idx) => idx === i ? { ...item, [field]: value } : item)
    setItems(newItems)
    onChange?.(newItems)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-content-emphasis">
          <Play className="h-4 w-4 text-red-500" />
          Social Bounties
        </div>
        <button onClick={add} className="flex items-center gap-1 text-xs text-primary hover:underline">
          <Plus className="h-3 w-3" /> Add bounty
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-content-subtle">Reward partners for creating viral content — YouTube views, TikTok likes, etc.</p>
      )}

      {items.map((bounty, i) => (
        <div key={i} className="rounded-lg border border-border-default bg-bg-subtle/30 p-3 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <select value={bounty.platform} onChange={(e) => update(i, 'platform', e.target.value)}
                className="rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis">
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">X / Twitter</option>
              </select>
              <select value={bounty.metric} onChange={(e) => update(i, 'metric', e.target.value)}
                className="rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis">
                <option value="views">Views</option>
                <option value="likes">Likes</option>
                <option value="subscribers">Subscribers</option>
              </select>
            </div>
            <button onClick={() => remove(i)} className="text-content-subtle hover:text-red-500 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-content-subtle">Target</label>
              <input type="number" min={1} value={bounty.target} onChange={(e) => update(i, 'target', Number(e.target.value))}
                className="w-full rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis" />
            </div>
            <div>
              <label className="text-[10px] text-content-subtle">Reward ($)</label>
              <input type="number" min={0} step={5} value={bounty.reward} onChange={(e) => update(i, 'reward', Number(e.target.value))}
                className="w-full rounded-md border border-input bg-bg-default px-2 py-1 text-xs text-content-emphasis" />
            </div>
          </div>
          <p className="text-[10px] text-content-subtle">
            Reward ${bounty.reward} for {bounty.target.toLocaleString()} {bounty.metric} on {bounty.platform}
          </p>
        </div>
      ))}
    </div>
  )
}
