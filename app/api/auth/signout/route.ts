import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { NextRequest } from 'next/server'

/**
 * Get safe redirect URL
 */
function getSafeRedirectUrl(path: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.diffuse.press'
  return `${siteUrl}${path}`
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await checkRateLimit(request, 'authenticated')
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // Use site URL instead of Supabase URL for redirect
  return NextResponse.redirect(getSafeRedirectUrl('/'), {
    status: 302,
  })
}

