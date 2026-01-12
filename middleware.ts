import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth/sign-up")) {
    return NextResponse.json({ error: "Sign up is disabled" }, { status: 403 })
  }
  return NextResponse.next()
}
