'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils/format'
import CreateProjectModal from '@/components/dashboard/CreateProjectModal'
import EmptyState from '@/components/dashboard/EmptyState'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import type { DiffuseProject } from '@/types/database'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

export default function DashboardPage() {
  const { user, currentWorkspace, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<DiffuseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free')
  const supabase = createClient()

  const subscriptionLimits: Record<SubscriptionTier, number | null> = {
    free: 3,
    pro: 15,
    pro_max: null, // unlimited
  }

  const subscriptionNames: Record<SubscriptionTier, string> = {
    free: 'Free',
    pro: 'Pro',
    pro_max: 'Pro Max',
  }

  const fetchProjects = useCallback(async () => {
    if (!currentWorkspace) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('diffuse_projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [currentWorkspace, supabase])

  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // Table doesn't exist - use default
        console.warn('user_profiles table not found, using default tier')
        return
      }

      if (data) {
        setSubscriptionTier(data.subscription_tier)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Use default 'free' tier on error
    }
  }, [user, supabase])

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects()
    }
    if (user) {
      fetchUserProfile()
    }
  }, [currentWorkspace, user, fetchProjects, fetchUserProfile])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentWorkspace) {
    return (
      <EmptyState
        title="No Organization Selected"
        description="Please select an organization from the sidebar to view your projects."
      />
    )
  }

  const projectLimit = subscriptionLimits[subscriptionTier]
  const projectCount = projects.length
  const hasReachedLimit = projectLimit !== null && projectCount >= projectLimit
  const remainingProjects = projectLimit !== null ? projectLimit - projectCount : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white mb-2">Projects</h1>
          <p className="text-body-md text-medium-gray">
            {projectCount} of {projectLimit === null ? 'Unlimited' : projectLimit} projects • {subscriptionNames[subscriptionTier]} Plan
          </p>
        </div>
        <button
          onClick={() => {
            if (hasReachedLimit) {
              alert(`You've reached your project limit. Please upgrade your plan to create more projects.`)
              return
            }
            setShowCreateModal(true)
          }}
          className={`btn-primary px-6 py-3 flex items-center gap-2 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={hasReachedLimit}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Project
        </button>
      </div>

      {/* Alerts */}
      {remainingProjects !== null && remainingProjects <= 2 && remainingProjects > 0 && (
        <div className="mb-6 p-4 rounded-glass border border-cosmic-orange/30 bg-cosmic-orange/10 flex gap-3">
          <svg className="w-5 h-5 text-cosmic-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-body-sm text-cosmic-orange">
            You have {remainingProjects} project{remainingProjects !== 1 ? 's' : ''} remaining on your {subscriptionNames[subscriptionTier]} plan.{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Upgrade to create more projects.
            </Link>
          </p>
        </div>
      )}

      {hasReachedLimit && (
        <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10 flex gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p className="text-body-sm text-red-400">
            You've reached your project limit ({projectLimit} projects).{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Upgrade your plan to create more projects.
            </Link>
          </p>
        </div>
      )}

      {/* Projects Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          title="No Projects Yet"
          description="Create your first project to start processing inputs and generating outputs with Diffuse workflows."
          action={
            !hasReachedLimit
              ? {
                  label: 'Create Project',
                  onClick: () => setShowCreateModal(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="glass-container overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">STATUS</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">VISIBILITY</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED</th>
                <th className="text-right py-4 px-6 text-caption text-medium-gray font-medium">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const statusColors = {
                  active: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
                  archived: 'bg-medium-gray/20 text-medium-gray border-medium-gray/30',
                  draft: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
                }

                return (
                  <tr
                    key={project.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-body-md text-secondary-white font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-body-sm text-medium-gray truncate max-w-md">{project.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 text-caption font-medium rounded-full border ${
                          statusColors[project.status]
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5 text-body-sm text-medium-gray">
                        {project.visibility === 'private' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        <span className="capitalize">{project.visibility}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-body-sm text-medium-gray">
                      {formatRelativeTime(project.created_at)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-body-sm text-cosmic-orange hover:text-rich-orange transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          workspaceId={currentWorkspace.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  )
}
