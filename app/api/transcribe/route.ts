import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@/lib/supabase/server'

// Increase timeout for long audio files (up to 5 minutes)
// Note: Vercel Pro required for >60s, Vercel Hobby max is 10s
export const maxDuration = 300

const assemblyai = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
})

// Generate a title from chapters or transcription content
function generateTitle(chapters: any[] | null, transcriptionText: string | null): string {
  // Try to use the first chapter's headline
  if (chapters && chapters.length > 0 && chapters[0].headline) {
    return chapters[0].headline
  }
  
  // Fallback: use first sentence or first 50 chars of transcription
  if (transcriptionText) {
    // Try to get first sentence
    const firstSentence = transcriptionText.split(/[.!?]/)[0]?.trim()
    if (firstSentence && firstSentence.length > 10 && firstSentence.length < 100) {
      return firstSentence
    }
    // Otherwise truncate
    if (transcriptionText.length > 50) {
      return transcriptionText.substring(0, 50).trim() + '...'
    }
    return transcriptionText.trim()
  }
  
  return 'Untitled Recording'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Parse request body with error handling
    let requestBody
    try {
      requestBody = await request.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { error: 'Invalid request body. Please send JSON with audioUrl.' },
        { status: 400 }
      )
    }
    
    const { recordingId, audioUrl, autoSave, currentTitle } = requestBody

    // audioUrl is required, recordingId is optional (not provided for project file uploads)
    if (!audioUrl) {
      return NextResponse.json(
        { error: 'Missing audioUrl' },
        { status: 400 }
      )
    }

    console.log('Starting transcription' + (recordingId ? ` for recording: ${recordingId}` : ' for file upload'))
    console.log('Audio URL:', audioUrl.substring(0, 100) + '...')

    // Transcribe using AssemblyAI with auto_chapters for smart title generation
    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioUrl,
      speech_model: 'universal',
      auto_chapters: true,
    })

    if (transcript.status === 'error') {
      console.error('AssemblyAI transcription error:', transcript.error)
      // Reset status back to 'recorded' on failure (only if this is a recording)
      if (recordingId) {
        await supabase
          .from('diffuse_recordings')
          .update({ status: 'recorded' })
          .eq('id', recordingId)
      }
      return NextResponse.json(
        { error: transcript.error || 'Transcription failed' },
        { status: 500 }
      )
    }

    // Generate a smart title from chapters
    const suggestedTitle = generateTitle(transcript.chapters || null, transcript.text || null)
    
    // Use user-provided title if they entered one, otherwise use AI-generated
    const shouldAutoGenerateTitle = !currentTitle || currentTitle === 'Processing...' || currentTitle === ''
    const finalTitle = shouldAutoGenerateTitle ? suggestedTitle : currentTitle

    // If autoSave is true and we have a recordingId, save directly to the database
    if (autoSave && recordingId) {
      console.log('Auto-saving transcription to database for recording:', recordingId)
      console.log('Final title:', finalTitle)
      
      const { data: updateData, error: updateError } = await supabase
        .from('diffuse_recordings')
        .update({ 
          title: finalTitle,
          transcription: transcript.text,
          original_transcription: transcript.text,
          status: 'transcribed'
        })
        .eq('id', recordingId)
        .select()

      if (updateError) {
        console.error('Error saving transcription:', updateError)
        return NextResponse.json(
          { error: 'Failed to save transcription' },
          { status: 500 }
        )
      }
      
      console.log('Transcription saved successfully:', updateData ? 'Updated' : 'No rows returned')
    }

    return NextResponse.json({
      success: true,
      transcription: transcript.text,
      suggestedTitle: suggestedTitle,
      finalTitle: finalTitle,
      chapters: transcript.chapters || [],
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    
    // Provide more helpful error messages
    let errorMessage = 'Internal server error'
    
    if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
      errorMessage = 'Transcription timed out. The audio file may be too long. Try a shorter file or contact support.'
    } else if (error.message?.includes('Invalid audio')) {
      errorMessage = 'Invalid audio file. Please ensure the file is a valid MP3, WAV, or M4A file.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

