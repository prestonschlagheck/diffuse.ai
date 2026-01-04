'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import ProjectCard from '@/components/dashboard/ProjectCard'
import CreateProjectModal from '@/components/dashboard/CreateProjectModal'
import EmptyState from '@/components/dashboard/EmptyState'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import type { DiffuseProject } from '@/types/database'

export default function DashboardPage() {
  const { user, currentWorkspace, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState<DiffuseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (currentWorkspace) {
      fetchProjects()
    }
  }, [currentWorkspace])

  const fetchProjects = async () => {
    if (!currentWorkspace) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('diffuse_projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentWorkspace) {
    return (
      <EmptyState
        title="No Workspace Selected"
        description="Please select a workspace from the sidebar to view your projects."
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-sm text-secondary-white mb-2">
          Welcome back, {user.email?.split('@')[0]}
        </h1>
        <p className="text-body-lg text-medium-gray">
          Workspace: {currentWorkspace.name}
        </p>
      </div>

      {/* Create Project Button */}
      <div className="mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-6 py-3"
        >
          + Create New Project
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
          title="No Projects Yet"
          description="Create your first project to start processing inputs and generating outputs with Diffuse workflows."
          action={{
            label: 'Create Project',
            onClick: () => setShowCreateModal(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          workspaceId={currentWorkspace.id}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  )
}

