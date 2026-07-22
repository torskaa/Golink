'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Globe, Monitor, Smartphone, RefreshCw, Play, Pause, MousePointerClick, MapPin, Link2, ExternalLink } from 'lucide-react'

type ClickEvent = {
  id: string
  ip: string
  country: string
  city: string
  device: string
  browser: string
  os: string
  referer: string
  linkUrl: string
  linkSlug: string
  timestamp: string
}

const generateMockEvent = (): ClickEvent => {
  const countries = ['Thailand', 'Indonesia', 'Vietnam', 'Philippines', 'Malaysia', 'Singapore', 'US', 'Japan']
  const devices = ['Mobile', 'Desktop', 'Tablet']
  const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']
  const oses = ['iOS', 'Android', 'Windows', 'macOS']
  const referers = ['tiktok.com', 'facebook.com', 'instagram.com', 'twitter.com', 'google.com', 'Direct']
  const links = [
    { slug: 'summer-sale-jane', url: 'https://brand.com/summer' },
    { slug: 'jennie-fav', url: 'https://brand.com/collections/new' },
    { slug: 'tiktok-review', url: 'https://brand.com/product/xyz' },
  ]
  const link = links[Math.floor(Math.random() * links.length)]
  return {
    id: Math.random().toString(36).slice(2),
    ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    country: countries[Math.floor(Math.random() * countries.length)],
    city: 'Bangkok',
    device: devices[Math.floor(Math.random() * devices.length)],
    browser: browsers[Math.floor(Math.random() * browsers.length)],
    os: oses[Math.floor(Math.random() * oses.length)],
    referer: referers[Math.floor(Math.random() * referers.length)],
    linkUrl: link.url,
    linkSlug: link.slug,
    timestamp: new Date().toLocaleTimeString(),
  }
}

export default function AnalyticsEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<ClickEvent[]>([])
  const [isLive, setIsLive] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        setEvents((prev) => [generateMockEvent(), ...prev].slice(0, 100))
      }, 1500)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isLive])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [events])

  if (status === 'unauthenticated') return null

  const countries = [...new Set(events.map((e) => e.country))]
  const devices = [...new Set(events.map((e) => e.device))]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content-emphasis">Live Event Stream</h1>
          <p className="text-sm text-content-subtle">Real-time click events as they happen</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-bg-subtle/50 px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
            <span className="text-xs text-content-subtle">{isLive ? 'Live' : 'Paused'}</span>
          </div>
          <Button variant={isLive ? 'outline' : 'default'} size="sm" onClick={() => setIsLive(!isLive)}>
            {isLive ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
            {isLive ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEvents([])}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border-default bg-bg-default">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-medium text-content-subtle flex items-center gap-1.5">
              <Globe className="h-3 w-3" /> Countries
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="flex flex-wrap gap-1">
              {countries.slice(0, 6).map((c) => (
                <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-medium text-content-subtle flex items-center gap-1.5">
              <Smartphone className="h-3 w-3" /> Devices
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <div className="flex gap-2">
              {['Mobile', 'Desktop', 'Tablet'].map((d) => {
                const count = events.filter((e) => e.device === d).length
                return (
                  <div key={d} className="text-xs text-content-emphasis">
                    {d}: <span className="font-medium">{count}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border-default bg-bg-default">
          <CardHeader className="py-3">
            <CardTitle className="text-xs font-medium text-content-subtle flex items-center gap-1.5">
              <MousePointerClick className="h-3 w-3" /> Total Events
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0 pb-3">
            <span className="text-lg font-bold text-content-emphasis">{events.length}</span>
            <span className="text-xs text-content-subtle ml-1">this session</span>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-default bg-bg-default">
        <CardHeader className="border-b border-border-default py-3">
          <CardTitle className="text-sm font-medium text-content-subtle">Event Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={scrollRef} className="max-h-[500px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-content-subtle/50">
                <MousePointerClick className="h-6 w-6 mb-2" />
                <p className="text-sm">Waiting for events...</p>
                <p className="text-xs">Click events will appear here in real-time</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map((event, i) => (
                  <div key={event.id} className={`flex items-center gap-4 px-6 py-3 transition-colors ${i < 3 ? 'bg-primary/[0.02]' : 'hover:bg-bg-subtle/30'}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-subtle">
                      {event.device === 'Mobile' ? <Smartphone className="h-4 w-4 text-content-subtle" /> :
                       event.device === 'Tablet' ? <Monitor className="h-4 w-4 text-content-subtle" /> :
                       <Monitor className="h-4 w-4 text-content-subtle" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-content-emphasis truncate">
                          link.dubpartner.co/r/{event.linkSlug}
                        </span>
                        <span className="text-xs text-content-subtle">→</span>
                        <span className="text-xs text-content-subtle truncate">{event.linkUrl}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-content-subtle">
                          <MapPin className="h-3 w-3" /> {event.country}
                        </span>
                        <span className="text-xs text-content-subtle">·</span>
                        <span className="text-xs text-content-subtle">{event.browser} on {event.os}</span>
                        <span className="text-xs text-content-subtle">·</span>
                        <span className="text-xs text-content-subtle">via {event.referer}</span>
                        <span className="text-xs text-content-subtle">·</span>
                        <span className="text-xs text-content-subtle">{event.ip}</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-content-subtle">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
