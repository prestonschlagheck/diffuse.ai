'use client'

import { useState } from 'react'
import { formatDateTime, formatDuration } from '@/lib/utils/format'
import type { DiffuseProjectInput } from '@/types/database'

interface InputDetailModalProps {
  input: DiffuseProjectInput
  onClose: () => void
  onSave?: (id: string, title: string, content: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  canEdit?: boolean
  canDelete?: boolean
}

export default function InputDetailModal({ input, onClose, onSave, onDelete, canEdit = true, canDelete = true }: InputDetailModalProps) {
  const [title, setTitle] = useState(input.file_name || '')
  const [content, setContent] = useState(input.content || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isFromRecording = input.metadata?.source === 'recording'
  const isFromUpload = input.metadata?.source === 'upload'
  const isImage = input.type === 'image'
  const isDocument = input.type === 'document'
  const isAudio = input.type === 'audio'
  const showSaveButton = canEdit && onSave && !isImage
  const showDeleteButton = canDelete && onDelete
  
  // Get type info for display
  const getTypeInfo = () => {
    if (isFromRecording) {
      return { label: 'RECORDING', color: 'text-cosmic-orange', icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    }
    switch (input.type) {
      case 'audio':
        return { label: 'AUDIO', color: 'text-accent-purple', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        )}
      case 'document':
        return { label: 'DOCUMENT', color: 'text-green-400', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      case 'image':
        return { label: 'IMAGE', color: 'text-yellow-400', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      default:
        return { label: 'TEXT', color: 'text-pale-blue', icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
    }
  }
  
  const typeInfo = getTypeInfo()

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    try {
      await onSave(input.id, title, content)
      onClose()
    } catch (error) {
      console.error('Error saving input:', error)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this input?')) return
    setDeleting(true)
    try {
      await onDelete(input.id)
      onClose()
    } catch (error) {
      console.error('Error deleting input:', error)
    } finally {
      setDeleting(false)
    }
  }

  const getSaveButtonText = () => {
    return saving ? 'Saving...' : 'Save Changes'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="glass-container p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={typeInfo.color}>
              {typeInfo.icon}
            </div>
          <h2 className="text-heading-lg text-secondary-white">Input Details</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete Button */}
            {showDeleteButton && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-medium-gray hover:text-red-400 hover:bg-red-500/10 rounded-glass transition-colors disabled:opacity-50"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {/* Close Button */}
          <button
            onClick={onClose}
              className="p-2 text-medium-gray hover:text-secondary-white hover:bg-white/10 rounded-glass transition-colors"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Metadata Row */}
          <div className="flex items-center gap-2 text-body-sm text-medium-gray">
            <span className={`uppercase font-medium tracking-wider ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {isFromRecording && input.metadata?.recording_duration && (
              <>
                <span>•</span>
                <span>{formatDuration(input.metadata.recording_duration)}</span>
              </>
            )}
            {isFromUpload && input.file_size && (
              <>
                <span>•</span>
                <span>{(input.file_size / 1024).toFixed(0)} KB</span>
              </>
            )}
            <span>•</span>
            <span>{formatDateTime(input.created_at)}</span>
          </div>

          {/* Title Field */}
            <div>
            <label className="block text-caption text-medium-gray mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => canEdit && setTitle(e.target.value)}
              placeholder={isFromRecording ? 'Recording' : isImage ? 'Image' : isDocument ? 'Document' : isAudio ? 'Audio' : 'Text Input'}
              readOnly={!canEdit || isImage}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md transition-colors ${
                canEdit && !isImage
                  ? 'focus:outline-none focus:border-cosmic-orange' 
                  : 'cursor-default opacity-75'
              }`}
            />
              </div>

          {/* Image Preview (for image inputs) */}
          {isImage && input.metadata?.storage_url && (
            <div>
              <label className="block text-caption text-medium-gray mb-2">Preview</label>
              <div className="bg-white/5 border border-white/10 rounded-glass p-4">
                <img 
                  src={input.metadata.storage_url} 
                  alt={input.file_name || 'Image'} 
                  className="max-w-full max-h-[300px] rounded-lg mx-auto object-contain"
                />
              </div>
              <p className="text-body-sm text-medium-gray mt-3 italic text-center">
                This image will be processed by the AI workflow when generating output.
              </p>
            </div>
          )}

          {/* Content Field (not shown for images) */}
          {!isImage && (
          <div>
            <label className="block text-caption text-medium-gray mb-2">
              {isFromRecording ? 'Transcription' : isAudio ? 'Transcription' : isDocument ? 'Extracted Text' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => canEdit && setContent(e.target.value)}
              placeholder="Enter content..."
              rows={12}
              readOnly={!canEdit}
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm transition-colors resize-none overflow-y-auto custom-scrollbar max-h-[50vh] ${
                canEdit 
                  ? 'focus:outline-none focus:border-cosmic-orange' 
                  : 'cursor-default opacity-75'
              }`}
            />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose} 
            className={`btn-secondary py-3 ${showSaveButton ? 'flex-1' : 'w-full'}`}
            disabled={saving}
          >
            Close
          </button>
          {showSaveButton && (
            <button 
              onClick={handleSave} 
              className="btn-primary flex-1 py-3 disabled:opacity-50"
              disabled={saving}
            >
              {getSaveButtonText()}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
