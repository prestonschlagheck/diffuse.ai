'use client'

import { formatDateTime } from '@/lib/utils/format'
import type { DiffuseProjectOutput } from '@/types/database'

interface OutputDetailModalProps {
  output: DiffuseProjectOutput
  onClose: () => void
}

export default function OutputDetailModal({ output, onClose }: OutputDetailModalProps) {
  const statusColors = {
    pending: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
    processing: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const handleDownload = () => {
    const blob = new Blob([output.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `output-${output.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
      <div className="glass-container p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-heading-lg text-secondary-white mb-2">Output Details</h2>
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
            className="text-medium-gray hover:text-secondary-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

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
            <label className="block text-caption text-medium-gray mb-2">Content</label>
            <div className="p-4 bg-white/5 border border-white/10 rounded-glass max-h-96 overflow-y-auto custom-scrollbar">
              <p className="text-body-sm text-secondary-white whitespace-pre-wrap">{output.content}</p>
            </div>
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
          <button onClick={handleDownload} className="btn-secondary flex-1 py-3">
            Download
          </button>
          <button onClick={onClose} className="btn-primary flex-1 py-3">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

