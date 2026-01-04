'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { DiffuseWorkspace, UserRole } from '@/types/database'

interface AuthContextType {
  user: User | null
  loading: boolean
  workspaces: Array<{ workspace: DiffuseWorkspace; role: UserRole }>
  currentWorkspace: DiffuseWorkspace | null
  setCurrentWorkspace: (workspace: DiffuseWorkspace) => void
  signOut: () => Promise<void>
  fetchWorkspaces: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: DiffuseWorkspace; role: UserRole }>>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<DiffuseWorkspace | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWorkspaces(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWorkspaces(session.user.id)
      } else {
        setWorkspaces([])
        setCurrentWorkspace(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchWorkspaces = async (userId: string) => {
    const { data: memberships } = await supabase
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
      .eq('user_id', userId)

    // If user has no workspaces, create a default personal workspace
    if (!memberships || memberships.length === 0) {
      try {
        console.log('Creating personal workspace for user:', userId)
        
        // Create personal workspace
        const { data: newWorkspace, error: workspaceError } = await supabase
          .from('diffuse_workspaces')
          .insert({
            name: 'Personal Workspace',
            description: 'Your personal workspace',
            owner_id: userId,
          })
          .select()
          .single()

        if (workspaceError) {
          console.error('Workspace creation error:', workspaceError)
          throw workspaceError
        }

        console.log('Workspace created:', newWorkspace)

        // Add user as admin of the workspace
        const { error: memberError } = await supabase
          .from('diffuse_workspace_members')
          .insert({
            workspace_id: newWorkspace.id,
            user_id: userId,
            role: 'admin',
          })

        if (memberError) {
          console.error('Member insertion error:', memberError)
          throw memberError
        }

        console.log('User added as admin to workspace')

        // Set the new workspace as current
        setWorkspaces([{ workspace: newWorkspace, role: 'admin' }])
        setCurrentWorkspace(newWorkspace)
        console.log('Workspace set as current')
      } catch (error) {
        console.error('Error creating default workspace:', error)
        alert('Failed to create workspace. Please check the browser console for details.')
      }
    } else {
      const workspaceData = memberships.map((m: any) => ({
        workspace: m.workspace,
        role: m.role as UserRole,
      }))
      setWorkspaces(workspaceData)
      
      // Set first workspace as current if none selected
      if (!currentWorkspace && workspaceData.length > 0) {
        setCurrentWorkspace(workspaceData[0].workspace)
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setWorkspaces([])
    setCurrentWorkspace(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        workspaces,
        currentWorkspace,
        setCurrentWorkspace,
        signOut,
        fetchWorkspaces: () => fetchWorkspaces(user?.id || ''),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

