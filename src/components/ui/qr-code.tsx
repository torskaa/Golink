'use client'

import { useEffect, useRef, useState } from 'react'
import QRCodeLib from 'qrcode'
import { Download, Image as ImageIcon, Palette } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeProps {
  url: string
  size?: number
  className?: string
  foregroundColor?: string
  logoUrl?: string
}

const SIZE_MAP = { small: 128, medium: 256, large: 512 }

export function QRCode({ url, size: initialSize = 128, className, foregroundColor = '#ffffff', logoUrl }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: initialSize,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: '#00000000',
        },
      }).then(() => {
        if (logoUrl && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const c = canvasRef.current!
              const cSize = c.width
              const logoSize = cSize * 0.25
              const x = (cSize - logoSize) / 2
              const y = (cSize - logoSize) / 2
              ctx.beginPath()
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 4, 0, Math.PI * 2)
              ctx.fillStyle = '#000000'
              ctx.fill()
              ctx.beginPath()
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
              ctx.clip()
              ctx.drawImage(img, x, y, logoSize, logoSize)
            }
            img.src = logoUrl
          }
        }
      })
    }
  }, [url, initialSize, foregroundColor, logoUrl])

  return <canvas ref={canvasRef} className={className} />
}

export function QRCodeCustomizer({ url, onClose }: { url: string; onClose?: () => void }) {
  const [color, setColor] = useState('#ffffff')
  const [logoUrl, setLogoUrl] = useState('')
  const [sizePreset, setSizePreset] = useState<keyof typeof SIZE_MAP>('medium')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const size = SIZE_MAP[sizePreset]

  useEffect(() => {
    if (canvasRef.current) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: { dark: color, light: '#00000000' },
      }).then(() => {
        if (logoUrl && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              const c = canvasRef.current!
              const cSize = c.width
              const logoSize = cSize * 0.25
              const x = (cSize - logoSize) / 2
              const y = (cSize - logoSize) / 2
              ctx.beginPath()
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 4, 0, Math.PI * 2)
              ctx.fillStyle = '#000000'
              ctx.fill()
              ctx.beginPath()
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
              ctx.clip()
              ctx.drawImage(img, x, y, logoSize, logoSize)
            }
            img.src = logoUrl
          }
        }
      })
    }
  }, [url, size, color, logoUrl])

  const handleDownload = async (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current
    if (!canvas) return
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const link = document.createElement('a')
    link.download = `qr-${Date.now()}.${format}`
    link.href = canvas.toDataURL(mimeType, 1)
    link.click()
    toast.success(`QR code downloaded as ${format.toUpperCase()}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>

      <div className="space-y-3">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-content-subtle mb-1.5">
            <Palette className="h-3 w-3" /> QR Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-border-default bg-transparent"
            />
            <span className="text-xs text-content-emphasis font-mono">{color}</span>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-content-subtle mb-1.5">
            <ImageIcon className="h-3 w-3" /> Logo URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://example.com/logo.png"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full rounded-md border border-input bg-bg-default px-2.5 py-1.5 text-xs text-content-emphasis placeholder-content-subtle focus:border-ring focus:outline-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-content-subtle mb-1.5">Size</label>
          <div className="flex items-center gap-1 rounded-lg border border-border-default bg-bg-subtle/50 p-0.5 w-fit">
            {(Object.keys(SIZE_MAP) as Array<keyof typeof SIZE_MAP>).map((s) => (
              <button
                key={s}
                onClick={() => setSizePreset(s)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sizePreset === s
                    ? 'bg-bg-default text-content-emphasis shadow-sm'
                    : 'text-content-subtle hover:text-content-emphasis'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-content-subtle mb-1.5">
            <Download className="h-3 w-3" /> Download
          </label>
          <div className="flex items-center gap-2">
            {(['png', 'jpeg'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleDownload(fmt)}
                className="rounded-md border border-input bg-bg-default px-3 py-1.5 text-xs font-medium text-content-emphasis hover:bg-bg-bg-subtletransition-colors uppercase"
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export async function downloadQRCode(url: string, filename: string, options?: { color?: string; logoUrl?: string; size?: number }) {
  const canvas = document.createElement('canvas')
  const qrSize = options?.size ?? 512
  await QRCodeLib.toCanvas(canvas, url, {
    width: qrSize,
    margin: 2,
    color: { dark: options?.color || '#ffffff', light: '#00000000' },
  })

  if (options?.logoUrl && canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const cSize = canvas.width
          const logoSize = cSize * 0.25
          const x = (cSize - logoSize) / 2
          const y = (cSize - logoSize) / 2
          ctx.beginPath()
          ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 4, 0, Math.PI * 2)
          ctx.fillStyle = '#000000'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, x, y, logoSize, logoSize)
          resolve()
        }
        img.src = options.logoUrl!
      })
    }
  }

  const link = document.createElement('a')
  link.download = `${filename}-qr.png`
  link.href = canvas.toDataURL()
  link.click()
}
