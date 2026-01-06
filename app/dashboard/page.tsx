'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import CreateProjectModal from '@/components/dashboard/CreateProjectModal'
import EmptyState from '@/components/dashboard/EmptyState'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import type { DiffuseProject } from '@/types/database'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

interface OrgInfo {
  id: string
  name: string
}

interface ProjectWithCounts extends DiffuseProject {
  input_count: number
  output_count: number
  creator_name?: string
  orgs?: OrgInfo[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, currentWorkspace, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free')
  const supabase = createClient()

  const subscriptionLimits: Record<SubscriptionTier, number> = {
    free: 3,
    pro: 15,
    pro_max: 40,
  }

  const subscriptionNames: Record<SubscriptionTier, string> = {
    free: 'Free',
    pro: 'Pro',
    pro_max: 'Pro Max',
  }

  const fetchProjects = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('diffuse_projects')
        .select('*')
        .eq('created_by', user.id)

      // If user has a workspace selected, also show workspace projects
      if (currentWorkspace) {
        query = query.or(`workspace_id.eq.${currentWorkspace.id},created_by.eq.${user.id}`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Fetch input/output counts, creator name, and org names for each project
      const projectsWithCounts: ProjectWithCounts[] = []
      for (const project of data || []) {
        const [{ count: inputCount }, { count: outputCount }, creatorResult, orgsResult] = await Promise.all([
          supabase
            .from('diffuse_project_inputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .is('deleted_at', null),
          supabase
            .from('diffuse_project_outputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .is('deleted_at', null),
          supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', project.created_by)
            .single(),
          project.visible_to_orgs && project.visible_to_orgs.length > 0
            ? supabase
                .from('diffuse_workspaces')
                .select('id, name')
                .in('id', project.visible_to_orgs)
            : Promise.resolve({ data: [] }),
        ])
        
        projectsWithCounts.push({
          ...project,
          input_count: inputCount || 0,
          output_count: outputCount || 0,
          creator_name: creatorResult.data?.full_name || 'Unknown',
          orgs: orgsResult.data?.map((org: { id: string; name: string }) => ({ id: org.id, name: org.name })) || [],
        })
      }
      setProjects(projectsWithCounts)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }, [user, currentWorkspace, supabase])

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
    if (user) {
      fetchProjects()
      fetchUserProfile()
    }
  }, [user, currentWorkspace, fetchProjects, fetchUserProfile])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const projectLimit = subscriptionLimits[subscriptionTier]
  const projectCount = projects.length
  const hasReachedLimit = projectCount >= projectLimit
  const remainingProjects = projectLimit - projectCount

  const CreateProjectButton = ({ className = '' }: { className?: string }) => (
    <button
      onClick={() => {
        if (hasReachedLimit) {
          alert(`You've reached your project limit. Please upgrade your plan to create more projects.`)
          return
        }
        setShowCreateModal(true)
      }}
      className={`btn-primary px-4 py-2 flex items-center justify-center gap-2 text-body-sm ${hasReachedLimit ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={hasReachedLimit}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Project
    </button>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-sm text-secondary-white">Projects</h1>
        {/* Desktop button - hidden on mobile */}
        <CreateProjectButton className="hidden md:flex" />
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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          }
          title="No Projects Yet"
          description="Create your first project to start processing inputs and generating outputs with Diffuse workflows."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mobile button - full width at top of grid, hidden on desktop */}
          <CreateProjectButton className="md:hidden col-span-1" />
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              className="glass-container p-6 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {/* Project Name */}
              <h3 className="text-heading-md text-secondary-white font-medium mb-4">
                {project.name}
              </h3>
              
              {/* Details */}
              <div className="space-y-2">
                {/* Inputs & Outputs */}
                <div className="flex items-center gap-2">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/projects/${project.id}?tab=inputs`)
                    }}
                    className="text-caption text-purple-400 uppercase tracking-wider hover:text-purple-200 cursor-pointer transition-colors"
                  >
                    {project.input_count} INPUT{project.input_count !== 1 ? 'S' : ''}
                  </span>
                  <span className="text-caption text-medium-gray">•</span>
                  <span 
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/projects/${project.id}?tab=outputs`)
                    }}
                    className="text-caption text-cosmic-orange uppercase tracking-wider hover:text-orange-300 cursor-pointer transition-colors"
                  >
                    {project.output_count} OUTPUT{project.output_count !== 1 ? 'S' : ''}
                  </span>
                </div>
                
                {/* Created By & Date */}
                <div className="flex items-center gap-2 text-caption text-medium-gray uppercase tracking-wider">
                  <span>CREATED BY: {project.creator_name}</span>
                  <span>•</span>
                  <span>{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
                </div>
                
                {/* Access */}
                <div className="text-caption text-medium-gray uppercase tracking-wider">
                  {project.orgs && project.orgs.length > 0 ? (
                    <span className="flex items-center gap-1 flex-wrap">
                      {project.orgs.map((org, index) => (
                        <span key={org.id} className="inline-flex items-center">
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/organization/${org.id}`)
                            }}
                            className="text-medium-gray hover:text-gray-300 cursor-pointer transition-colors"
                          >
                            {org.name}
                          </span>
                          {index < project.orgs!.length - 1 && <span className="text-medium-gray">,&nbsp;</span>}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span>PRIVATE</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          workspaceId={currentWorkspace?.id || null}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  )
}
