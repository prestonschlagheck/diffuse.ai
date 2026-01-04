import { createClient } from '@/lib/supabase/server'
import type { DiffuseProject, DiffuseProjectInput, DiffuseProjectOutput } from '@/types/database'

export async function getProjectsByWorkspace(workspaceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data as DiffuseProject[]
}

export async function getProjectById(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data as DiffuseProject
}

export async function getProjectInputs(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_project_inputs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project inputs:', error)
    return []
  }

  return data as DiffuseProjectInput[]
}

export async function getProjectOutputs(projectId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_project_outputs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching project outputs:', error)
    return []
  }

  return data as DiffuseProjectOutput[]
}

export async function createProject(
  workspaceId: string,
  name: string,
  description?: string,
  visibility: 'private' | 'shared' = 'private'
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('diffuse_projects')
    .insert({
      workspace_id: workspaceId,
      name,
      description,
      visibility,
      status: 'active',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    throw error
  }

  return data as DiffuseProject
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<DiffuseProject, 'name' | 'description' | 'visibility' | 'status'>>
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('diffuse_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    throw error
  }

  return data as DiffuseProject
}

