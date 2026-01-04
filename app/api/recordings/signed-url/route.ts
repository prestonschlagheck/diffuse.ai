import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing filePath' },
        { status: 400 }
      )
    }

    // Get a signed URL for the audio file (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from('recordings')
      .createSignedUrl(filePath, 3600)

    if (error || !data?.signedUrl) {
      console.error('Error getting signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to get audio URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
    })
  } catch (error) {
    console.error('Signed URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

