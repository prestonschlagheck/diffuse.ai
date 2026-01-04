'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/format'
import RichTextEditor from './RichTextEditor'
import type { DiffuseProjectOutput } from '@/types/database'

interface OutputDetailModalProps {
  output: DiffuseProjectOutput
  onClose: () => void
  onUpdate?: () => void
}

export default function OutputDetailModal({ output, onClose, onUpdate }: OutputDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(output.content)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const statusColors = {
    pending: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
    processing: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('diffuse_project_outputs')
        .update({
          content: editedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', output.id)

      if (updateError) throw updateError

      setIsEditing(false)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to update output')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([output.content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output-${output.id}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
      <div className="glass-container p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-heading-lg text-secondary-white mb-2">
              {isEditing ? 'Edit Output' : 'Output Details'}
            </h2>
            <span
              className={`inline-block px-3 py-1 text-caption font-medium rounded-full border ${
                statusColors[output.workflow_status]
              }`}
            >
              {output.workflow_status}
            </span>
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

        {error && (
          <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10 text-red-400 text-body-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-caption text-medium-gray mb-1">Created</label>
              <p className="text-body-md text-secondary-white">{formatDateTime(output.created_at)}</p>
            </div>
            <div>
              <label className="block text-caption text-medium-gray mb-1">Last Updated</label>
              <p className="text-body-md text-secondary-white">{formatDateTime(output.updated_at)}</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-caption text-medium-gray">Content</label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-body-sm text-cosmic-orange hover:text-rich-orange transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <RichTextEditor
                value={editedContent}
                onChange={setEditedContent}
                placeholder="Edit your output content..."
              />
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-glass max-h-96 overflow-y-auto custom-scrollbar">
                <div
                  className="text-body-sm text-secondary-white"
                  dangerouslySetInnerHTML={{ __html: output.content }}
                />
              </div>
            )}
          </div>

          {/* Structured Data */}
          {output.structured_data && Object.keys(output.structured_data).length > 0 && (
            <div>
              <label className="block text-caption text-medium-gray mb-2">Structured Data</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-glass max-h-60 overflow-y-auto custom-scrollbar">
                <pre className="text-body-sm text-secondary-white overflow-x-auto">
                  {JSON.stringify(output.structured_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Workflow Metadata */}
          {output.workflow_metadata && Object.keys(output.workflow_metadata).length > 0 && (
            <div>
              <label className="block text-caption text-medium-gray mb-2">Workflow Metadata</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-glass">
                <pre className="text-body-sm text-secondary-white overflow-x-auto">
                  {JSON.stringify(output.workflow_metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(output.content)
                  setError('')
                }}
                className="btn-secondary flex-1 py-3"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex-1 py-3"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDownload} className="btn-secondary flex-1 py-3">
                Download
              </button>
              <button onClick={onClose} className="btn-primary flex-1 py-3">
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

