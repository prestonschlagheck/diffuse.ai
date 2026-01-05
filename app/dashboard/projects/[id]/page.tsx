'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateWithTime, truncateText } from '@/lib/utils/format'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import InputDetailModal from '@/components/dashboard/InputDetailModal'
import OutputDetailModal from '@/components/dashboard/OutputDetailModal'
import SelectRecordingModal from '@/components/dashboard/SelectRecordingModal'
import { addRecentProject } from '@/components/dashboard/DashboardNav'
import type { DiffuseProject, DiffuseProjectInput, DiffuseProjectOutput, ProjectVisibility } from '@/types/database'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { workspaces } = useAuth()
  const projectId = params.id as string

  const [project, setProject] = useState<DiffuseProject | null>(null)
  const [inputs, setInputs] = useState<DiffuseProjectInput[]>([])
  const [trashedInputs, setTrashedInputs] = useState<DiffuseProjectInput[]>([])
  const [outputs, setOutputs] = useState<DiffuseProjectOutput[]>([])
  const [activeTab, setActiveTab] = useState<'inputs' | 'outputs' | 'visibility' | 'trash'>('inputs')
  const [loading, setLoading] = useState(true)
  const [selectedInput, setSelectedInput] = useState<DiffuseProjectInput | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<DiffuseProjectOutput | null>(null)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [showTextInputModal, setShowTextInputModal] = useState(false)
  const [textInputContent, setTextInputContent] = useState('')
  const [textInputTitle, setTextInputTitle] = useState('')
  const [savingTextInput, setSavingTextInput] = useState(false)
  const [editingInput, setEditingInput] = useState<string | null>(null)
  const [editInputContent, setEditInputContent] = useState('')
  const [hoveredInput, setHoveredInput] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])
  const [savingVisibility, setSavingVisibility] = useState(false)
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
      setVisibility(projectData.visibility || 'private')
      setSelectedOrgs(projectData.visible_to_orgs || [])

      // Fetch active inputs (not deleted)
      const { data: inputsData, error: inputsError } = await supabase
        .from('diffuse_project_inputs')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (inputsError) throw inputsError
      setInputs(inputsData || [])

      // Fetch trashed inputs
      const { data: trashedData, error: trashedError } = await supabase
        .from('diffuse_project_inputs')
        .select('*')
        .eq('project_id', projectId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

      if (!trashedError) {
        setTrashedInputs(trashedData || [])
      }

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

  // Track recent project view
  useEffect(() => {
    if (project) {
      addRecentProject({ id: project.id, name: project.name })
    }
  }, [project])

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

  const handleDeleteInput = async (inputId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', inputId)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error deleting input:', error)
      alert('Failed to delete input')
    }
  }

  const handleRestoreInput = async (inputId: string) => {
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .update({ deleted_at: null })
        .eq('id', inputId)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error restoring input:', error)
      alert('Failed to restore input')
    }
  }

  const handleEditInput = async (inputId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const input = inputs.find(i => i.id === inputId)
    if (input) {
      setEditingInput(inputId)
      setEditInputContent(input.content || '')
    }
  }

  const handleSaveInputEdit = async () => {
    if (!editingInput) return
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .update({ content: editInputContent })
        .eq('id', editingInput)

      if (error) throw error
      setEditingInput(null)
      setEditInputContent('')
      fetchProjectData()
    } catch (error) {
      console.error('Error saving input:', error)
      alert('Failed to save input')
    }
  }

  const handleEditProject = () => {
    if (project) {
      setEditProjectName(project.name)
      setEditProjectDescription(project.description || '')
      setEditingProject(true)
    }
  }

  const handleSaveProject = async () => {
    if (!project) return
    try {
      const { error } = await supabase
        .from('diffuse_projects')
        .update({ 
          name: editProjectName,
          description: editProjectDescription || null
        })
        .eq('id', project.id)

      if (error) throw error
      setEditingProject(false)
      fetchProjectData()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
    }
  }

  const handleSaveVisibility = async () => {
    if (!project) return
    setSavingVisibility(true)
    try {
      const { error } = await supabase
        .from('diffuse_projects')
        .update({ 
          visibility: visibility,
          visible_to_orgs: visibility === 'public' ? selectedOrgs : []
        })
        .eq('id', project.id)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error saving visibility:', error)
      alert('Failed to save visibility settings')
    } finally {
      setSavingVisibility(false)
    }
  }

  const toggleOrgSelection = (orgId: string) => {
    setSelectedOrgs(prev => 
      prev.includes(orgId) 
        ? prev.filter(id => id !== orgId)
        : [...prev, orgId]
    )
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
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {editingProject ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full text-display-sm bg-white/5 border border-white/10 rounded-glass px-4 py-2 text-secondary-white focus:outline-none focus:border-cosmic-orange"
                />
                <textarea
                  value={editProjectDescription}
                  onChange={(e) => setEditProjectDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full text-body-lg bg-white/5 border border-white/10 rounded-glass px-4 py-2 text-medium-gray focus:outline-none focus:border-cosmic-orange resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProject} className="btn-primary px-4 py-2 text-body-sm">
                    Save
                  </button>
                  <button onClick={() => setEditingProject(false)} className="btn-secondary px-4 py-2 text-body-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group">
                <div className="flex items-center gap-3">
                  <h1 className="text-display-sm text-secondary-white">{project.name}</h1>
                  <button
                    onClick={handleEditProject}
                    className="opacity-0 group-hover:opacity-100 text-medium-gray hover:text-cosmic-orange transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                {project.description && (
                  <p className="text-body-lg text-medium-gray mt-1">{project.description}</p>
                )}
              </div>
            )}
          </div>
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
        <button
          onClick={() => setActiveTab('visibility')}
          className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
            activeTab === 'visibility'
              ? 'text-cosmic-orange'
              : 'text-secondary-white hover:text-white'
          }`}
        >
          Visibility ({visibility === 'public' ? selectedOrgs.length : 0})
          {activeTab === 'visibility' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
          )}
        </button>
        {trashedInputs.length > 0 && (
          <button
            onClick={() => setActiveTab('trash')}
            className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
              activeTab === 'trash'
                ? 'text-cosmic-orange'
                : 'text-secondary-white hover:text-white'
            }`}
          >
            Trash ({trashedInputs.length})
            {activeTab === 'trash' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
            )}
          </button>
        )}
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
              {inputs.map((input) => {
                const isFromRecording = input.metadata?.source === 'recording'
                const isHovered = hoveredInput === input.id
                
                return (
                  <div
                    key={input.id}
                    onMouseEnter={() => setHoveredInput(input.id)}
                    onMouseLeave={() => setHoveredInput(null)}
                    onClick={() => setSelectedInput(input)}
                    className={`glass-container p-6 cursor-pointer transition-all relative ${
                      isHovered ? 'bg-white/5 backdrop-blur-sm' : ''
                    }`}
                  >
                    {/* Hover Actions */}
                    {isHovered && (
                      <div className="absolute top-4 right-4 flex gap-2 z-10">
                        <button
                          onClick={(e) => handleEditInput(input.id, e)}
                          className="p-2 bg-white/10 hover:bg-cosmic-orange/20 rounded-glass transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteInput(input.id, e)}
                          className="p-2 bg-white/10 hover:bg-red-500/20 rounded-glass transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {isFromRecording ? (
                          <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <div>
                          <p className="text-body-md text-secondary-white font-medium">
                            {input.file_name || (isFromRecording ? 'Recording' : 'Text Input')}
                          </p>
                          <p className="text-caption text-medium-gray">
                            {formatDateWithTime(input.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {input.content && (
                      <p className="text-body-sm text-medium-gray">
                        {truncateText(input.content, 200)}
                      </p>
                    )}
                  </div>
                )
              })}
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
                        {formatDateWithTime(output.created_at)}
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

      {/* Visibility Tab */}
      {activeTab === 'visibility' && (
        <div className="max-w-2xl">
          <div className="glass-container p-6 mb-6">
            <h3 className="text-heading-md text-secondary-white mb-4">Who can see this project?</h3>
            <div className="space-y-3">
              {/* Private Option */}
              <button
                onClick={() => {
                  setVisibility('private')
                  setSelectedOrgs([])
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-glass transition-colors ${
                  visibility === 'private' 
                    ? 'bg-cosmic-orange/20 border border-cosmic-orange/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              >
                <svg className={`w-5 h-5 ${visibility === 'private' ? 'text-cosmic-orange' : 'text-medium-gray'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className={`text-body-md font-medium ${visibility === 'private' ? 'text-cosmic-orange' : 'text-secondary-white'}`}>
                  Private
                </span>
                {visibility === 'private' && (
                  <svg className="w-5 h-5 text-cosmic-orange ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Organization Options */}
              {workspaces.length > 0 && (
                <>
                  <div className="border-t border-white/10 my-4" />
                  <p className="text-caption text-medium-gray uppercase tracking-wider mb-3">Organizations</p>
                  {workspaces.map(({ workspace }) => {
                    const isSelected = selectedOrgs.includes(workspace.id)
                    return (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          if (isSelected) {
                            // Deselect this org
                            const newOrgs = selectedOrgs.filter(id => id !== workspace.id)
                            setSelectedOrgs(newOrgs)
                            // If no orgs selected, switch to private
                            if (newOrgs.length === 0) {
                              setVisibility('private')
                            }
                          } else {
                            // Select this org and switch to public
                            setVisibility('public')
                            setSelectedOrgs([...selectedOrgs, workspace.id])
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-glass transition-colors ${
                          isSelected 
                            ? 'bg-cosmic-orange/20 border border-cosmic-orange/30' 
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <svg className={`w-5 h-5 ${isSelected ? 'text-cosmic-orange' : 'text-medium-gray'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className={`text-body-md font-medium ${isSelected ? 'text-cosmic-orange' : 'text-secondary-white'}`}>
                          {workspace.name}
                        </span>
                        {isSelected && (
                          <svg className="w-5 h-5 text-cosmic-orange ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveVisibility}
            disabled={savingVisibility}
            className="btn-primary px-6 py-3 disabled:opacity-50"
          >
            {savingVisibility ? 'Saving...' : 'Save Visibility Settings'}
          </button>
        </div>
      )}

      {/* Trash Tab */}
      {activeTab === 'trash' && (
        <div>
          <div className="space-y-4">
            {trashedInputs.map((input) => {
              const isFromRecording = input.metadata?.source === 'recording'
              
              return (
                <div
                  key={input.id}
                  className="glass-container p-6 opacity-60"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isFromRecording ? (
                        <svg className="w-6 h-6 text-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      <div>
                        <p className="text-body-md text-secondary-white font-medium">
                          {input.file_name || (isFromRecording ? 'Recording' : 'Text Input')}
                        </p>
                        <p className="text-caption text-medium-gray">
                          Deleted {formatDateWithTime(input.deleted_at || input.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreInput(input.id)}
                      className="btn-secondary px-4 py-2 text-body-sm"
                    >
                      Restore
                    </button>
                  </div>
                  {input.content && (
                    <p className="text-body-sm text-medium-gray">
                      {truncateText(input.content, 200)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
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

      {/* Edit Input Modal */}
      {editingInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-8 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-heading-lg text-secondary-white">Edit Input</h2>
                <p className="text-body-sm text-medium-gray mt-1">
                  Modify the input content
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingInput(null)
                  setEditInputContent('')
                }}
                className="text-medium-gray hover:text-secondary-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 mb-6">
              <label className="block text-body-sm text-secondary-white mb-2">
                Content
              </label>
              <textarea
                value={editInputContent}
                onChange={(e) => setEditInputContent(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingInput(null)
                  setEditInputContent('')
                }}
                className="btn-secondary flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInputEdit}
                className="btn-primary flex-1 py-3"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

