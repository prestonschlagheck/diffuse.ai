'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import type { DiffuseProject } from '@/types/database'

interface OrgInfo {
  id: string
  name: string
}

interface SharedProject extends DiffuseProject {
  input_count: number
  output_count: number
  author_name: string
  orgs: OrgInfo[]
}

export default function SharedWithMePage() {
  const router = useRouter()
  const { user, workspaces, loading: authLoading } = useAuth()
  const [sharedProjects, setSharedProjects] = useState<SharedProject[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchSharedProjects = useCallback(async () => {
    if (!user || workspaces.length === 0) {
      setSharedProjects([])
      setLoading(false)
      return
    }

    setLoading(true)
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
        // Get author name, input/output counts, and org names
        const [authorResult, { count: inputCount }, { count: outputCount }, orgsResult] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', project.created_by)
            .single(),
          supabase
            .from('diffuse_project_inputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .is('deleted_at', null),
          supabase
            .from('diffuse_project_outputs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id),
          project.visible_to_orgs && project.visible_to_orgs.length > 0
            ? supabase
                .from('diffuse_workspaces')
                .select('id, name')
                .in('id', project.visible_to_orgs)
            : Promise.resolve({ data: [] }),
        ])

        sharedProjectsWithDetails.push({
          ...project,
          input_count: inputCount || 0,
          output_count: outputCount || 0,
          author_name: authorResult.data?.full_name || 'Unknown',
          orgs: orgsResult.data?.map((org: { id: string; name: string }) => ({ id: org.id, name: org.name })) || [],
        })
      }

      setSharedProjects(sharedProjectsWithDetails)
    } catch (error) {
      console.error('Error fetching shared projects:', error)
      setSharedProjects([])
    } finally {
      setLoading(false)
    }
  }, [user, workspaces, supabase])

  useEffect(() => {
    if (user) {
      fetchSharedProjects()
    }
  }, [user, workspaces, fetchSharedProjects])

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const ViewOrgsButton = ({ className = '' }: { className?: string }) => (
    <a
      href="/dashboard/organization"
      className={`btn-primary px-4 py-2 flex items-center justify-center gap-2 text-body-sm ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      View Organizations
    </a>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display-sm text-secondary-white">Shared With Me</h1>
        {/* Desktop button - hidden on mobile */}
        <ViewOrgsButton className="hidden md:flex" />
      </div>

      {/* Shared Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          }
          title="No Organizations"
          description="Join an organization to see shared projects."
        />
      ) : sharedProjects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          title="No Shared Projects"
          description="No projects have been shared with your organizations yet."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mobile button - full width at top of grid, hidden on desktop */}
          <ViewOrgsButton className="md:hidden col-span-1" />
          {sharedProjects.map((project) => (
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
                  <span>CREATED BY: {project.author_name}</span>
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
                          {index < project.orgs.length - 1 && <span className="text-medium-gray">,&nbsp;</span>}
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
    </div>
  )
}

