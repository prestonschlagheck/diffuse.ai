export type UserRole = 'admin' | 'member'

export type ProjectStatus = 'active' | 'archived' | 'draft'

export type ProjectVisibility = 'private' | 'public'

export type InputType = 'text' | 'audio'

export type WorkflowStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface DiffuseWorkspace {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  owner_id: string
}

export interface DiffuseWorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: UserRole
  joined_at: string
  invited_by?: string
}

export interface DiffuseProject {
  id: string
  workspace_id: string | null
  name: string
  description?: string
  visibility: ProjectVisibility
  status: ProjectStatus
  created_at: string
  updated_at: string
  created_by: string
}

export interface DiffuseProjectInput {
  id: string
  project_id: string
  type: InputType
  content?: string
  file_path?: string
  file_name?: string
  file_size?: number
  metadata?: Record<string, any>
  created_at: string
  created_by: string
}

export interface DiffuseProjectOutput {
  id: string
  project_id: string
  input_id?: string
  content: string
  structured_data?: Record<string, any>
  workflow_status: WorkflowStatus
  workflow_metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserWithWorkspaces {
  id: string
  email: string
  workspaces: Array<{
    workspace: DiffuseWorkspace
    role: UserRole
  }>
}

