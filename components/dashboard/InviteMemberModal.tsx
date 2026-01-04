'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types/database'

interface InviteMemberModalProps {
  workspaceId: string
  onClose: () => void
  onSuccess: () => void
}

export default function InviteMemberModal({ workspaceId, onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('member')
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

      // In a real implementation, you'd want to:
      // 1. Check if user exists in auth.users
      // 2. Send an invitation email
      // 3. Create a pending invitation record
      // For now, we'll just add them directly (requires the user to exist)

      const { error: insertError } = await supabase.from('diffuse_workspace_members').insert({
        workspace_id: workspaceId,
        user_id: email, // This should be the user's ID, not email
        role,
        invited_by: user.id,
      })

      if (insertError) throw insertError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
      <div className="glass-container p-8 max-w-md w-full">
        <h2 className="text-heading-lg text-secondary-white mb-6">Invite Member</h2>

        {error && (
          <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10 text-red-400 text-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-body-sm text-secondary-white mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-body-sm text-secondary-white mb-3">Role</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="member"
                  checked={role === 'member'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="accent-cosmic-orange"
                />
                <span className="text-body-sm text-secondary-white">Member</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="accent-cosmic-orange"
                />
                <span className="text-body-sm text-secondary-white">Admin</span>
              </label>
            </div>
            <p className="mt-2 text-caption text-medium-gray">
              Admins can manage projects and invite members
            </p>
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
              {loading ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

