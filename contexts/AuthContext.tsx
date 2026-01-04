'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { DiffuseWorkspace, UserRole } from '@/types/database'

type SubscriptionTier = 'free' | 'pro' | 'pro_max'

interface UserProfile {
  id: string
  full_name: string | null
  subscription_tier: SubscriptionTier
  user_level: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<Array<{ workspace: DiffuseWorkspace; role: UserRole }>>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<DiffuseWorkspace | null>(null)
  const supabase = createClient()

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('Could not fetch user profile:', error)
        setUserProfile({
          id: userId,
          full_name: null,
          subscription_tier: 'free',
          user_level: 'individual',
        })
        return
      }

      if (data) {
        setUserProfile(data)
      } else {
        // Create default profile if none exists
        const defaultProfile: UserProfile = {
          id: userId,
          full_name: null,
          subscription_tier: 'free',
          user_level: 'individual',
        }
        setUserProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUserProfile({
        id: userId,
        full_name: null,
        subscription_tier: 'free',
        user_level: 'individual',
      })
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWorkspaces(session.user.id)
        fetchUserProfile(session.user.id)
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
        fetchUserProfile(session.user.id)
      } else {
        setWorkspaces([])
        setCurrentWorkspace(null)
        setUserProfile(null)
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
          invite_code,
          plan,
          created_at,
          updated_at,
          owner_id
        )
      `)
      .eq('user_id', userId)

    if (memberships && memberships.length > 0) {
      const workspaceData = memberships.map((m: any) => ({
        workspace: m.workspace,
        role: m.role as UserRole,
      }))
      setWorkspaces(workspaceData)
      
      // Set first workspace as current if none selected
      if (!currentWorkspace && workspaceData.length > 0) {
        setCurrentWorkspace(workspaceData[0].workspace)
      }
    } else {
      // User has no workspaces - that's okay!
      setWorkspaces([])
      setCurrentWorkspace(null)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setWorkspaces([])
    setCurrentWorkspace(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
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

