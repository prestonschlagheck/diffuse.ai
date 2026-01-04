'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDuration } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'

interface Recording {
  id: string
  user_id: string
  title: string
  duration: number
  file_path: string
  transcription: string | null
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
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')
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
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordingId: recording.id,
          filePath: recording.file_path,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      fetchRecordings()
      setSelectedRecording({ ...recording, transcription: data.transcription })
    } catch (error) {
      console.error('Error transcribing:', error)
      alert(error instanceof Error ? error.message : 'Failed to transcribe recording')
    } finally {
      setTranscribing(false)
    }
  }

  // Fetch signed URL for audio playback
  const fetchAudioUrl = async (filePath: string) => {
    setLoadingAudio(true)
    try {
      const response = await fetch('/api/recordings/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get audio URL')
      }

      setAudioUrl(data.signedUrl)
    } catch (error) {
      console.error('Error fetching audio URL:', error)
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
          {micPermission === 'denied' && (
            <p className="text-body-sm text-red-400 mt-1">
              Microphone access denied. Please enable it in your browser settings.
            </p>
          )}
        </div>
        
        {/* Recording Controls */}
        {!recording ? (
          <button
            onClick={startRecording}
            className="btn-primary px-6 py-3 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="btn-primary px-6 py-3 bg-red-500 hover:bg-red-600"
            >
              Stop Recording
            </button>
          </div>
        )}
      </div>

      {/* Recordings List */}
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
        <div className="glass-container overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">TITLE</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">DURATION</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecording(rec)}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <p className="text-body-md text-secondary-white font-medium">{rec.title}</p>
                  </td>
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatDuration(rec.duration)}
                  </td>
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatRelativeTime(rec.created_at)}
                  </td>
                  <td className="py-4 px-6">
                    {rec.transcription ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-caption font-medium rounded-full border bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Transcribed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-caption font-medium rounded-full border bg-medium-gray/20 text-medium-gray border-medium-gray/30">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-body-sm text-medium-gray">Loading audio...</span>
                </div>
              ) : audioUrl ? (
                <audio
                  controls
                  className="w-full"
                  src={audioUrl}
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="p-4 bg-white/5 rounded-glass text-center">
                  <p className="text-body-sm text-red-400">Failed to load audio. The file may be unavailable.</p>
                </div>
              )}
            </div>

            {/* Transcription Section */}
            <div className="mb-6">
              <h3 className="text-body-sm text-medium-gray mb-3">Transcription</h3>
              {selectedRecording.transcription ? (
                <div className="p-4 bg-white/5 rounded-glass">
                  <p className="text-body-md text-secondary-white whitespace-pre-wrap leading-relaxed">
                    {selectedRecording.transcription}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-white/5 rounded-glass text-center">
                  <p className="text-body-sm text-medium-gray mb-4">No transcription yet</p>
                  <button
                    onClick={() => transcribeRecording(selectedRecording)}
                    disabled={transcribing}
                    className="btn-primary px-6 py-3 disabled:opacity-50"
                  >
                    {transcribing ? 'Generating...' : 'Generate Transcription'}
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedRecording(null)}
                className="btn-secondary flex-1 py-3"
              >
                Close
              </button>
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

