import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedPaths = ['/dashboard', '/admin', '/api/workspaces', '/api/campaigns', '/api/links', '/api/analytics']

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/workspaces/:path*',
    '/api/campaigns/:path*',
    '/api/links/:path*',
    '/api/analytics/:path*',
    '/api/admin/:path*',
  ],
}

export async function proxy(req: NextRequest) {
  const authToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!authToken && protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p))) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}
