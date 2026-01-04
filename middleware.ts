import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  // Check if the user is accessing a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the updated response with session
    const supabase = await import('@/lib/supabase/server').then(m => m.createClient())
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

