import { NextRequest, NextResponse } from 'next/server'
import { AssemblyAI } from 'assemblyai'
import { createClient } from '@/lib/supabase/server'

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
    
    const { recordingId, audioUrl, autoSave, currentTitle } = await request.json()

    if (!recordingId || !audioUrl) {
      return NextResponse.json(
        { error: 'Missing recordingId or audioUrl' },
        { status: 400 }
      )
    }

    console.log('Starting transcription for recording:', recordingId)
    console.log('Audio URL:', audioUrl.substring(0, 100) + '...')

    // Transcribe using AssemblyAI with auto_chapters for smart title generation
    const transcript = await assemblyai.transcripts.transcribe({
      audio: audioUrl,
      speech_model: 'universal',
      auto_chapters: true,
    })

    if (transcript.status === 'error') {
      console.error('AssemblyAI transcription error:', transcript.error)
      // Reset status back to 'recorded' on failure
      await supabase
        .from('diffuse_recordings')
        .update({ status: 'recorded' })
        .eq('id', recordingId)
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

    // If autoSave is true, save directly to the database
    if (autoSave) {
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
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

