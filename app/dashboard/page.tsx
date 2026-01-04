'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ProjectCard from '@/components/dashboard/ProjectCard'
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

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setSubscriptionTier(data.subscription_tier)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
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
      <div className="mb-8">
        <h1 className="text-display-sm text-secondary-white mb-2">
          Welcome back, {user.email?.split('@')[0]}
        </h1>
        <p className="text-body-lg text-medium-gray">
          Organization: {currentWorkspace.name}
        </p>
      </div>

      {/* Subscription Status Bar */}
      <div className="glass-container p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-body-sm text-medium-gray mb-1">Current Plan</p>
          <p className="text-heading-md text-cosmic-orange font-medium">
            {subscriptionNames[subscriptionTier]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-body-sm text-medium-gray mb-1">Projects</p>
          <p className="text-heading-md text-secondary-white">
            {projectCount}
            {projectLimit !== null && (
              <span className="text-medium-gray"> / {projectLimit}</span>
            )}
            {projectLimit === null && (
              <span className="text-medium-gray"> / Unlimited</span>
            )}
          </p>
        </div>
        {hasReachedLimit && (
          <Link
            href="/dashboard/settings"
            className="btn-primary px-6 py-2 text-body-sm"
          >
            Upgrade Plan
          </Link>
        )}
      </div>

      {/* Remaining Projects Warning */}
      {remainingProjects !== null && remainingProjects <= 2 && remainingProjects > 0 && (
        <div className="mb-6 p-4 rounded-glass border border-cosmic-orange/30 bg-cosmic-orange/10">
          <p className="text-body-sm text-cosmic-orange">
            ⚠️ You have {remainingProjects} project{remainingProjects !== 1 ? 's' : ''} remaining on your {subscriptionNames[subscriptionTier]} plan.{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Upgrade to create more projects.
            </Link>
          </p>
        </div>
      )}

      {hasReachedLimit && (
        <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10">
          <p className="text-body-sm text-red-400">
            🚫 You've reached your project limit ({projectLimit} projects).{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Upgrade your plan to create more projects.
            </Link>
          </p>
        </div>
      )}

      {/* Create Project Button */}
      <div className="mb-8">
        <button
          onClick={() => {
            if (hasReachedLimit) {
              alert(`You've reached your project limit. Please upgrade your plan to create more projects.`)
              return
            }
            setShowCreateModal(true)
          }}
          className={`btn-primary px-6 py-3 ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={hasReachedLimit}
        >
          + Create New Project
        </button>
      </div>

      {/* Projects Grid */}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
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
