'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'

export default function OrganizationPage() {
  const { user, currentWorkspace, workspaces } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const supabase = createClient()

  const generateOrgCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Find organization by invite code
      const { data: org, error: orgError } = await supabase
        .from('diffuse_workspaces')
        .select('*')
        .eq('invite_code', joinCode.toUpperCase())
        .single()

      if (orgError) {
        if (orgError.code === '42703') {
          throw new Error('Organization invite codes not yet configured in database')
        }
        throw new Error('Invalid organization code')
      }

      if (!org) {
        throw new Error('Invalid organization code')
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('diffuse_workspace_members')
        .insert({
          workspace_id: org.id,
          user_id: user?.id,
          role: 'member',
        })

      if (memberError) throw memberError

      setMessage({ type: 'success', text: `Successfully joined ${org.name}!` })
      setJoinCode('')
      setShowJoinModal(false)
      window.location.reload()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to join organization' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const inviteCode = generateOrgCode()

      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('diffuse_workspaces')
        .insert({
          name: orgName,
          description: orgDescription,
          invite_code: inviteCode,
        })
        .select()
        .single()

      if (orgError) {
        if (orgError.code === '42703') {
          throw new Error('Organization invite codes not yet configured in database. Please contact support.')
        }
        throw orgError
      }

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('diffuse_workspace_members')
        .insert({
          workspace_id: newOrg.id,
          user_id: user?.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      setMessage({ 
        type: 'success', 
        text: `Organization created! Invite code: ${inviteCode}` 
      })
      setOrgName('')
      setOrgDescription('')
      setShowCreateModal(false)
      window.location.reload()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create organization' })
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // In a real app, you'd send an email with the invite code
      // For now, just show the code
      if (!currentWorkspace) throw new Error('No organization selected')

      const { data: org, error: orgError } = await supabase
        .from('diffuse_workspaces')
        .select('invite_code')
        .eq('id', currentWorkspace.id)
        .single()

      if (orgError || !org?.invite_code) {
        throw new Error('Organization invite codes not yet configured. Please contact support.')
      }

      setMessage({ 
        type: 'success', 
        text: `Share this code with ${inviteEmail}: ${org.invite_code}` 
      })
      setInviteEmail('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to generate invite' })
    } finally {
      setLoading(false)
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
      <h1 className="text-display-sm text-secondary-white mb-8">Organization</h1>

      {/* Current Organization */}
      {currentWorkspace ? (
        <div className="glass-container p-6 mb-8">
          <h2 className="text-heading-lg text-secondary-white mb-4">Current Organization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-caption text-medium-gray mb-1">Name</label>
              <p className="text-body-md text-secondary-white">{currentWorkspace.name}</p>
            </div>
            {currentWorkspace.description && (
              <div>
                <label className="block text-caption text-medium-gray mb-1">Description</label>
                <p className="text-body-md text-secondary-white">{currentWorkspace.description}</p>
              </div>
            )}
            <div>
              <label className="block text-caption text-medium-gray mb-1">Your Role</label>
              <p className="text-body-md text-secondary-white capitalize">
                {workspaces.find(w => w.workspace.id === currentWorkspace.id)?.role || 'member'}
              </p>
            </div>
          </div>

          {/* Invite Members */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-heading-md text-secondary-white mb-4">Invite Members</h3>
            <form onSubmit={handleInviteMember} className="flex gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@email.com"
                required
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary px-6 py-3 disabled:opacity-50"
              >
                {loading ? 'Inviting...' : 'Get Invite Code'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="No Organization"
          description="Join an existing organization or create your own to collaborate with your team."
        />
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Join Organization */}
        <div className="glass-container p-6">
          <h3 className="text-heading-md text-secondary-white mb-3">Join Organization</h3>
          <p className="text-body-sm text-medium-gray mb-4">
            Have an invite code? Join an existing organization.
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary w-full py-3"
          >
            Join with Code
          </button>
        </div>

        {/* Create Organization */}
        <div className="glass-container p-6">
          <h3 className="text-heading-md text-secondary-white mb-3">Create Organization</h3>
          <p className="text-body-sm text-medium-gray mb-4">
            Start a new organization and invite your team members.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary w-full py-3"
          >
            Create Organization
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mt-6 p-4 rounded-glass border ${
            message.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-cosmic-orange/10 border-cosmic-orange/30 text-cosmic-orange'
          }`}
        >
          <p className="text-body-sm">{message.text}</p>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-md w-full">
            <h2 className="text-heading-lg text-secondary-white mb-6">Join Organization</h2>
            <form onSubmit={handleJoinOrganization} className="space-y-4">
              <div>
                <label className="block text-body-sm text-secondary-white mb-2">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="ABC12345"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors uppercase"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-md w-full">
            <h2 className="text-heading-lg text-secondary-white mb-6">Create Organization</h2>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-body-sm text-secondary-white mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme News Corp"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm text-secondary-white mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  placeholder="Local news organization..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

