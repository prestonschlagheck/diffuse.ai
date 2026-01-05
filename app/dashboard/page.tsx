'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { formatDateWithTime } from '@/lib/utils/format'
import CreateProjectModal from '@/components/dashboard/CreateProjectModal'
import EmptyState from '@/components/dashboard/EmptyState'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import type { DiffuseProject } from '@/types/database'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

interface ProjectWithCounts extends DiffuseProject {
  input_count: number
  output_count: number
}

interface SharedProject extends ProjectWithCounts {
  author_name: string
  organization_name: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, workspaces, currentWorkspace, loading: authLoading, fetchWorkspaces } = useAuth()
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingShared, setLoadingShared] = useState(true)
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

      // Fetch input/output counts for each project
      const projectsWithCounts: ProjectWithCounts[] = []
      for (const project of data || []) {
        const [{ count: inputCount }, { count: outputCount }] = await Promise.all([
          supabase
            .from('diffuse_project_inputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .is('deleted_at', null),
          supabase
            .from('diffuse_project_outputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id),
        ])
        projectsWithCounts.push({
          ...project,
          input_count: inputCount || 0,
          output_count: outputCount || 0,
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

  const fetchSharedProjects = useCallback(async () => {
    if (!user || workspaces.length === 0) {
      setSharedProjects([])
      setLoadingShared(false)
      return
    }

    setLoadingShared(true)
    try {
      // Get workspace IDs the user is a member of
      const workspaceIds = workspaces.map(w => w.workspace.id)

      // Fetch public projects that are shared with any of the user's workspaces
      // but NOT created by the user
      const { data: projectsData, error } = await supabase
        .from('diffuse_projects')
        .select('*')
        .eq('visibility', 'public')
        .neq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter projects that have at least one workspace in common
      const filteredProjects = (projectsData || []).filter(project => {
        const visibleOrgs = project.visible_to_orgs || []
        return visibleOrgs.some((orgId: string) => workspaceIds.includes(orgId))
      })

      // Fetch additional info for each project
      const sharedProjectsWithDetails: SharedProject[] = []
      for (const project of filteredProjects) {
        // Get author name
        const { data: authorProfile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', project.created_by)
          .single()

        // Find which org(s) this is shared through
        const visibleOrgs = project.visible_to_orgs || []
        const matchingWorkspace = workspaces.find(w => visibleOrgs.includes(w.workspace.id))

        // Get input/output counts
        const [{ count: inputCount }, { count: outputCount }] = await Promise.all([
          supabase
            .from('diffuse_project_inputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .is('deleted_at', null),
          supabase
            .from('diffuse_project_outputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id),
        ])

        sharedProjectsWithDetails.push({
          ...project,
          input_count: inputCount || 0,
          output_count: outputCount || 0,
          author_name: authorProfile?.full_name || 'Unknown',
          organization_name: matchingWorkspace?.workspace.name || 'Unknown',
        })
      }

      setSharedProjects(sharedProjectsWithDetails)
    } catch (error) {
      console.error('Error fetching shared projects:', error)
      setSharedProjects([])
    } finally {
      setLoadingShared(false)
    }
  }, [user, workspaces, supabase])

  useEffect(() => {
    if (user) {
      fetchProjects()
      fetchUserProfile()
      fetchSharedProjects()
    }
  }, [user, currentWorkspace, workspaces, fetchProjects, fetchUserProfile, fetchSharedProjects])

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white">Projects</h1>
          <p className="text-body-md text-medium-gray mt-1">
            {projectCount} of {projectLimit} projects • {subscriptionNames[subscriptionTier]} Plan
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
      {hasReachedLimit && (
        <div className="mb-6 p-4 rounded-glass border border-red-500/30 bg-red-500/10 flex gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p className="text-body-sm text-red-400">
            You&apos;ve reached your project limit ({projectLimit} projects).{' '}
            <Link href="/dashboard/settings" className="underline font-medium">
              Upgrade your plan to create more projects.
            </Link>
          </p>
        </div>
      )}

      {/* My Projects */}
      <h2 className="text-heading-lg text-secondary-white mb-4">My Projects</h2>
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
        <div className="glass-container overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
                <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">INPUTS</th>
                <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">OUTPUTS</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">VISIBILITY</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <p className="text-body-md text-secondary-white font-medium">{project.name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center justify-center gap-1 text-body-sm text-medium-gray">
                      {project.input_count > 0 ? (
                        Array.from({ length: Math.min(project.input_count, 5) }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ))
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {project.input_count > 5 && <span className="text-caption">+{project.input_count - 5}</span>}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="flex items-center justify-center gap-1 text-body-sm text-medium-gray">
                      {project.output_count > 0 ? (
                        Array.from({ length: Math.min(project.output_count, 5) }).map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ))
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {project.output_count > 5 && <span className="text-caption">+{project.output_count - 5}</span>}
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
                    {formatDateWithTime(project.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shared with me Section */}
      {workspaces.length > 0 && (
        <div className="mt-12">
          <h2 className="text-heading-lg text-secondary-white mb-4">Shared with me</h2>
          
          {loadingShared ? (
            <div className="flex items-center justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : sharedProjects.length === 0 ? (
            <div className="glass-container p-8 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-medium-gray"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-body-md text-medium-gray">
                No projects have been shared with your organizations yet.
              </p>
            </div>
          ) : (
            <div className="glass-container overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
                    <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">AUTHOR</th>
                    <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">ORGANIZATION</th>
                    <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">INPUTS</th>
                    <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">OUTPUTS</th>
                    <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED</th>
                  </tr>
                </thead>
                <tbody>
                  {sharedProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <p className="text-body-md text-secondary-white font-medium">{project.name}</p>
                      </td>
                      <td className="py-4 px-6 text-body-sm text-medium-gray">
                        {project.author_name}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 text-caption font-medium rounded bg-cosmic-orange/20 text-cosmic-orange">
                          {project.organization_name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center justify-center gap-1 text-body-sm text-medium-gray">
                          {project.input_count > 0 ? (
                            Array.from({ length: Math.min(project.input_count, 5) }).map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ))
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {project.input_count > 5 && <span className="text-caption">+{project.input_count - 5}</span>}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="flex items-center justify-center gap-1 text-body-sm text-medium-gray">
                          {project.output_count > 0 ? (
                            Array.from({ length: Math.min(project.output_count, 5) }).map((_, i) => (
                              <svg key={i} className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ))
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {project.output_count > 5 && <span className="text-caption">+{project.output_count - 5}</span>}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-body-sm text-medium-gray">
                        {formatDateWithTime(project.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
