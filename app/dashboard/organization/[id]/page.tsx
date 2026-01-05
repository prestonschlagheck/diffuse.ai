'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import { formatDateWithTime } from '@/lib/utils/format'
import type { DiffuseWorkspace, DiffuseProject, OrganizationPlan } from '@/types/database'

const planDetails = {
  enterprise_pro: { name: 'Enterprise Pro', projects: 50, price: '$100/mo' },
  enterprise_pro_max: { name: 'Enterprise Pro Max', projects: 'Unlimited', price: '$500/mo' },
}

interface ProjectWithCounts extends DiffuseProject {
  creator_name?: string
  input_count: number
  output_count: number
}

interface MemberWithDetails {
  user_id: string
  role: string
  name: string
  project_count: number
}

export default function OrganizationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string
  const { user } = useAuth()
  const [workspace, setWorkspace] = useState<DiffuseWorkspace | null>(null)
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [members, setMembers] = useState<MemberWithDetails[]>([])
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState(false)
  const [editingOrg, setEditingOrg] = useState(false)
  const [editOrgName, setEditOrgName] = useState('')
  const [editOrgDescription, setEditOrgDescription] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const supabase = createClient()

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
      
      // Find current user's role
      const currentUserMember = membersData?.find(m => m.user_id === user.id)
      setUserRole(currentUserMember?.role || null)

      // Fetch member details (name and project count)
      const membersWithDetails: MemberWithDetails[] = []
      for (const member of membersData || []) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', member.user_id)
          .single()

        // Get project count for this member that are visible to this org
        const { count: projectCount } = await supabase
          .from('diffuse_projects')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', member.user_id)
          .eq('visibility', 'public')
          .contains('visible_to_orgs', [orgId])

        membersWithDetails.push({
          user_id: member.user_id,
          role: member.role,
          name: profile?.full_name || 'Unknown',
          project_count: projectCount || 0,
        })
      }
      setMembers(membersWithDetails)

      // Fetch projects that are visible to this organization
      if (memberIds.length > 0) {
        const { data: projectsData, error: projectsError } = await supabase
          .from('diffuse_projects')
          .select('*')
          .eq('visibility', 'public')
          .contains('visible_to_orgs', [orgId])
          .order('created_at', { ascending: false })

        if (projectsError) throw projectsError

        // Fetch input/output counts for each project
        const projectsWithCounts: ProjectWithCounts[] = []
        for (const project of projectsData || []) {
          // Get creator name
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', project.created_by)
            .single()

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

          projectsWithCounts.push({
            ...project,
            creator_name: profile?.full_name || undefined,
            input_count: inputCount || 0,
            output_count: outputCount || 0,
          })
        }

        setProjects(projectsWithCounts)
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

  const handleLeaveOrganization = async () => {
    if (!user || !workspace) return
    
    const confirmLeave = window.confirm(
      `Are you sure you want to leave "${workspace.name}"? You'll lose access to all shared projects.`
    )
    
    if (!confirmLeave) return
    
    try {
      const { error } = await supabase
        .from('diffuse_workspace_members')
        .delete()
        .eq('workspace_id', workspace.id)
        .eq('user_id', user.id)

      if (error) throw error
      
      router.push('/dashboard/organization')
    } catch (error) {
      console.error('Error leaving organization:', error)
      alert('Failed to leave organization')
    }
  }

  const handleEditOrg = () => {
    if (workspace) {
      setEditOrgName(workspace.name)
      setEditOrgDescription(workspace.description || '')
      setEditingOrg(true)
    }
  }

  const handleSaveOrg = async () => {
    if (!workspace) return
    try {
      const { error } = await supabase
        .from('diffuse_workspaces')
        .update({ 
          name: editOrgName,
          description: editOrgDescription || null
        })
        .eq('id', workspace.id)

      if (error) throw error
      setEditingOrg(false)
      fetchOrganizationData()
    } catch (error) {
      console.error('Error saving organization:', error)
      alert('Failed to save organization')
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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link 
            href="/dashboard/organization" 
            className="text-medium-gray hover:text-secondary-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          {editingOrg ? (
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={editOrgName}
                onChange={(e) => setEditOrgName(e.target.value)}
                className="w-full text-display-sm bg-white/5 border border-white/10 rounded-glass px-4 py-2 text-secondary-white focus:outline-none focus:border-cosmic-orange"
              />
              <textarea
                value={editOrgDescription}
                onChange={(e) => setEditOrgDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full text-body-lg bg-white/5 border border-white/10 rounded-glass px-4 py-2 text-medium-gray focus:outline-none focus:border-cosmic-orange resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveOrg} className="btn-primary px-4 py-2 text-body-sm">
                  Save
                </button>
                <button onClick={() => setEditingOrg(false)} className="btn-secondary px-4 py-2 text-body-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-display-sm text-secondary-white">{workspace.name}</h1>
                {userRole === 'admin' && (
                  <button
                    onClick={handleEditOrg}
                    className="opacity-0 group-hover:opacity-100 text-medium-gray hover:text-cosmic-orange transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              {workspace.description && (
                <p className="text-body-md text-medium-gray mt-1">
                  {workspace.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-container p-4 text-center">
          <p className="text-body-sm text-medium-gray mb-1">Members</p>
          <p className="text-heading-lg text-secondary-white">{members.length}</p>
        </div>
        <div className="glass-container p-4 text-center">
          <p className="text-body-sm text-medium-gray mb-1">Projects</p>
          <p className="text-heading-lg text-secondary-white">{projects.length}</p>
        </div>
        <div className="glass-container p-4 text-center">
          <p className="text-body-sm text-medium-gray mb-1">Invite Code</p>
          {workspace.invite_code ? (
            <button
              onClick={() => {
                navigator.clipboard.writeText(workspace.invite_code || '')
                setCopiedCode(true)
                setTimeout(() => setCopiedCode(false), 2000)
              }}
              className="text-heading-lg text-cosmic-orange hover:text-cosmic-orange/80 transition-colors"
            >
              {copiedCode ? 'Copied!' : workspace.invite_code}
            </button>
          ) : (
            <span className="text-heading-lg text-medium-gray">—</span>
          )}
        </div>
      </div>

      {/* Projects */}
      <h2 className="text-heading-lg text-secondary-white mb-4">Projects</h2>
      
      {projects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
          title="No Shared Projects"
          description="No projects have been shared with this organization yet."
        />
      ) : (
        <div className="glass-container overflow-hidden mb-12">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
                <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">INPUTS</th>
                <th className="text-center py-4 px-6 text-caption text-medium-gray font-medium">OUTPUTS</th>
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
                  <td className="py-4 px-6 text-body-sm text-medium-gray">
                    {formatDateWithTime(project.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Members */}
      <h2 className="text-heading-lg text-secondary-white mb-4">Members</h2>
      
      <div className="glass-container overflow-hidden mb-12">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">NAME</th>
              <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">PROJECTS</th>
              <th className="text-left py-4 px-6 text-caption text-medium-gray font-medium">ROLE</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.user_id}
                className="border-b border-white/10 last:border-b-0"
              >
                <td className="py-4 px-6">
                  <p className="text-body-md text-secondary-white font-medium">{member.name}</p>
                </td>
                <td className="py-4 px-6 text-body-sm text-medium-gray">
                  {member.project_count}
                </td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 text-caption font-medium rounded-full border capitalize ${
                    member.role === 'admin' 
                      ? 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30'
                      : 'bg-medium-gray/20 text-medium-gray border-medium-gray/30'
                  }`}>
                    {member.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settings */}
      {userRole === 'admin' && (
        <div>
          <h2 className="text-heading-lg text-secondary-white mb-4">Settings</h2>
          
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

      {/* Leave Organization */}
      <div className="glass-container p-6 mt-8 border border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-body-md text-secondary-white mb-1">Leave Organization</h3>
            <p className="text-body-sm text-medium-gray">
              Remove yourself from this organization. You&apos;ll lose access to shared projects.
            </p>
          </div>
          <button
            onClick={handleLeaveOrganization}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-glass border border-red-500/30 transition-colors text-body-sm font-medium"
          >
            Leave Organization
          </button>
        </div>
      </div>
    </div>
  )
}

