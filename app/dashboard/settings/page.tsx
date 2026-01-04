'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import InviteMemberModal from '@/components/dashboard/InviteMemberModal'
import type { DiffuseWorkspaceMember } from '@/types/database'

export default function SettingsPage() {
  const { user, currentWorkspace, workspaces } = useAuth()
  const [members, setMembers] = useState<DiffuseWorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'member' | null>(null)
  const supabase = createClient()

  const getUserRole = useCallback(() => {
    if (!currentWorkspace) return
    const workspace = workspaces.find((w) => w.workspace.id === currentWorkspace.id)
    setUserRole(workspace?.role || null)
  }, [currentWorkspace, workspaces])

  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('diffuse_workspace_members')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }, [currentWorkspace, supabase])

  useEffect(() => {
    if (currentWorkspace) {
      fetchMembers()
      getUserRole()
    }
  }, [currentWorkspace, fetchMembers, getUserRole])

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error } = await supabase
        .from('diffuse_workspace_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-body-lg text-medium-gray">Please select a workspace</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-display-sm text-secondary-white mb-8">Settings</h1>

      {/* Workspace Info */}
      <div className="glass-container p-6 mb-8">
        <h2 className="text-heading-lg text-secondary-white mb-4">Workspace Information</h2>
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
            <label className="block text-caption text-medium-gray mb-1">Created</label>
            <p className="text-body-md text-secondary-white">
              {formatDate(currentWorkspace.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="glass-container p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-heading-lg text-secondary-white">Members</h2>
          {userRole === 'admin' && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary px-4 py-2 text-body-sm"
            >
              + Invite Member
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-glass border border-white/10"
              >
                <div>
                  <p className="text-body-md text-secondary-white">{member.user_id}</p>
                  <p className="text-caption text-medium-gray capitalize">{member.role}</p>
                </div>
                {userRole === 'admin' && member.user_id !== user?.id && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-body-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Personal Settings */}
      <div className="glass-container p-6">
        <h2 className="text-heading-lg text-secondary-white mb-6">Personal Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-caption text-medium-gray mb-1">Email</label>
            <p className="text-body-md text-secondary-white">{user?.email}</p>
          </div>
          <div>
            <button className="btn-secondary px-4 py-2 text-body-sm">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          workspaceId={currentWorkspace.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  )
}

