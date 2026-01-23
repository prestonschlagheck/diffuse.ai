/**
 * CSRF Protection
 * Implements CSRF token validation for state-changing operations
 * 
 * Note: Next.js API routes are generally safe from CSRF because:
 * - SameSite cookies are used by default
 * - API routes don't rely on cookies for authentication (Supabase uses tokens)
 * 
 * However, we add additional protection for sensitive operations.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  // Generate a random token
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create CSRF token for session
 */
export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get('csrf-token')
  
  if (existingToken?.value) {
    return existingToken.value
  }
  
  // Generate new token
  const token = generateCSRFToken()
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  })
  
  return token
}

/**
 * Validate CSRF token from request
 * For API routes, we check the X-CSRF-Token header
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get('csrf-token')?.value
  const headerToken = request.headers.get('X-CSRF-Token')
  
  if (!cookieToken || !headerToken) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  return constantTimeEqual(cookieToken, headerToken)
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * CSRF protection middleware for sensitive operations
 * Note: This is optional since Supabase auth already provides protection
 * Use this for extra-sensitive operations if needed
 */
export async function requireCSRFToken(request: NextRequest): Promise<NextResponse | null> {
  // Only check CSRF for state-changing methods
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null // No CSRF check needed for read operations
  }
  
  // For POST/PUT/DELETE, validate CSRF token
  const isValid = await validateCSRFToken(request)
  
  if (!isValid) {
    return NextResponse.json(
      { error: 'CSRF token validation failed' },
      { status: 403 }
    )
  }
  
  return null
}
