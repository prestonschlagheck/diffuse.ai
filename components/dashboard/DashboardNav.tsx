'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

const subscriptionNames: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  pro_max: 'Pro Max',
}

interface RecentProject {
  id: string
  name: string
  viewedAt: string
}

// Function to add a recent project to the database
export async function addRecentProject(project: { id: string; name: string }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return
  
  try {
    // Call the upsert function
    await supabase.rpc('upsert_recent_project', {
      p_user_id: user.id,
      p_project_id: project.id,
      p_project_name: project.name
    })
    
    // Dispatch event to notify the sidebar to refresh
    window.dispatchEvent(new Event('recentProjectsUpdated'))
  } catch (error) {
    console.error('Error saving recent project:', error)
  }
}

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [recentExpanded, setRecentExpanded] = useState(true)
  const supabase = createClient()

  // Load recent projects from database
  const loadRecentProjects = useCallback(async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('user_recent_projects')
        .select('project_id, project_name, viewed_at')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      setRecentProjects(
        (data || []).map(item => ({
          id: item.project_id,
          name: item.project_name,
          viewedAt: item.viewed_at
        }))
      )
    } catch (error) {
      console.error('Error loading recent projects:', error)
    }
  }, [user, supabase])

  useEffect(() => {
    loadRecentProjects()
    
    // Listen for updates
    window.addEventListener('recentProjectsUpdated', loadRecentProjects)
    return () => window.removeEventListener('recentProjectsUpdated', loadRecentProjects)
  }, [loadRecentProjects])

  // Get display name - use full_name if available, otherwise email prefix
  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User'
  const subscriptionTier = userProfile?.subscription_tier || 'free'
  const subscriptionLabel = subscriptionNames[subscriptionTier] || 'Free'

  const navItems = [
    { 
      name: 'Organizations', 
      href: '/dashboard/organization', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      name: 'Projects', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    { 
      name: 'Shared With Me', 
      href: '/dashboard/shared', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Recordings', 
      href: '/dashboard/recordings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 bg-white/5 backdrop-blur-glass border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold">
          diffuse<span className="text-cosmic-orange">.ai</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-glass text-body-sm transition-colors ${
                isActive
                  ? 'bg-cosmic-orange/20 text-cosmic-orange'
                  : 'text-secondary-white hover:bg-white/10'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setRecentExpanded(!recentExpanded)}
            className="flex items-center gap-2 text-caption text-medium-gray uppercase tracking-wider mb-1 px-4 hover:text-secondary-white transition-colors"
          >
            <span>Recent</span>
            <svg 
              className={`w-2.5 h-2.5 transition-transform duration-200 ${recentExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div 
            className={`space-y-1 overflow-hidden transition-all duration-300 ease-out ${
              recentExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {recentProjects.map((project, index) => {
              const isActive = pathname === `/dashboard/projects/${project.id}`
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-glass text-body-sm transition-all ${
                    isActive
                      ? 'bg-cosmic-orange/20 text-cosmic-orange'
                      : 'text-secondary-white hover:bg-white/10'
                  }`}
                  style={{
                    transitionDelay: recentExpanded ? `${index * 50}ms` : '0ms',
                    transform: recentExpanded ? 'translateY(0)' : 'translateY(-8px)',
                    opacity: recentExpanded ? 1 : 0,
                  }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="truncate">{project.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Section */}
      <div className="p-4">
        {/* User Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full px-4 py-3 bg-white/5 rounded-glass text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors"
          >
            <div className="truncate">
              <div className="font-medium truncate">{displayName}</div>
              <div className="text-caption text-cosmic-orange">{subscriptionLabel}</div>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-dark-gray border border-white/10 rounded-glass z-50 overflow-hidden">
            <Link
              href="/dashboard/settings"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors border-b border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <Link
              href="/dashboard/subscription"
              onClick={() => setShowUserMenu(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors border-b border-white/10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Subscription
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-body-sm text-red-400/80 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
        </div>
      </div>
    </nav>
  )
}

