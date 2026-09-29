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
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
