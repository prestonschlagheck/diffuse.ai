'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, truncateText } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import InputDetailModal from '@/components/dashboard/InputDetailModal'
import OutputDetailModal from '@/components/dashboard/OutputDetailModal'
import type { DiffuseProject, DiffuseProjectInput, DiffuseProjectOutput } from '@/types/database'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<DiffuseProject | null>(null)
  const [inputs, setInputs] = useState<DiffuseProjectInput[]>([])
  const [outputs, setOutputs] = useState<DiffuseProjectOutput[]>([])
  const [activeTab, setActiveTab] = useState<'inputs' | 'outputs'>('inputs')
  const [loading, setLoading] = useState(true)
  const [selectedInput, setSelectedInput] = useState<DiffuseProjectInput | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<DiffuseProjectOutput | null>(null)
  const supabase = createClient()

  const fetchProjectData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('diffuse_projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // Fetch inputs
      const { data: inputsData, error: inputsError } = await supabase
        .from('diffuse_project_inputs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (inputsError) throw inputsError
      setInputs(inputsData || [])

      // Fetch outputs
      const { data: outputsData, error: outputsError } = await supabase
        .from('diffuse_project_outputs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (outputsError) throw outputsError
      setOutputs(outputsData || [])
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, supabase])

  useEffect(() => {
    fetchProjectData()
  }, [fetchProjectData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The project you're looking for doesn't exist or you don't have access to it."
        action={{
          label: 'Back to Dashboard',
          onClick: () => router.push('/dashboard'),
        }}
      />
    )
  }

  const statusColors = {
    active: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
    archived: 'bg-medium-gray/20 text-medium-gray border-medium-gray/30',
    draft: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
  }

  const workflowStatusColors = {
    pending: 'bg-pale-blue/20 text-pale-blue border-pale-blue/30',
    processing: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-body-sm text-medium-gray hover:text-cosmic-orange transition-colors mb-4 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-display-sm text-secondary-white mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-body-lg text-medium-gray">{project.description}</p>
            )}
          </div>
          <span
            className={`px-4 py-2 text-body-sm font-medium rounded-full border ${
              statusColors[project.status]
            }`}
          >
            {project.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('inputs')}
          className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
            activeTab === 'inputs'
              ? 'text-cosmic-orange'
              : 'text-secondary-white hover:text-white'
          }`}
        >
          Inputs ({inputs.length})
          {activeTab === 'inputs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('outputs')}
          className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
            activeTab === 'outputs'
              ? 'text-cosmic-orange'
              : 'text-secondary-white hover:text-white'
          }`}
        >
          Outputs ({outputs.length})
          {activeTab === 'outputs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
          )}
        </button>
      </div>

      {/* Inputs Tab */}
      {activeTab === 'inputs' && (
        <div>
          {inputs.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              }
              title="No Inputs Yet"
              description="Inputs will appear here when they are submitted to this project via the workflow API."
            />
          ) : (
            <div className="space-y-4">
              {inputs.map((input) => (
                <div
                  key={input.id}
                  onClick={() => setSelectedInput(input)}
                  className="glass-container-hover p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {input.type === 'text' ? '📝' : '🎤'}
                      </span>
                      <div>
                        <p className="text-body-md text-secondary-white font-medium capitalize">
                          {input.type} Input
                        </p>
                        <p className="text-caption text-medium-gray">
                          {formatRelativeTime(input.created_at)}
                        </p>
                      </div>
                    </div>
                    {input.file_name && (
                      <span className="text-body-sm text-medium-gray">{input.file_name}</span>
                    )}
                  </div>
                  {input.content && (
                    <p className="text-body-sm text-medium-gray">
                      {truncateText(input.content, 200)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Outputs Tab */}
      {activeTab === 'outputs' && (
        <div>
          {outputs.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
              title="No Outputs Yet"
              description="Outputs will appear here when the workflow processes your inputs and returns results."
            />
          ) : (
            <div className="space-y-4">
              {outputs.map((output) => (
                <div
                  key={output.id}
                  onClick={() => setSelectedOutput(output)}
                  className="glass-container-hover p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-body-md text-secondary-white font-medium mb-1">
                        Workflow Output
                      </p>
                      <p className="text-caption text-medium-gray">
                        {formatRelativeTime(output.created_at)}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-caption font-medium rounded-full border ${
                        workflowStatusColors[output.workflow_status]
                      }`}
                    >
                      {output.workflow_status}
                    </span>
                  </div>
                  <p className="text-body-sm text-medium-gray">
                    {truncateText(output.content, 200)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {selectedInput && (
        <InputDetailModal input={selectedInput} onClose={() => setSelectedInput(null)} />
      )}
      {selectedOutput && (
        <OutputDetailModal output={selectedOutput} onClose={() => setSelectedOutput(null)} />
      )}
    </div>
  )
}

