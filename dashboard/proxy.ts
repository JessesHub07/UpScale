import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sessionToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/get-quote') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/api/web-lead') ||
    /\.(png|webp|jpg|jpeg|svg|ico|gif)$/i.test(pathname)
  ) {
    return NextResponse.next()
  }

  const session = request.cookies.get('upscale_session')?.value

  if (session !== sessionToken()) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
