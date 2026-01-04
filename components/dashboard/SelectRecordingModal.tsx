'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDuration } from '@/lib/utils/format'
import LoadingSpinner from './LoadingSpinner'
import { CheckCircleIcon, MicrophoneIcon } from '@heroicons/react/24/outline'

interface Recording {
  id: string
  user_id: string
  title: string
  duration: number
  file_path: string
  transcription: string | null
  status: string
  created_at: string
}

interface SelectRecordingModalProps {
  projectId: string
  onClose: () => void
  onSuccess: () => void
}

export default function SelectRecordingModal({
  projectId,
  onClose,
  onSuccess,
}: SelectRecordingModalProps) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRecordings = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Only fetch recordings that have transcriptions
      const { data, error } = await supabase
        .from('diffuse_recordings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'transcribed')
        .not('transcription', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching recordings:', error)
        return
      }

      setRecordings(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchRecordings()
  }, [fetchRecordings])

  const handleSelectRecording = async (recording: Recording) => {
    if (!recording.transcription) return

    setAdding(recording.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create a new input from the recording's transcription
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .insert({
          project_id: projectId,
          type: 'text',
          content: recording.transcription,
          file_name: recording.title,
          metadata: {
            source: 'recording',
            recording_id: recording.id,
            recording_title: recording.title,
            recording_duration: recording.duration,
          },
          created_by: user.id,
        })

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding recording as input:', error)
      alert('Failed to add recording as input')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-container p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-heading-lg text-secondary-white">Select Recording</h2>
            <p className="text-body-sm text-medium-gray mt-1">
              Choose a transcribed recording to use as input
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-medium-gray hover:text-secondary-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="text-center py-16">
              <MicrophoneIcon className="w-16 h-16 text-medium-gray mx-auto mb-4" />
              <p className="text-body-md text-secondary-white mb-2">No Transcribed Recordings</p>
              <p className="text-body-sm text-medium-gray">
                Record audio and generate transcriptions first, then you can use them as inputs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <button
                  key={recording.id}
                  onClick={() => handleSelectRecording(recording)}
                  disabled={adding !== null}
                  className="w-full text-left p-4 bg-white/5 hover:bg-white/10 rounded-glass border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <MicrophoneIcon className="w-5 h-5 text-cosmic-orange flex-shrink-0" />
                        <p className="text-body-md text-secondary-white font-medium truncate">
                          {recording.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-body-sm text-medium-gray ml-8">
                        <span>{formatDuration(recording.duration)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(recording.created_at)}</span>
                      </div>
                      {recording.transcription && (
                        <p className="text-body-sm text-medium-gray mt-2 ml-8 line-clamp-2">
                          {recording.transcription.substring(0, 150)}
                          {recording.transcription.length > 150 ? '...' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {adding === recording.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <div className="flex items-center gap-2 text-cosmic-orange">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="text-body-sm">Transcribed</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
          <button onClick={onClose} className="btn-secondary px-6 py-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

