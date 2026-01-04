'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import { formatRelativeTime } from '@/lib/utils/format'
import type { DiffuseWorkspace, DiffuseProject, OrganizationPlan } from '@/types/database'

const planDetails = {
  enterprise_pro: { name: 'Enterprise Pro', projects: 50, price: '$100/mo' },
  enterprise_pro_max: { name: 'Enterprise Pro Max', projects: 'Unlimited', price: '$500/mo' },
}

interface ProjectWithCreator extends DiffuseProject {
  creator_name?: string
  creator_email?: string
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<DiffuseWorkspace | null>(null)
  const [projects, setProjects] = useState<ProjectWithCreator[]>([])
  const [members, setMembers] = useState<{ user_id: string; role: string; email?: string; name?: string }[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState(false)
  const supabase = createClient()

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    archived: 'bg-medium-gray/20 text-medium-gray border-medium-gray/30',
    draft: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
  }

  const fetchOrganizationData = useCallback(async () => {
    if (!user || !orgId) return

    setLoading(true)
    try {
      // Fetch workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('diffuse_workspaces')
        .select('*')
        .eq('id', orgId)
        .single()

      if (workspaceError) throw workspaceError
      setWorkspace(workspaceData)

      // Fetch members of this workspace
      const { data: membersData, error: membersError } = await supabase
        .from('diffuse_workspace_members')
        .select('user_id, role')
        .eq('workspace_id', orgId)

      if (membersError) throw membersError
      
      const memberIds = membersData?.map(m => m.user_id) || []
      setMembers(membersData || [])
      
      // Find current user's role
      const currentUserMember = membersData?.find(m => m.user_id === user.id)
      setUserRole(currentUserMember?.role || null)

      // Fetch public projects from all members of this workspace
      if (memberIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('diffuse_projects')
          .select('*')
          .in('created_by', memberIds)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError

        // Fetch creator info for each project
        const projectsWithCreators: ProjectWithCreator[] = []
        for (const project of projectsData || []) {
          // Try to get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', project.created_by)
            .single()

          projectsWithCreators.push({
            ...project,
            creator_name: profile?.full_name || undefined,
          })
        }

        setProjects(projectsWithCreators)
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, orgId, supabase])

  useEffect(() => {
    fetchOrganizationData()
  }, [fetchOrganizationData])

  const handleChangePlan = async (newPlan: OrganizationPlan) => {
    if (!workspace || userRole !== 'admin') return
    
    setSavingPlan(true)
    try {
      const { error } = await supabase
        .from('diffuse_workspaces')
        .update({ plan: newPlan })
        .eq('id', workspace.id)

      if (error) throw error
      
      setWorkspace({ ...workspace, plan: newPlan })
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('Failed to update plan')
    } finally {
      setSavingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          title="Organization Not Found"
          description="This organization doesn't exist or you don't have access to it."
        />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard/organization" 
              className="text-medium-gray hover:text-secondary-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-display-sm text-secondary-white">{workspace.name}</h1>
          </div>
          <p className="text-body-md text-medium-gray">
            {workspace.description || 'Public projects from organization members'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-body-sm text-medium-gray">Members</p>
            <p className="text-heading-md text-secondary-white">{members.length}</p>
          </div>
          <div className="text-right">
            <p className="text-body-sm text-medium-gray">Public Projects</p>
            <p className="text-heading-md text-secondary-white">{projects.length}</p>
          </div>
        </div>
      </div>

      {/* Invite Code */}
      {workspace.invite_code && (
        <div className="glass-container p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-body-sm text-medium-gray">Invite Code</p>
            <code className="text-heading-md text-cosmic-orange">{workspace.invite_code}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(workspace.invite_code || '')
              alert('Invite code copied!')
            }}
            className="btn-secondary px-4 py-2 text-body-sm"
          >
            Copy Code
          </button>
        </div>
      )}

      {/* Public Projects */}
      <h2 className="text-heading-lg text-secondary-white mb-4">Public Projects</h2>
      
      {projects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          title="No Public Projects"
          description="Members of this organization haven't shared any public projects yet."
        />
      ) : (
        <div className="glass-container overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">PROJECT</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED BY</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">STATUS</th>
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">CREATED</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <p className="text-body-md text-secondary-white font-medium">{project.name}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-body-sm text-secondary-white">
                      {project.creator_name || 'Unknown'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 text-caption font-medium rounded-full border ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatRelativeTime(project.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Organization Settings */}
      {userRole === 'admin' && (
        <div className="mt-12">
          <h2 className="text-heading-lg text-secondary-white mb-4">Organization Settings</h2>
          
          {/* Current Plan */}
          <div className="glass-container p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-body-md text-medium-gray mb-1">Current Plan</h3>
                <p className="text-heading-md text-secondary-white">
                  {workspace.plan && planDetails[workspace.plan as keyof typeof planDetails]
                    ? planDetails[workspace.plan as keyof typeof planDetails].name
                    : 'No plan selected'}
                </p>
              </div>
              {workspace.plan && planDetails[workspace.plan as keyof typeof planDetails] && (
                <div className="text-right">
                  <p className="text-heading-md text-cosmic-orange">
                    {planDetails[workspace.plan as keyof typeof planDetails].price}
                  </p>
                  <p className="text-body-sm text-medium-gray">
                    {planDetails[workspace.plan as keyof typeof planDetails].projects} projects
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Change Plan */}
          <div className="glass-container p-6">
            <h3 className="text-body-md text-secondary-white mb-4">Change Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(planDetails) as [OrganizationPlan, typeof planDetails[keyof typeof planDetails]][]).map(([key, plan]) => {
                const isCurrentPlan = workspace.plan === key
                return (
                  <button
                    key={key}
                    onClick={() => handleChangePlan(key)}
                    disabled={savingPlan || isCurrentPlan}
                    className={`p-4 rounded-glass border text-left transition-colors ${
                      isCurrentPlan
                        ? 'border-cosmic-orange/50 bg-cosmic-orange/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-body-md text-secondary-white font-medium">{plan.name}</p>
                      {isCurrentPlan && (
                        <span className="px-2 py-0.5 text-caption font-medium rounded bg-cosmic-orange/20 text-cosmic-orange">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-heading-md text-cosmic-orange mb-1">{plan.price}</p>
                    <p className="text-body-sm text-medium-gray">{plan.projects} projects</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

