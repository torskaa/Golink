import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BarChart3, Link2, Shield, Zap, Award } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-default">
      <header className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">D</span>
          </div>
          <span className="text-lg font-semibold text-content-emphasis">DubPartner</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/discover">
            <Button variant="ghost" className="text-content-subtle hover:text-content-emphasis">
              <Award className="mr-1.5 h-4 w-4" />
              Discover
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-content-subtle hover:text-content-emphasis">Log in</Button>
          </Link>
          <Link href="/register">
            <Button>Sign up</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-content-emphasis">
            Modern Affiliate Marketing
            <br />
            <span className="text-primary">for Southeast Asia</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-content-subtle">
            Build, manage, and scale your partner program with lightning-fast link infrastructure,
            real-time analytics, and seamless payouts.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg">
                Get started free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/discover">
              <Button variant="outline" size="lg">
                <Award className="mr-2 h-4 w-4" />
                Partner Discovery
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Edge Redirects', desc: 'Lightning-fast link redirection at the edge with real click tracking.' },
            { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track clicks, conversions, and revenue with Dub.co-style dashboards.' },
            { icon: Link2, title: 'Smart Links', desc: 'Custom short links with UTM tracking and partner attribution.' },
            { icon: Shield, title: 'Enterprise Security', desc: 'RLS policies, rate limiting, and fraud detection built-in.' },
            { icon: Award, title: 'Partner Discovery', desc: 'Creators can browse and apply to campaigns directly.' },
            { icon: BarChart3, title: 'Automated Payouts', desc: 'Commission calculations with Stripe integration and PromptPay support.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border-default bg-bg-default p-6 transition-all hover:border-border-default/80 hover:shadow-sm">
              <feature.icon className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-content-emphasis">{feature.title}</h3>
              <p className="mt-2 text-sm text-content-subtle">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
