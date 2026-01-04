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

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      // Check for supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/ogg'
      
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
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(1000) // Collect data every second
      setRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error: any) {
      console.error('Error starting recording:', error)
      
      // Provide specific error messages
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone access was denied. Please allow microphone access in your browser settings and try again.\n\nIn Chrome: Click the lock icon in the address bar → Site settings → Microphone → Allow')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.')
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        alert('Your microphone is busy or unavailable. Please close other apps using the microphone and try again.')
      } else if (error.name === 'OverconstrainedError') {
        alert('Could not satisfy audio constraints. Trying with default settings...')
        // Retry with basic settings
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          const mediaRecorder = new MediaRecorder(stream)
          mediaRecorderRef.current = mediaRecorder
          audioChunksRef.current = []
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) audioChunksRef.current.push(event.data)
          }
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
            setPendingRecording(audioBlob)
            setShowTitleModal(true)
            stream.getTracks().forEach(track => track.stop())
          }
          mediaRecorder.start(1000)
          setRecording(true)
          setRecordingTime(0)
          timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000)
        } catch (retryError) {
          alert('Failed to access microphone. Please check your browser permissions.')
        }
      } else {
        alert(`Failed to access microphone: ${error.message || 'Unknown error'}. Please check your browser permissions.`)
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
    setSelectedRecording(recording)

    try {
      // In a real app, you'd call a transcription API (e.g., OpenAI Whisper, Deepgram)
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockTranscription = "This is a sample transcription of the audio recording. In a real implementation, this would be generated by a speech-to-text API service."

      const { error } = await supabase
        .from('diffuse_recordings')
        .update({ transcription: mockTranscription })
        .eq('id', recording.id)

      if (error) throw error

      fetchRecordings()
      setSelectedRecording({ ...recording, transcription: mockTranscription })
    } catch (error) {
      console.error('Error transcribing:', error)
      alert('Failed to transcribe recording')
    } finally {
      setTranscribing(false)
    }
  }

  const deleteRecording = async (id: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return

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
                <th className="text-right py-4 px-6 text-caption text-medium-gray font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((recording) => (
                <tr
                  key={recording.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="text-body-md text-secondary-white font-medium">{recording.title}</p>
                  </td>
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatDuration(recording.duration)}
                  </td>
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatRelativeTime(recording.created_at)}
                  </td>
                  <td className="py-4 px-6">
                    {recording.transcription ? (
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
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-end">
                      {!recording.transcription ? (
                        <button
                          onClick={() => transcribeRecording(recording)}
                          disabled={transcribing}
                          className="text-body-sm text-cosmic-orange hover:text-rich-orange transition-colors disabled:opacity-50"
                        >
                          {transcribing && selectedRecording?.id === recording.id
                            ? 'Transcribing...'
                            : 'Transcribe'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedRecording(recording)}
                          className="text-body-sm text-cosmic-orange hover:text-rich-orange transition-colors"
                        >
                          View
                        </button>
                      )}
                      <span className="text-medium-gray">|</span>
                      <button
                        onClick={() => deleteRecording(recording.id, recording.file_path)}
                        className="text-body-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
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

      {/* Transcription Modal */}
      {selectedRecording && selectedRecording.transcription && !transcribing && (
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
            <div className="mb-4">
              <p className="text-body-sm text-medium-gray">
                {formatDuration(selectedRecording.duration)} • {formatRelativeTime(selectedRecording.created_at)}
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-glass">
              <p className="text-body-md text-secondary-white whitespace-pre-wrap leading-relaxed">
                {selectedRecording.transcription}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

