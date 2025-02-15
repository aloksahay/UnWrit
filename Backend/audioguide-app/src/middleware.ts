import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Don't log API requests to /api/logs
  if (request.nextUrl.pathname.startsWith('/api/logs')) {
    return NextResponse.next({
      headers: new Headers({
        'x-no-logging': '1',
      }),
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
} 