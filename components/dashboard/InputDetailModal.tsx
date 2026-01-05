'use client'

import { formatDateTime } from '@/lib/utils/format'
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
          {/* Type, File Name, Created - all in one row */}
          <div className="flex items-center gap-2 text-body-sm text-medium-gray">
            <span className="capitalize text-secondary-white">{input.type}</span>
            {input.file_name && (
              <>
                <span>•</span>
                <span className="text-secondary-white">{input.file_name}</span>
              </>
            )}
            <span>•</span>
            <span>{formatDateTime(input.created_at)}</span>
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

