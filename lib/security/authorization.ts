/**
 * Authorization Utilities
 * Implements ownership and access checks following OWASP best practices
 * 
 * Features:
 * - Project ownership verification
 * - Recording ownership verification
 * - Workspace membership checks
 * - Role-based access control
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Verify user is authenticated
 */
export async function requireAuth(): Promise<{ user: { id: string }; supabase: SupabaseClient }> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return { user: { id: user.id }, supabase }
}

/**
 * Check if user owns a project
 */
export async function verifyProjectOwnership(
  projectId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('diffuse_projects')
    .select('created_by, workspace_id, visibility, visible_to_orgs')
    .eq('id', projectId)
    .single()
  
  if (error || !data) {
    return false
  }
  
  // User owns the project
  if (data.created_by === userId) {
    return true
  }
  
  // Check if project is public and user has access via workspace
  if (data.visibility === 'public' && data.visible_to_orgs) {
    // Check if user is member of any visible workspace
    const { data: memberships } = await supabase
      .from('diffuse_workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .in('workspace_id', data.visible_to_orgs)
    
    if (memberships && memberships.length > 0) {
      return true
    }
  }
  
  // Check if project is in user's workspace
  if (data.workspace_id) {
    const { data: membership } = await supabase
      .from('diffuse_workspace_members')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('workspace_id', data.workspace_id)
      .single()
    
    if (membership) {
      return true
    }
  }
  
  return false
}

/**
 * Check if user owns a recording
 */
export async function verifyRecordingOwnership(
  recordingId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('diffuse_recordings')
    .select('user_id')
    .eq('id', recordingId)
    .single()
  
  if (error || !data) {
    return false
  }
  
  return data.user_id === userId
}

/**
 * Check if user has access to a workspace
 */
export async function verifyWorkspaceAccess(
  workspaceId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('diffuse_workspace_members')
    .select('workspace_id')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .single()
  
  return !error && !!data
}

/**
 * Check if user is admin of a workspace
 */
export async function verifyWorkspaceAdmin(
  workspaceId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const { data, error } = await supabase
    .from('diffuse_workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single()
  
  return !error && !!data
}

/**
 * Require project ownership - throws if user doesn't own project
 */
export async function requireProjectOwnership(
  projectId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const hasAccess = await verifyProjectOwnership(projectId, userId, supabase)
  if (!hasAccess) {
    throw new Error('Forbidden: You do not have access to this project')
  }
}

/**
 * Require recording ownership - throws if user doesn't own recording
 */
export async function requireRecordingOwnership(
  recordingId: string,
  userId: string,
  supabase: SupabaseClient
): Promise<void> {
  const hasAccess = await verifyRecordingOwnership(recordingId, userId, supabase)
  if (!hasAccess) {
    throw new Error('Forbidden: You do not have access to this recording')
  }
}

/**
 * Error response helpers
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Authentication required' },
    { status: 401 }
  )
}

export function forbiddenResponse(message = 'Access denied'): NextResponse {
  return NextResponse.json(
    { error: 'Forbidden', message },
    { status: 403 }
  )
}
