'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CreateProjectModalProps {
  workspaceId: string
  onClose: () => void
  onSuccess: () => void
}

export default function CreateProjectModal({ workspaceId, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('diffuse_projects').insert({
        workspace_id: workspaceId,
        name,
        description: description || null,
        visibility,
        status: 'active',
        created_by: user.id,
      })

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
      <div className="glass-container p-8 max-w-md w-full">
        <h2 className="text-heading-lg text-secondary-white mb-6">Create New Project</h2>

        {error && (
          <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10 text-red-400 text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-body-sm text-secondary-white mb-2">
              Project Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
              placeholder="My Project"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-body-sm text-secondary-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors resize-none"
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-body-sm text-secondary-white mb-2">Visibility</label>
            <p className="text-caption text-medium-gray mb-3">
              Public projects are visible to all organization members. Private projects are only visible to you.
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                  className="accent-cosmic-orange"
                />
                <span className="text-body-sm text-secondary-white flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                  className="accent-cosmic-orange"
                />
                <span className="text-body-sm text-secondary-white flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Public
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-3"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

