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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white mb-2">Organization</h1>
          <p className="text-body-md text-medium-gray">
            {workspaces.length > 0 ? `Member of ${workspaces.length} organization${workspaces.length !== 1 ? 's' : ''}` : 'Collaborate with your team'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="btn-secondary px-6 py-3 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Join Organization
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Organization
          </button>
        </div>
      </div>

      {/* Organizations Table */}
      {workspaces.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="No Organizations Yet"
          description="Join an existing organization with an invite code or create your own to collaborate with your team."
        />
      ) : (
        <div className="glass-container overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">ROLE</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">INVITE CODE</th>
                <th className="text-right py-4 px-6 text-caption text-medium-gray font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.map(({ workspace, role }) => (
                <tr
                  key={workspace.id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-body-md text-secondary-white font-medium">{workspace.name}</p>
                      {workspace.description && (
                        <p className="text-body-sm text-medium-gray truncate max-w-md">{workspace.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 text-caption font-medium rounded-full border bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30 capitalize">
                      {role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {workspace.invite_code ? (
                      <code className="text-body-sm text-secondary-white bg-white/5 px-3 py-1 rounded">
                        {workspace.invite_code}
                      </code>
                    ) : (
                      <span className="text-body-sm text-medium-gray">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setCurrentWorkspace(workspace)
                      }}
                      className="text-body-sm text-cosmic-orange hover:text-rich-orange transition-colors"
                    >
                      {currentWorkspace?.id === workspace.id ? 'Active' : 'Switch'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

