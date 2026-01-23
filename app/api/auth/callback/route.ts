import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { NextRequest } from 'next/server'

/**
 * Validate redirect URL to prevent open redirect attacks
 */
function validateRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    // Only allow redirects to same origin or configured site URL
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://diffuse.ai'
    const allowedHost = new URL(allowedOrigin).hostname
    
    return parsed.hostname === allowedHost || parsed.hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

/**
 * Get safe redirect URL
 */
function getSafeRedirectUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://diffuse.ai'
  return `${siteUrl}${path}`
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, 'public')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Validate code parameter (should be a valid auth code)
  if (code && code.length > 1000) {
    // Auth codes shouldn't be this long - potential attack
    return NextResponse.redirect(getSafeRedirectUrl('/login?error=auth_callback_error'), { status: 302 })
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Safe redirect to dashboard
      return NextResponse.redirect(getSafeRedirectUrl('/dashboard'), { status: 302 })
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(getSafeRedirectUrl('/login?error=auth_callback_error'), { status: 302 })
}

