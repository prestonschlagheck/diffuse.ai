'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, formatDuration } from '@/lib/utils/format'
import LoadingSpinner from './LoadingSpinner'

// Inline SVG icons
const MicrophoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
)

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
  const [adding, setAdding] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleAddSelected = async () => {
    if (selectedIds.size === 0) return

    setAdding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const selectedRecordings = recordings.filter(r => selectedIds.has(r.id))
      
      // Insert all selected recordings as inputs
      const inputs = selectedRecordings.map(recording => ({
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
      }))

      const { error } = await supabase
        .from('diffuse_project_inputs')
        .insert(inputs)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error adding recordings as inputs:', error)
      alert('Failed to add recordings as inputs')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-container p-8 max-w-2xl w-full h-[500px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h2 className="text-heading-lg text-secondary-white">Add from Recordings</h2>
          <button
            onClick={onClose}
            className="text-medium-gray hover:text-secondary-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-6 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : recordings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MicrophoneIcon className="w-16 h-16 text-medium-gray mb-4" />
              <p className="text-body-md text-secondary-white mb-2">No Transcribed Recordings</p>
              <p className="text-body-sm text-medium-gray">
                Record audio and generate transcriptions first, then you can use them as inputs.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => {
                const isSelected = selectedIds.has(recording.id)
                return (
                  <button
                    key={recording.id}
                    onClick={() => toggleSelection(recording.id)}
                    disabled={adding}
                    className={`w-full text-left p-4 rounded-glass border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected 
                        ? 'bg-cosmic-orange/10 border-cosmic-orange/30' 
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox */}
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-cosmic-orange border-cosmic-orange' 
                          : 'border-medium-gray'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Recording Info */}
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
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="btn-secondary flex-1 py-3"
            disabled={adding}
          >
            Cancel
          </button>
          <button 
            onClick={handleAddSelected}
            disabled={adding || selectedIds.size === 0}
            className="btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {adding ? 'Adding...' : `Add ${selectedIds.size > 0 ? `(${selectedIds.size})` : 'Selected'}`}
          </button>
        </div>
      </div>
    </div>
  )
}
