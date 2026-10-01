import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Chequeo optimista de sesión para rutas protegidas. Solo mira la presencia de
 * la cookie `tensi_token`, sin red ni base de datos; la verificación real la
 * hace `verifySession()` (DAL) en el Server Component.
 */
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has('tensi_token')

  if (!hasSessionCookie) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
