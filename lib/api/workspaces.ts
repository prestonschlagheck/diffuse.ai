import { createClient } from '@/lib/supabase/server'
import type { DiffuseWorkspace, DiffuseWorkspaceMember, UserRole } from '@/types/database'

export async function getUserWorkspaces() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: memberships, error } = await supabase
    .from('diffuse_workspace_members')
    .select(`
      role,
      workspace:diffuse_workspaces (
        id,
        name,
        description,
        created_at,
        updated_at,
        owner_id
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }

  return memberships.map((m: any) => ({
    workspace: m.workspace,
    role: m.role as UserRole,
  }))
}

export async function getWorkspaceById(workspaceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (error) {
    console.error('Error fetching workspace:', error)
    return null
  }

  return data as DiffuseWorkspace
}

export async function getUserRoleInWorkspace(workspaceId: string): Promise<UserRole | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('diffuse_workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }

  return data.role as UserRole
}

export async function getWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_workspace_members')
    .select(`
      id,
      user_id,
      role,
      joined_at,
      invited_by
    `)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('Error fetching workspace members:', error)
    return []
  }

  return data as DiffuseWorkspaceMember[]
}

export async function isWorkspaceAdmin(workspaceId: string): Promise<boolean> {
  const role = await getUserRoleInWorkspace(workspaceId)
  return role === 'admin'
}

