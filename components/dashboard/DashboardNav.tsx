'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, workspaces, currentWorkspace, setCurrentWorkspace, signOut } = useAuth()
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navItems = [
    { 
      name: 'Organization', 
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
      name: 'Recordings', 
      href: '/dashboard/recordings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )
    },
    { 
      name: 'Settings', 
      href: '/dashboard/settings', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <nav className="fixed top-0 left-0 bottom-0 w-64 glass-container border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="text-xl font-bold">
          diffuse<span className="text-cosmic-orange">.ai</span>
        </Link>
      </div>

      {/* Organization Selector */}
      {workspaces.length > 0 && (
        <div className="p-4 border-b border-white/10 relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="w-full px-4 py-3 bg-white/5 rounded-glass text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            <span className="truncate">{currentWorkspace?.name || 'Select Organization'}</span>
            <span className="text-cosmic-orange">▼</span>
          </button>

          {showWorkspaceMenu && (
            <div className="absolute top-full left-4 right-4 mt-2 glass-container border border-white/10 z-50">
              {workspaces.map(({ workspace, role }) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setCurrentWorkspace(workspace)
                    setShowWorkspaceMenu(false)
                  }}
                  className="w-full px-4 py-3 text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-caption text-medium-gray capitalize">{role}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-glass text-body-sm transition-colors ${
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

      {/* User Menu */}
      <div className="p-4 border-t border-white/10 relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full px-4 py-3 bg-white/5 rounded-glass text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors flex items-center justify-between"
        >
          <div className="truncate">
            <div className="font-medium truncate">{user?.email}</div>
          </div>
          <span className="text-cosmic-orange">▼</span>
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full left-4 right-4 mb-2 glass-container border border-white/10 z-50">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-3 text-left text-body-sm text-secondary-white hover:bg-white/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

