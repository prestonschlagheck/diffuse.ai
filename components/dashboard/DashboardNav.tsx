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
    { name: 'Organization', href: '/dashboard/organization', icon: '🏢' },
    { name: 'Projects', href: '/dashboard', icon: '📁' },
    { name: 'Recordings', href: '/dashboard/recordings', icon: '🎙️' },
    { name: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
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
              <span>{item.icon}</span>
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

