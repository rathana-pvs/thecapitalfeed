import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ADMIN_ROUTES = [
  '/admin/login',
  '/admin/create-first-user',
  '/admin/forgot',
  '/admin/reset',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const isPublic = PUBLIC_ADMIN_ROUTES.some((route) => pathname.startsWith(route))
    if (!isPublic && !request.cookies.has('payload-token')) {
      // Reconstruct the URL using forwarded host/proto set by Nginx
      const proto = request.headers.get('x-forwarded-proto') || 'https'
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'thecapitalfeed.com'
      const loginUrl = `${proto}://${host}/admin/login`
      return NextResponse.redirect(loginUrl, { status: 307 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
