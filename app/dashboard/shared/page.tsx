'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { formatDateWithTime } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import type { DiffuseProject } from '@/types/database'

interface SharedProject extends DiffuseProject {
  input_count: number
  output_count: number
  author_name: string
  organization_name: string
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-secondary-white">Shared With Me</h1>
          <p className="text-body-md text-medium-gray mt-1">
            Projects shared with you through your organizations
          </p>
        </div>
      </div>

      {/* Shared Projects Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : workspaces.length === 0 ? (
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
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <p className="text-body-md text-medium-gray">
            Join an organization to see shared projects.
          </p>
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
  )
}

