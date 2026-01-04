import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@supabase/supabase-js'

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

// Create a Supabase client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { recordingId, audioUrl } = await request.json()

    if (!recordingId || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing recordingId or audioUrl' },
        { status: 400 }
      )
    }

    console.log('Starting transcription for recording:', recordingId)
    console.log('Audio URL:', audioUrl.substring(0, 100) + '...')

    // Transcribe using AssemblyAI
    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioUrl,
      speech_model: 'universal',
    })

    if (transcript.status === 'error') {
      console.error('AssemblyAI transcription error:', transcript.error)
      return NextResponse.json(
        { error: transcript.error || 'Transcription failed' },
        { status: 500 }
      )
    }

    // Update the recording with the transcription
    const { error: updateError } = await supabase
      .from('diffuse_recordings')
      .update({ transcription: transcript.text })
      .eq('id', recordingId)

    if (updateError) {
      console.error('Error updating recording:', updateError)
      return NextResponse.json(
        { error: 'Failed to save transcription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transcription: transcript.text,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

