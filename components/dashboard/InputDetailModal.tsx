'use client'

import { formatDateTime, formatFileSize } from '@/lib/utils/format'
import type { DiffuseProjectInput } from '@/types/database'

interface InputDetailModalProps {
  input: DiffuseProjectInput
  onClose: () => void
}

export default function InputDetailModal({ input, onClose }: InputDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
      <div className="glass-container p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-heading-lg text-secondary-white">Input Details</h2>
          <button
            onClick={onClose}
            className="text-medium-gray hover:text-secondary-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-caption text-medium-gray mb-1">Type</label>
              <p className="text-body-md text-secondary-white capitalize">{input.type}</p>
            </div>
            <div>
              <label className="block text-caption text-medium-gray mb-1">Created</label>
              <p className="text-body-md text-secondary-white">{formatDateTime(input.created_at)}</p>
            </div>
            {input.file_name && (
              <>
                <div>
                  <label className="block text-caption text-medium-gray mb-1">File Name</label>
                  <p className="text-body-md text-secondary-white">{input.file_name}</p>
                </div>
                <div>
                  <label className="block text-caption text-medium-gray mb-1">File Size</label>
                  <p className="text-body-md text-secondary-white">
                    {input.file_size ? formatFileSize(input.file_size) : 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          {input.content && (
            <div>
              <label className="block text-caption text-medium-gray mb-2">Content</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-glass">
                <p className="text-body-sm text-secondary-white whitespace-pre-wrap">{input.content}</p>
              </div>
            </div>
          )}

          {/* Metadata */}
          {input.metadata && Object.keys(input.metadata).length > 0 && (
            <div>
              <label className="block text-caption text-medium-gray mb-2">Additional Metadata</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-glass">
                <pre className="text-body-sm text-secondary-white overflow-x-auto">
                  {JSON.stringify(input.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <button onClick={onClose} className="btn-secondary w-full py-3">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

