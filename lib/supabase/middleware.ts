import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

// Cookie configuration for long-term session persistence (30 days)
const COOKIE_OPTIONS: Partial<CookieOptions> = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
}

export async function updateSession(request: NextRequest): Promise<{ response: NextResponse; user: User | null }> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Merge our persistence options with Supabase's options
          const mergedOptions = { ...COOKIE_OPTIONS, ...options }
          request.cookies.set({
            name,
            value,
            ...mergedOptions,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...mergedOptions,
          })
        },
        remove(name: string, options: CookieOptions) {
          const mergedOptions = { ...COOKIE_OPTIONS, ...options, maxAge: 0 }
          request.cookies.set({
            name,
            value: '',
            ...mergedOptions,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...mergedOptions,
          })
        },
      },
    }
  )

  // This refreshes the session if it's about to expire
  // The new tokens are automatically set in the response cookies
  const { data: { user } } = await supabase.auth.getUser()

  return { response, user }
}

