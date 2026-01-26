import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, unauthorizedResponse } from '@/lib/security/authorization'

/**
 * Backfill durations for recordings that have duration = 0
 * This is a client-side operation, so this endpoint just returns the list of recordings
 * that need duration updates. The actual duration extraction happens in the browser.
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check - only allow authenticated users
    let authResult
    try {
      authResult = await requireAuth()
    } catch {
      return unauthorizedResponse()
    }
    const { user, supabase } = authResult

    // Get all recordings with duration = 0 for this user
    const { data: recordings, error: fetchError } = await supabase
      .from('diffuse_recordings')
      .select('id, file_path')
      .eq('user_id', user.id)
      .eq('duration', 0)

    if (fetchError) {
      console.error('Error fetching recordings:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      )
    }

    if (!recordings || recordings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No recordings found with duration = 0',
        recordings: [],
        count: 0,
      })
    }

    return NextResponse.json({
      success: true,
      recordings: recordings.map(r => ({ id: r.id, file_path: r.file_path })),
      count: recordings.length,
    })
  } catch (error: any) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}
