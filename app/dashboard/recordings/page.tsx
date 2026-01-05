'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDuration } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import AudioPlayer from '@/components/dashboard/AudioPlayer'

type RecordingStatus = 'recorded' | 'generating' | 'transcribed'

interface Recording {
  id: string
  user_id: string
  title: string
  duration: number
  file_path: string
  transcription: string | null
  status: RecordingStatus
  created_at: string
}

export default function RecordingsPage() {
  const { user } = useAuth()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [recording, setRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [newRecordingTitle, setNewRecordingTitle] = useState('')
  const [pendingRecording, setPendingRecording] = useState<Blob | null>(null)
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [pendingTranscription, setPendingTranscription] = useState<string | null>(null) // Holds unsaved transcription
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
  const [hasAttemptedRecording, setHasAttemptedRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  // Check microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
          
          // Listen for permission changes
          result.onchange = () => {
            setMicPermission(result.state as 'granted' | 'denied' | 'prompt')
          }
        }
      } catch (error) {
        // Some browsers don't support permission query for microphone
        console.log('Permission query not supported, will check on recording start')
      }
    }
    checkMicPermission()
  }, [])

  const fetchRecordings = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('diffuse_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // Table doesn't exist yet - show empty state
        console.warn('diffuse_recordings table not found')
        setRecordings([])
        setLoading(false)
        return
      }
      setRecordings(data || [])
    } catch (error) {
      console.error('Error fetching recordings:', error)
      setRecordings([])
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  const startRecording = async () => {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.')
      return
    }

    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      alert('Microphone access requires a secure connection (HTTPS). Please access this site via HTTPS.')
      return
    }

    try {
      setHasAttemptedRecording(true)
      console.log('Requesting microphone access...')
      
      // Simple getUserMedia call - this should trigger the browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      console.log('Microphone access granted!')
      setMicPermission('granted')
      
      // Determine best supported format
      let mimeType = 'audio/webm'
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg'
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setPendingRecording(audioBlob)
        setShowTitleModal(true)
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        alert('An error occurred during recording. Please try again.')
        setRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording
      mediaRecorder.start(1000)
      setRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      
    } catch (error: any) {
      console.error('Error starting recording:', error.name, error.message)
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicPermission('denied')
        alert('Microphone access was denied.\n\nTo enable:\n1. Click the lock/info icon in your browser address bar\n2. Find "Microphone" in the permissions\n3. Change it to "Allow"\n4. Refresh the page and try again')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('Your microphone is busy or unavailable. Please close other apps that might be using the microphone and try again.')
      } else if (error.name === 'AbortError') {
        alert('Microphone access was aborted. Please try again.')
      } else {
        alert(`Could not access microphone: ${error.message || error.name || 'Unknown error'}`)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const saveRecording = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pendingRecording || !user) return

    setLoading(true)
    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, pendingRecording)

      if (uploadError) throw uploadError

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('diffuse_recordings')
        .insert({
          user_id: user.id,
          title: newRecordingTitle,
          duration: recordingTime,
          file_path: fileName,
          status: 'recorded',
        })

      if (dbError) throw dbError

      setNewRecordingTitle('')
      setShowTitleModal(false)
      setPendingRecording(null)
      setRecordingTime(0)
      fetchRecordings()
    } catch (error) {
      console.error('Error saving recording:', error)
      alert('Failed to save recording')
    } finally {
      setLoading(false)
    }
  }

  const transcribeRecording = async (recording: Recording) => {
    setTranscribing(true)

    try {
      // Update status to 'generating'
      await supabase
        .from('diffuse_recordings')
        .update({ status: 'generating' })
        .eq('id', recording.id)

      // Update local state immediately
      setSelectedRecording({ ...recording, status: 'generating' })
      fetchRecordings()

      // First get a signed URL using the client-side auth
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('recordings')
        .createSignedUrl(recording.file_path, 3600) // 1 hour expiry

      if (signedUrlError || !signedUrlData?.signedUrl) {
        // Revert status on error
        await supabase
          .from('diffuse_recordings')
          .update({ status: 'recorded' })
          .eq('id', recording.id)
        throw new Error('Failed to get audio URL for transcription')
      }

      // Send the signed URL to the transcription API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingId: recording.id,
          audioUrl: signedUrlData.signedUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Revert status on error
        await supabase
          .from('diffuse_recordings')
          .update({ status: 'recorded' })
          .eq('id', recording.id)
        throw new Error(data.error || 'Transcription failed')
      }

      // Transcription successful - store as pending (not saved yet)
      // User must click "Save" to permanently store it
      setPendingTranscription(data.transcription)
      // Keep status as 'generating' until user saves - but update local state to show preview
      setSelectedRecording({ ...recording, status: 'generating' })
    } catch (error) {
      console.error('Error transcribing:', error)
      alert(error instanceof Error ? error.message : 'Failed to transcribe recording')
      fetchRecordings() // Refresh to get correct status
    } finally {
      setTranscribing(false)
    }
  }

  // Save the transcription permanently to the database
  const saveTranscription = async () => {
    if (!selectedRecording || !pendingTranscription) return

    try {
      const { error } = await supabase
        .from('diffuse_recordings')
        .update({ 
          transcription: pendingTranscription,
          status: 'transcribed'
        })
        .eq('id', selectedRecording.id)

      if (error) throw error

      // Update local state
      setSelectedRecording({ 
        ...selectedRecording, 
        transcription: pendingTranscription, 
        status: 'transcribed' 
      })
      setPendingTranscription(null)
      fetchRecordings()
    } catch (error) {
      console.error('Error saving transcription:', error)
      alert('Failed to save transcription')
    }
  }

  // Fetch signed URL for audio playback using client-side Supabase
  const fetchAudioUrl = async (filePath: string) => {
    console.log('Fetching audio URL for:', filePath)
    setLoadingAudio(true)
    setAudioUrl(null)
    
    try {
      // Use client-side Supabase which has the user's auth session
      const { data, error } = await supabase.storage
        .from('recordings')
        .createSignedUrl(filePath, 3600) // 1 hour expiry

      console.log('Signed URL response:', { data, error })

      if (error) {
        console.error('Supabase signed URL error:', error)
        throw error
      }

      if (data?.signedUrl) {
        console.log('Setting audio URL:', data.signedUrl.substring(0, 100) + '...')
        setAudioUrl(data.signedUrl)
      } else {
        throw new Error('No signed URL returned')
      }
    } catch (error: any) {
      console.error('Error fetching audio URL:', error?.message || error)
      setAudioUrl(null)
    } finally {
      setLoadingAudio(false)
    }
  }

  // Fetch audio URL when a recording is selected
  useEffect(() => {
    if (selectedRecording) {
      fetchAudioUrl(selectedRecording.file_path)
    } else {
      setAudioUrl(null)
    }
  }, [selectedRecording])

  // Poll for transcription completion when a recording is generating
  useEffect(() => {
    if (!selectedRecording || selectedRecording.status !== 'generating') return

    const pollInterval = setInterval(async () => {
      const { data, error } = await supabase
        .from('diffuse_recordings')
        .select('*')
        .eq('id', selectedRecording.id)
        .single()

      if (error) {
        console.error('Error polling recording:', error)
        return
      }

      if (data && data.status !== 'generating') {
        // Transcription completed or failed - update local state
        setSelectedRecording(data)
        fetchRecordings() // Refresh the list too
        clearInterval(pollInterval)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(pollInterval)
  }, [selectedRecording?.id, selectedRecording?.status, supabase])

  // Cancel transcription - reset status to 'recorded'
  const cancelTranscription = async (recordingId: string) => {
    try {
      const { error } = await supabase
        .from('diffuse_recordings')
        .update({ status: 'recorded' })
        .eq('id', recordingId)

      if (error) throw error

      // Update local state
      if (selectedRecording && selectedRecording.id === recordingId) {
        setSelectedRecording({ ...selectedRecording, status: 'recorded' })
      }
      setTranscribing(false)
      setPendingTranscription(null)
      fetchRecordings()
    } catch (error) {
      console.error('Error cancelling transcription:', error)
      alert('Failed to cancel transcription')
    }
  }

  // Open a recording - fetch fresh data from DB
  const openRecording = async (rec: Recording) => {
    // Clear any pending transcription from previous recording
    setPendingTranscription(null)
    
    // Fetch fresh data to ensure we have the latest status/transcription
    const { data, error } = await supabase
      .from('diffuse_recordings')
      .select('*')
      .eq('id', rec.id)
      .single()

    if (error || !data) {
      console.error('Error fetching recording:', error)
      // Fall back to cached data if fetch fails
      setSelectedRecording(rec)
      return
    }

    setSelectedRecording(data)
  }

  const deleteRecording = async (id: string, filePath: string) => {
    try {
      // Delete from storage
      await supabase.storage.from('recordings').remove([filePath])

      // Delete from database
      const { error } = await supabase
        .from('diffuse_recordings')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchRecordings()
    } catch (error) {
      console.error('Error deleting recording:', error)
      alert('Failed to delete recording')
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white">Recordings</h1>
          {/* Mic permission warning - only show after user attempted and was denied */}
          {hasAttemptedRecording && micPermission === 'denied' && (
            <p className="text-body-sm text-red-400 mt-1">
              Microphone access denied. Please enable it in your browser settings and try again.
            </p>
          )}
        </div>
        
        {/* Recording Controls */}
        {!recording ? (
          <button
            onClick={startRecording}
            className="btn-primary px-4 py-2 flex items-center gap-2 text-body-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Recording
          </button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-body-md text-secondary-white">
                {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="btn-primary px-4 py-2 bg-red-500 hover:bg-red-600 text-body-sm"
            >
              Stop Recording
            </button>
          </div>
        )}
      </div>

      {/* Recordings Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : recordings.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          }
          title="No Recordings Yet"
          description="Start recording audio to create transcriptions for your projects."
          action={{
            label: 'Start Recording',
            onClick: startRecording,
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recordings.map((rec) => (
            <div
              key={rec.id}
              onClick={() => openRecording(rec)}
              className="glass-container p-6 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Recording Title */}
              <h3 className="text-heading-md text-secondary-white font-medium mb-4">
                {rec.title}
              </h3>
              
              {/* Details */}
              <div className="space-y-2">
                {/* Duration & Status */}
                <div className="flex items-center gap-2 text-caption uppercase tracking-wider">
                  <span className="text-purple-400">{formatDuration(rec.duration)}</span>
                  <span className="text-medium-gray">•</span>
                  {rec.status === 'transcribed' ? (
                    <span className="text-cosmic-orange">TRANSCRIBED</span>
                  ) : rec.status === 'generating' ? (
                    <span className="text-pale-blue flex items-center gap-1.5">
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      GENERATING
                    </span>
                  ) : (
                    <span className="text-medium-gray">RECORDED</span>
                  )}
                </div>
                
                {/* Created Date */}
                <div className="text-caption text-medium-gray uppercase tracking-wider">
                  {new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Title Modal */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-md w-full">
            <h2 className="text-heading-lg text-secondary-white mb-6">Save Recording</h2>
            <form onSubmit={saveRecording} className="space-y-4">
              <div>
                <label className="block text-body-sm text-secondary-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newRecordingTitle}
                  onChange={(e) => setNewRecordingTitle(e.target.value)}
                  placeholder="Town Council Meeting - Jan 2026"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTitleModal(false)
                    setPendingRecording(null)
                  }}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recording Detail Modal */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-heading-lg text-secondary-white">
                {selectedRecording.title}
              </h2>
              <button
                onClick={() => setSelectedRecording(null)}
                className="text-medium-gray hover:text-secondary-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-body-sm text-medium-gray">
                {formatDuration(selectedRecording.duration)} • {formatRelativeTime(selectedRecording.created_at)}
              </p>
            </div>

            {/* Audio Player */}
            <div className="mb-6">
              <h3 className="text-body-sm text-medium-gray mb-3">Audio Playback</h3>
              {loadingAudio ? (
                <div className="flex items-center justify-center py-4 bg-white/5 rounded-glass">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-body-sm text-medium-gray">Loading audio...</span>
                </div>
              ) : audioUrl ? (
                <AudioPlayer src={audioUrl} onError={() => setAudioUrl(null)} />
              ) : (
                <div className="p-4 bg-white/5 rounded-glass text-center">
                  <p className="text-body-sm text-red-400">Failed to load audio. The file may be unavailable.</p>
                </div>
              )}
            </div>

            {/* Transcription Section */}
            <div className="mb-6">
              <h3 className="text-body-sm text-medium-gray mb-3">Transcription</h3>
              {selectedRecording.status === 'transcribed' && selectedRecording.transcription ? (
                // Permanently saved transcription
                <div className="p-4 bg-white/5 rounded-glass">
                  <p className="text-body-md text-secondary-white whitespace-pre-wrap leading-relaxed">
                    {selectedRecording.transcription}
                  </p>
                </div>
              ) : pendingTranscription ? (
                // Preview of unsaved transcription - needs to be saved
                <div className="p-4 bg-white/5 rounded-glass">
                  <p className="text-body-md text-secondary-white whitespace-pre-wrap leading-relaxed">
                    {pendingTranscription}
                  </p>
                  <p className="text-body-sm text-cosmic-orange mt-3">
                    ⚠️ Transcription preview - click Save to keep it
                  </p>
                </div>
              ) : transcribing ? (
                // Actively generating
                <div className="p-4 bg-white/5 rounded-glass text-center">
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-cosmic-orange animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-body-md text-secondary-white">Generating transcription...</span>
                  </div>
                  <p className="text-body-sm text-medium-gray mt-3">
                    This may take a minute. You can close this and check back later.
                  </p>
                </div>
              ) : (
                // No transcription - show generate button
                <div className="p-4 bg-white/5 rounded-glass text-center">
                  <p className="text-body-sm text-medium-gray mb-4">No transcription yet</p>
                  <button
                    onClick={() => transcribeRecording(selectedRecording)}
                    className="btn-primary px-6 py-3"
                  >
                    Generate Transcription
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setSelectedRecording(null)
                  setPendingTranscription(null)
                }}
                className="btn-secondary flex-1 py-3"
              >
                Close
              </button>
              {pendingTranscription ? (
                // Show Save button when there's unsaved transcription
                <button
                  onClick={saveTranscription}
                  className="btn-primary py-3 px-6"
                >
                  Save
                </button>
              ) : transcribing ? (
                // Show Cancel button while actively generating
                <button
                  onClick={() => cancelTranscription(selectedRecording.id)}
                  className="btn-secondary py-3 px-6 text-yellow-400 hover:text-yellow-300"
                >
                  Cancel
                </button>
              ) : null}
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this recording?')) {
                    deleteRecording(selectedRecording.id, selectedRecording.file_path)
                    setSelectedRecording(null)
                  }
                }}
                className="btn-secondary py-3 px-6 text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

