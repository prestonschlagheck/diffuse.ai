'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime, truncateText } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import InputDetailModal from '@/components/dashboard/InputDetailModal'
import OutputDetailModal from '@/components/dashboard/OutputDetailModal'
import SelectRecordingModal from '@/components/dashboard/SelectRecordingModal'
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
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [showTextInputModal, setShowTextInputModal] = useState(false)
  const [textInputContent, setTextInputContent] = useState('')
  const [textInputTitle, setTextInputTitle] = useState('')
  const [savingTextInput, setSavingTextInput] = useState(false)
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

  const handleSaveTextInput = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInputContent.trim()) return

    setSavingTextInput(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('diffuse_project_inputs')
        .insert({
          project_id: projectId,
          type: 'text',
          content: textInputContent,
          file_name: textInputTitle || 'Text Input',
          metadata: {
            source: 'manual',
          },
          created_by: user.id,
        })

      if (error) throw error

      setTextInputContent('')
      setTextInputTitle('')
      setShowTextInputModal(false)
      fetchProjectData()
    } catch (error) {
      console.error('Error saving text input:', error)
      alert('Failed to save text input')
    } finally {
      setSavingTextInput(false)
    }
  }

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
          {/* Add Input Buttons */}
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() => setShowTextInputModal(true)}
              className="btn-secondary px-4 py-2 flex items-center gap-2 text-body-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Add Text Input
            </button>
            <button
              onClick={() => setShowRecordingModal(true)}
              className="btn-primary px-4 py-2 flex items-center gap-2 text-body-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Add from Recordings
            </button>
          </div>

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
              description="Add recordings as inputs or submit inputs via the workflow API."
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
                    {input.type === 'text' ? (
                      <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
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
        <OutputDetailModal
          output={selectedOutput}
          onClose={() => setSelectedOutput(null)}
          onUpdate={fetchProjectData}
        />
      )}
      {showRecordingModal && (
        <SelectRecordingModal
          projectId={projectId}
          onClose={() => setShowRecordingModal(false)}
          onSuccess={fetchProjectData}
        />
      )}

      {/* Text Input Modal */}
      {showTextInputModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-heading-lg text-secondary-white">Add Text Input</h2>
                <p className="text-body-sm text-medium-gray mt-1">
                  Paste or type text to use as input for this project
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTextInputModal(false)
                  setTextInputContent('')
                  setTextInputTitle('')
                }}
                className="text-medium-gray hover:text-secondary-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTextInput} className="flex-1 flex flex-col">
              <div className="mb-4">
                <label className="block text-body-sm text-secondary-white mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={textInputTitle}
                  onChange={(e) => setTextInputTitle(e.target.value)}
                  placeholder="Meeting Notes - Jan 2026"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors"
                />
              </div>
              
              <div className="flex-1 mb-6">
                <label className="block text-body-sm text-secondary-white mb-2">
                  Content
                </label>
                <textarea
                  value={textInputContent}
                  onChange={(e) => setTextInputContent(e.target.value)}
                  placeholder="Paste or type your text here..."
                  required
                  className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTextInputModal(false)
                    setTextInputContent('')
                    setTextInputTitle('')
                  }}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTextInput || !textInputContent.trim()}
                  className="btn-primary flex-1 py-3 disabled:opacity-50"
                >
                  {savingTextInput ? 'Saving...' : 'Add Input'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

