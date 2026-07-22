'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkline, mockSparklineData } from '@/components/ui/sparkline'
import { QRCode, downloadQRCode } from '@/components/ui/qr-code'
import { cn } from '@/lib/utils'
import { BarChart3, Copy, ExternalLink, Trash2, Sparkles, QrCode, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface LinkRowProps {
  id: string
  key_: string
  url: string
  title?: string | null
  clicks: number
  conversions: number
  revenue: number
  isActive: boolean
  campaignName?: string
  partnerName?: string
  tags?: Array<{ id: string; name: string; color: string }>
  domain?: string
  selected?: boolean
  onSelect?: (id: string) => void
  sparklineData?: number[]
}

export function LinkRow({
  id,
  key_,
  url,
  title,
  clicks,
  conversions,
  revenue,
  isActive,
  campaignName,
  partnerName,
  tags,
  domain = 'link.dubpartner.co',
  selected,
  onSelect,
  sparklineData,
}: LinkRowProps) {
  const { data: session } = useSession()
  const isBrand = session?.user?.role === 'BRAND'
  const shortUrl = `${domain}/r/${key_}`
  const [showQR, setShowQR] = useState(false)
  const data = sparklineData || mockSparklineData()

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    toast.success('Link copied to clipboard')
  }

  return (
    <>
      <Card className={cn(
        'group border-border-default bg-bg-default transition-all hover:border-border-default/80 hover:shadow-sm',
        selected && 'ring-1 ring-primary'
      )}>
        <CardContent className="flex items-center gap-3 p-4">
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect(id)}
              className="h-4 w-4 shrink-0 rounded border-border-default bg-bg-subtle text-primary focus:ring-primary"
            />
          )}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-subtle">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-content-emphasis">{title || key_}</span>
              <Badge variant={isActive ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0">
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-content-subtle">
              <button onClick={handleCopy} className="flex items-center gap-1 text-primary hover:underline">
                {shortUrl}
                <Copy className="h-3 w-3" />
              </button>
              <span className="text-border">→</span>
              <span className="truncate max-w-[180px]">{url}</span>
              <a href={url} target="_blank" rel="noreferrer" className="text-content-subtle hover:text-content-emphasis">
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {campaignName && (
                <span className="text-[10px] text-content-subtle">Campaign: {campaignName}</span>
              )}
              {isBrand && partnerName && partnerName !== '—' && (
                <span className="text-[10px] text-content-subtle">Partner: {partnerName}</span>
              )}
              {tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center rounded px-1.5 py-0 text-[10px] font-medium"
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            <Sparkline data={data} width={56} height={20} />
          </div>

          <div className="flex items-center gap-3 text-sm shrink-0">
            <div className="text-center">
              <p className="font-medium text-content-emphasis">{clicks.toLocaleString()}</p>
              <p className="text-[10px] text-content-subtle">Clicks</p>
            </div>
            <div className="text-center hidden md:block">
              <p className="font-medium text-content-emphasis">{conversions}</p>
              <p className="text-[10px] text-content-subtle">{isBrand ? 'Leads' : 'Sales'}</p>
            </div>
            <div className="text-center">
              <p className={cn('font-medium', isBrand ? 'text-emerald-500' : 'text-blue-500')}>
                {isBrand ? `$${revenue.toFixed(2)}` : `+$${revenue.toFixed(2)}`}
              </p>
              <p className="text-[10px] text-content-subtle">{isBrand ? 'Revenue' : 'Earned'}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-content-emphasis" onClick={() => setShowQR(true)}>
              <QrCode className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-content-emphasis">
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-content-subtle hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {showQR && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-scale-in">
            <div className="overflow-hidden rounded-xl border border-border-default bg-bg-default shadow-2xl">
              <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
                <h3 className="text-sm font-semibold text-content-emphasis">QR Code</h3>
                <button onClick={() => setShowQR(false)} className="text-content-subtle hover:text-content-emphasis">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col items-center p-8 space-y-4">
                <div className="rounded-xl bg-white p-3">
                  <QRCode url={shortUrl} size={180} />
                </div>
                <p className="text-sm text-content-emphasis text-center break-all">{shortUrl}</p>
                <Button
                  onClick={() => downloadQRCode(shortUrl, key_)}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <QrCode className="mr-1.5 h-4 w-4" />
                  Download PNG
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
