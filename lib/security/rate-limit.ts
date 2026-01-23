/**
 * Rate Limiting Utility
 * Implements IP and user-based rate limiting following OWASP best practices
 * 
 * Rate limits:
 * - IP-based: Prevents abuse from anonymous users
 * - User-based: Prevents abuse from authenticated users
 * - Graceful degradation: Returns 429 with Retry-After header
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Rate limit configuration
const RATE_LIMITS = {
  // Public endpoints (no auth required)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes per IP
  },
  // Authenticated endpoints
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // 200 requests per 15 minutes per user
  },
  // Expensive operations (transcription, workflow)
  expensive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 requests per hour per user
  },
  // File uploads
  fileUpload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20, // 20 uploads per 15 minutes per user
  },
} as const

type RateLimitType = keyof typeof RATE_LIMITS

// In-memory store for rate limiting (use Redis in production)
// Key format: "ip:IP_ADDRESS" or "user:USER_ID"
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP (handles proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback to connection remote address (if available)
  return request.ip || 'unknown'
}

/**
 * Check rate limit for a request
 * @returns null if allowed, NextResponse with 429 if rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'authenticated'
): Promise<NextResponse | null> {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  
  // Get identifier (IP or user ID)
  let identifier: string
  let isUserBased = false
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // User-based rate limiting for authenticated users
      identifier = `user:${user.id}`
      isUserBased = true
    } else {
      // IP-based rate limiting for anonymous users
      const ip = getClientIP(request)
      identifier = `ip:${ip}`
    }
  } catch {
    // If auth check fails, fall back to IP-based
    const ip = getClientIP(request)
    identifier = `ip:${ip}`
  }
  
  // Get current rate limit state
  const current = rateLimitStore.get(identifier)
  
  if (!current || current.resetTime < now) {
    // First request or window expired, start new window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return null // Allowed
  }
  
  // Check if limit exceeded
  if (current.count >= config.maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
        },
      }
    )
  }
  
  // Increment count
  current.count++
  rateLimitStore.set(identifier, current)
  
  // Add rate limit headers to response
  return null // Allowed, but we'll add headers in the actual response
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  request: NextRequest,
  type: RateLimitType = 'authenticated'
): Record<string, string> {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  
  let identifier: string
  try {
    // Try to get user ID (async, but we'll handle sync for headers)
    // For headers, we'll use a simplified approach
    const ip = getClientIP(request)
    identifier = `ip:${ip}`
  } catch {
    identifier = 'unknown'
  }
  
  const current = rateLimitStore.get(identifier)
  
  if (!current || current.resetTime < now) {
    return {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': (config.maxRequests - 1).toString(),
      'X-RateLimit-Reset': new Date(now + config.windowMs).toISOString(),
    }
  }
  
  return {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': (config.maxRequests - current.count).toString(),
    'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
  }
}
