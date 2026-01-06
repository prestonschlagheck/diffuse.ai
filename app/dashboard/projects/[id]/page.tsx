'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatDuration } from '@/lib/utils/format'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/dashboard/LoadingSpinner'
import EmptyState from '@/components/dashboard/EmptyState'
import InputDetailModal from '@/components/dashboard/InputDetailModal'
import OutputDetailModal from '@/components/dashboard/OutputDetailModal'
import SelectRecordingModal from '@/components/dashboard/SelectRecordingModal'
import { addRecentProject } from '@/components/dashboard/DashboardNav'
import type { DiffuseProject, DiffuseProjectInput, DiffuseProjectOutput, ProjectVisibility, UserRole } from '@/types/database'

// Role hierarchy for permissions
const roleHierarchy = ['viewer', 'editor', 'admin', 'owner'] as const
const getRoleLevel = (role: string) => roleHierarchy.indexOf(role as typeof roleHierarchy[number])

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, workspaces } = useAuth()
  const projectId = params.id as string

  // Get initial tab from URL query parameter
  const tabParam = searchParams.get('tab')
  const initialTab = (tabParam === 'inputs' || tabParam === 'outputs' || tabParam === 'visibility' || tabParam === 'trash') 
    ? tabParam 
    : 'inputs'

  const [project, setProject] = useState<DiffuseProject | null>(null)
  const [inputs, setInputs] = useState<DiffuseProjectInput[]>([])
  const [trashedInputs, setTrashedInputs] = useState<DiffuseProjectInput[]>([])
  const [outputs, setOutputs] = useState<DiffuseProjectOutput[]>([])
  const [trashedOutputs, setTrashedOutputs] = useState<DiffuseProjectOutput[]>([])
  const [activeTab, setActiveTab] = useState<'inputs' | 'outputs' | 'visibility' | 'trash'>(initialTab)
  const [loading, setLoading] = useState(true)
  const [selectedInput, setSelectedInput] = useState<DiffuseProjectInput | null>(null)
  const [selectedOutput, setSelectedOutput] = useState<DiffuseProjectOutput | null>(null)
  const [showRecordingModal, setShowRecordingModal] = useState(false)
  const [showTextInputModal, setShowTextInputModal] = useState(false)
  const [textInputContent, setTextInputContent] = useState('')
  const [textInputTitle, setTextInputTitle] = useState('')
  const [savingTextInput, setSavingTextInput] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')
  const [editProjectDescription, setEditProjectDescription] = useState('')
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([])
  const [savingVisibility, setSavingVisibility] = useState(false)
  const [userProjectRole, setUserProjectRole] = useState<string>('viewer')
  const [generatingArticle, setGeneratingArticle] = useState(false)
  const [showProjectSettings, setShowProjectSettings] = useState(false)
  const [deletingAllInputs, setDeletingAllInputs] = useState(false)
  const [deletingAllOutputs, setDeletingAllOutputs] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const supabase = createClient()

  // Permission helpers
  const isProjectOwner = project?.created_by === user?.id
  const canEdit = isProjectOwner || getRoleLevel(userProjectRole) >= getRoleLevel('editor')
  const canDelete = isProjectOwner || getRoleLevel(userProjectRole) >= getRoleLevel('admin')

  // Helper to extract article info from output content
  const getOutputInfo = (output: DiffuseProjectOutput) => {
    // Helper to extract field from JSON-like string using regex
    const extractField = (content: string, field: string): string | null => {
      const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\"[^"]*)*)"`, 's')
      const match = content.match(regex)
      if (match) {
        return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
      }
      return null
    }

    try {
      // First try standard JSON parsing
      let parsed = output.content
      if (typeof output.content === 'string') {
        const trimmed = output.content.trim()
        try {
          parsed = JSON.parse(trimmed)
        } catch {
          // If parsing fails, check for double-encoded JSON
          if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            try {
              const unwrapped = JSON.parse(trimmed)
              parsed = JSON.parse(unwrapped)
            } catch {
              // Fall through to regex extraction
            }
          }
        }
      }

      // If we got a parsed object with expected fields
      if (parsed && typeof parsed === 'object' && (parsed.title || parsed.content)) {
        return {
          title: parsed.title || 'Untitled Article',
          subtitle: parsed.subtitle || null,
          author: parsed.author || 'Diffuse.AI',
          excerpt: parsed.excerpt || null,
        }
      }
    } catch {
      // Fall through to regex extraction
    }

    // Fallback: try regex extraction for JSON-like content
    const title = extractField(output.content, 'title')
    const subtitle = extractField(output.content, 'subtitle')
    const author = extractField(output.content, 'author')
    const excerpt = extractField(output.content, 'excerpt')

    if (title) {
      return {
        title,
        subtitle,
        author: author || 'Diffuse.AI',
        excerpt,
      }
    }

    // Ultimate fallback
    return {
      title: 'Untitled Article',
      subtitle: null,
      author: 'Diffuse.AI',
      excerpt: null,
    }
  }

  // Helper to truncate text
  const truncateText = (text: string | null, maxLength: number): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

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

      // Determine user's role for this project
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        // If user created the project, they are the owner
        if (projectData.created_by === currentUser.id) {
          setUserProjectRole('owner')
        } else if (projectData.visible_to_orgs && projectData.visible_to_orgs.length > 0) {
          // Check user's role in the organizations this project is shared with
          // Get the highest role the user has across all orgs the project is shared with
          let highestRole = 'viewer'
          for (const orgId of projectData.visible_to_orgs) {
            // Check if user is the org owner
            const { data: orgData } = await supabase
              .from('diffuse_workspaces')
              .select('owner_id')
              .eq('id', orgId)
              .single()
            
            if (orgData?.owner_id === currentUser.id) {
              highestRole = 'owner'
              break
            }
            
            // Check user's member role
            const { data: memberData } = await supabase
              .from('diffuse_workspace_members')
              .select('role')
              .eq('workspace_id', orgId)
              .eq('user_id', currentUser.id)
              .single()
            
            if (memberData && getRoleLevel(memberData.role) > getRoleLevel(highestRole)) {
              highestRole = memberData.role
            }
          }
          setUserProjectRole(highestRole)
        } else {
          setUserProjectRole('viewer')
        }
      }

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

      // Fetch active outputs (not deleted)
      const { data: outputsData, error: outputsError } = await supabase
        .from('diffuse_project_outputs')
        .select('*')
        .eq('project_id', projectId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (outputsError) throw outputsError
      setOutputs(outputsData || [])

      // Fetch trashed outputs
      const { data: trashedOutputsData, error: trashedOutputsError } = await supabase
        .from('diffuse_project_outputs')
        .select('*')
        .eq('project_id', projectId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

      if (!trashedOutputsError) {
        setTrashedOutputs(trashedOutputsData || [])
      }
    } catch (error) {
      console.error('Error fetching project data:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId, supabase])

  useEffect(() => {
    fetchProjectData()
  }, [fetchProjectData])

  // Sync active tab with URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'inputs' || tabParam === 'outputs' || tabParam === 'visibility' || tabParam === 'trash') {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Track recent project view
  useEffect(() => {
    if (project) {
      addRecentProject({ id: project.id, name: project.name })
    }
  }, [project])

  // Filter selectedOrgs to only include organizations the user is still a member of
  useEffect(() => {
    if (workspaces && selectedOrgs.length > 0) {
      const currentOrgIds = workspaces.map(({ workspace }) => workspace.id)
      const validSelectedOrgs = selectedOrgs.filter(orgId => currentOrgIds.includes(orgId))
      
      // Only update if there's a difference (user left an org)
      if (validSelectedOrgs.length !== selectedOrgs.length) {
        setSelectedOrgs(validSelectedOrgs)
        
        // If no valid orgs left, switch to private
        if (validSelectedOrgs.length === 0 && visibility === 'public') {
          setVisibility('private')
        }
      }
    }
  }, [workspaces, selectedOrgs, visibility])

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

  const handlePermanentDeleteInput = async (inputId: string) => {
    if (!confirm('Are you sure you want to permanently delete this input? This cannot be undone.')) return
    
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .delete()
        .eq('id', inputId)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error permanently deleting input:', error)
      alert('Failed to delete input')
    }
  }

  const handlePermanentDeleteOutput = async (outputId: string) => {
    if (!confirm('Are you sure you want to permanently delete this output? This cannot be undone.')) return
    
    try {
      const { error } = await supabase
        .from('diffuse_project_outputs')
        .delete()
        .eq('id', outputId)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error permanently deleting output:', error)
      alert('Failed to delete output')
    }
  }

  const handleSaveInput = async (inputId: string, title: string, content: string) => {
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .update({ 
          file_name: title || null,
          content: content 
        })
        .eq('id', inputId)

      if (error) throw error
      
      setSelectedInput(null)
      fetchProjectData()
    } catch (error) {
      console.error('Error saving input:', error)
      alert('Failed to save input')
      throw error
    }
  }

  const handleDeleteInputFromModal = async (inputId: string) => {
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
      throw error
    }
  }

  const handleDeleteOutput = async (outputId: string) => {
    try {
      const { error } = await supabase
        .from('diffuse_project_outputs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', outputId)

      if (error) throw error

      fetchProjectData()
    } catch (error) {
      console.error('Error deleting output:', error)
      alert('Failed to delete output')
      throw error
    }
  }

  const handleDeleteAllInputs = async () => {
    if (!confirm('Are you sure you want to delete ALL inputs? This action cannot be undone.')) return
    
    setDeletingAllInputs(true)
    try {
      const { error } = await supabase
        .from('diffuse_project_inputs')
        .delete()
        .eq('project_id', projectId)

      if (error) throw error

      fetchProjectData()
      setShowProjectSettings(false)
    } catch (error) {
      console.error('Error deleting all inputs:', error)
      alert('Failed to delete inputs')
    } finally {
      setDeletingAllInputs(false)
    }
  }

  const handleDeleteAllOutputs = async () => {
    if (!confirm('Are you sure you want to delete ALL outputs? This action cannot be undone.')) return
    
    setDeletingAllOutputs(true)
    try {
      const { error } = await supabase
        .from('diffuse_project_outputs')
        .delete()
        .eq('project_id', projectId)

      if (error) throw error

      fetchProjectData()
      setShowProjectSettings(false)
    } catch (error) {
      console.error('Error deleting all outputs:', error)
      alert('Failed to delete outputs')
    } finally {
      setDeletingAllOutputs(false)
    }
  }

  const handleDeleteProject = async () => {
    if (deleteConfirmText !== 'DELETE') return
    
    setDeletingProject(true)
    try {
      // Delete inputs first
      const { error: inputsError } = await supabase
        .from('diffuse_project_inputs')
        .delete()
        .eq('project_id', projectId)

      if (inputsError) {
        console.error('Error deleting inputs:', inputsError)
        throw new Error(`Failed to delete inputs: ${inputsError.message}`)
      }

      // Delete outputs
      const { error: outputsError } = await supabase
        .from('diffuse_project_outputs')
        .delete()
        .eq('project_id', projectId)

      if (outputsError) {
        console.error('Error deleting outputs:', outputsError)
        throw new Error(`Failed to delete outputs: ${outputsError.message}`)
      }

      // Delete the project
      const { error: projectError } = await supabase
        .from('diffuse_projects')
        .delete()
        .eq('id', projectId)

      if (projectError) {
        console.error('Error deleting project:', projectError)
        throw new Error(`Failed to delete project: ${projectError.message}`)
      }

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error deleting project:', error)
      alert(error.message || 'Failed to delete project. Check console for details.')
      setDeletingProject(false)
    }
  }


  const handleRestoreOutput = async (outputId: string) => {
    try {
      const { error } = await supabase
        .from('diffuse_project_outputs')
        .update({ deleted_at: null })
        .eq('id', outputId)

      if (error) throw error
      fetchProjectData()
    } catch (error) {
      console.error('Error restoring output:', error)
      alert('Failed to restore output')
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

  const handleGenerateArticle = async () => {
    if (inputs.length === 0) {
      alert('Please add at least one input before generating an article')
      return
    }

    setGeneratingArticle(true)
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate article')
      }

      // Refresh data to show new output
      fetchProjectData()
      // Switch to outputs tab to show the result
      setActiveTab('outputs')
    } catch (error) {
      console.error('Error generating article:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate article')
    } finally {
      setGeneratingArticle(false)
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
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-medium-gray hover:text-secondary-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-display-sm text-secondary-white">{project.name}</h1>
            {project.description && (
              <p className="text-body-lg text-medium-gray mt-1">{project.description}</p>
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
          Inputs<span className="hidden md:inline"> ({inputs.length})</span>
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
          Outputs<span className="hidden md:inline"> ({outputs.length})</span>
          {activeTab === 'outputs' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
          )}
        </button>
        {/* Visibility tab - only visible to project owner */}
        {isProjectOwner && (
        <button
          onClick={() => setActiveTab('visibility')}
          className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
            activeTab === 'visibility'
              ? 'text-cosmic-orange'
              : 'text-secondary-white hover:text-white'
          }`}
        >
          Visibility<span className="hidden md:inline"> ({visibility === 'public' ? selectedOrgs.length : 0})</span>
          {activeTab === 'visibility' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
          )}
        </button>
        )}
        {(trashedInputs.length > 0 || trashedOutputs.length > 0) && (
          <button
            onClick={() => setActiveTab('trash')}
            className={`pb-3 px-4 text-body-md font-medium transition-colors relative ${
              activeTab === 'trash'
                ? 'text-cosmic-orange'
                : 'text-secondary-white hover:text-white'
            }`}
          >
            Trash<span className="hidden md:inline"> ({trashedInputs.length + trashedOutputs.length})</span>
            {activeTab === 'trash' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cosmic-orange" />
            )}
          </button>
        )}
      </div>

      {/* Inputs Tab */}
      {activeTab === 'inputs' && (
        <div>
          {/* Add Input Buttons - Only visible to editors and above */}
          {canEdit && (
          <div className="flex flex-col md:flex-row md:justify-end gap-3 mb-4">
            <button
              onClick={() => {
                setEditProjectName(project?.name || '')
                setEditProjectDescription(project?.description || '')
                setShowProjectSettings(true)
              }}
              className="btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-body-sm w-full md:w-auto"
              title="Project Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button
              onClick={() => setShowTextInputModal(true)}
              className="btn-secondary px-4 py-2 flex items-center justify-center gap-2 text-body-sm w-full md:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Add Text Input
            </button>
            <button
              onClick={() => setShowRecordingModal(true)}
              className="btn-primary px-4 py-2 flex items-center justify-center gap-2 text-body-sm w-full md:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Add from Recordings
            </button>
          </div>
          )}

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
              description="Add recordings or text as inputs to generate your article."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputs.map((input) => {
                const isFromRecording = input.metadata?.source === 'recording'
                
                return (
                  <div
                    key={input.id}
                    onClick={() => setSelectedInput(input)}
                    className="glass-container p-6 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* Title */}
                    <h3 className="text-heading-md text-secondary-white font-medium mb-2 truncate">
                      {input.file_name || (isFromRecording ? 'Recording' : 'Text Input')}
                    </h3>
                    
                    {/* Content Preview */}
                    {input.content && (
                      <p className="text-body-sm text-secondary-white/70 mb-3 line-clamp-2">
                        {input.content}
                      </p>
                    )}
                    
                    {/* Details */}
                    <div className="space-y-2">
                      {/* Type */}
                      <div className="text-caption text-purple-400 uppercase tracking-wider">
                        {isFromRecording ? (
                          <>
                            RECORDING
                            {input.metadata?.recording_duration && (
                              <>
                                <span className="text-medium-gray"> • </span>
                                <span className="text-cosmic-orange">{formatDuration(input.metadata.recording_duration)}</span>
                              </>
                            )}
                          </>
                        ) : 'TEXT'}
                        </div>
                      
                      {/* Date */}
                      <div className="text-caption text-medium-gray uppercase tracking-wider">
                        {new Date(input.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </div>
                    </div>
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
          {/* Generate Button - Same position as Inputs buttons */}
          {canEdit && inputs.length > 0 && (
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={handleGenerateArticle}
                disabled={generatingArticle || outputs.length > 0}
                className={`px-4 py-2 flex items-center gap-2 text-body-sm rounded-glass transition-colors ${
                  outputs.length > 0
                    ? 'bg-white/5 border border-white/10 text-medium-gray cursor-not-allowed'
                    : generatingArticle
                    ? 'btn-primary opacity-50 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {generatingArticle ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating
                  </>
                ) : outputs.length > 0 ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Generated with diffuse.ai
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate with diffuse.ai
                  </>
                )}
              </button>
            </div>
          )}

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
              description={inputs.length === 0 
                ? "Add inputs before generating your article." 
                : "Click 'Generate with diffuse.ai' above to create an article from your inputs."
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outputs.map((output) => {
                const info = getOutputInfo(output)
                return (
                  <div
                    key={output.id}
                    onClick={() => setSelectedOutput(output)}
                    className="glass-container p-6 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {/* 1. Title */}
                    <h3 className="text-heading-md text-secondary-white font-medium mb-2">
                      {info.title}
                    </h3>
                    
                    {/* 2. Subtitle - all caps */}
                    {info.subtitle && (
                      <p className="text-caption text-purple-400 uppercase tracking-wider mb-2">
                        {info.subtitle.toUpperCase()}
                      </p>
                    )}
                    
                    {/* 3. Author & Date - all caps */}
                    <div className="text-caption uppercase tracking-wider mb-3">
                      <span className="text-cosmic-orange">{info.author.toUpperCase()}</span>
                      <span className="text-medium-gray"> • </span>
                      <span className="text-medium-gray">
                        {new Date(output.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                    
                    {/* 4. Excerpt/Text - Two lines, all caps */}
                    {info.excerpt && (
                      <p className="text-caption text-medium-gray uppercase tracking-wider leading-relaxed line-clamp-2">
                        {info.excerpt.toUpperCase()}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Visibility Tab */}
      {activeTab === 'visibility' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Private Option - Left Side */}
              <button
                onClick={() => {
                  setVisibility('private')
                  setSelectedOrgs([])
                }}
              className={`glass-container p-6 flex flex-col items-center justify-center text-center transition-colors min-h-[200px] ${
                  visibility === 'private' 
                  ? 'bg-cosmic-orange/20 border-cosmic-orange/30' 
                  : 'hover:bg-white/10'
                }`}
              >
              <h3 className={`text-heading-lg font-medium mb-2 ${visibility === 'private' ? 'text-cosmic-orange' : 'text-secondary-white'}`}>
                  Private
              </h3>
              <p className="text-caption text-medium-gray uppercase tracking-wider">
                ONLY YOU CAN ACCESS
              </p>
                {visibility === 'private' && (
                <div className="mt-4">
                  <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                )}
              </button>

            {/* Organization Options - Right Side */}
            {workspaces.length > 0 ? (
              <div className="flex flex-col gap-2">
                  {workspaces.map(({ workspace }) => {
                    const isSelected = selectedOrgs.includes(workspace.id)
                    return (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          if (isSelected) {
                            const newOrgs = selectedOrgs.filter(id => id !== workspace.id)
                            setSelectedOrgs(newOrgs)
                            if (newOrgs.length === 0) {
                              setVisibility('private')
                            }
                          } else {
                            setVisibility('public')
                            setSelectedOrgs([...selectedOrgs, workspace.id])
                          }
                        }}
                      className={`glass-container p-4 flex items-center justify-between transition-colors flex-1 ${
                          isSelected 
                          ? 'bg-cosmic-orange/20 border-cosmic-orange/30' 
                          : 'hover:bg-white/10'
                        }`}
                      >
                        <span className={`text-body-md font-medium ${isSelected ? 'text-cosmic-orange' : 'text-secondary-white'}`}>
                          {workspace.name}
                        </span>
                        {isSelected && (
                        <svg className="w-5 h-5 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
            </div>
            ) : (
              <div className="glass-container p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <p className="text-body-md text-medium-gray">
                  Join an organization to share projects
                </p>
              </div>
            )}
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
        <div className="space-y-8">
          {/* Trashed Inputs */}
          {trashedInputs.length > 0 && (
            <div>
              <h3 className="text-body-md text-medium-gray uppercase tracking-wider mb-4">
                Trashed Inputs ({trashedInputs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trashedInputs.map((input) => {
                  const isFromRecording = input.metadata?.source === 'recording'
                  
                  return (
                    <div
                      key={input.id}
                      className="glass-container p-6 opacity-60"
                    >
                      {/* Title */}
                      <h3 className="text-heading-md text-secondary-white font-medium mb-2 truncate">
                        {input.file_name || (isFromRecording ? 'Recording' : 'Text Input')}
                      </h3>
                      
                      {/* Content Preview */}
                      {input.content && (
                        <p className="text-body-sm text-secondary-white/70 mb-3 line-clamp-2">
                          {input.content}
                        </p>
                      )}
                      
                      {/* Details */}
                      <div className="space-y-2">
                        {/* Type */}
                        <div className="text-caption text-purple-400 uppercase tracking-wider">
                          {isFromRecording ? (
                            <>
                              RECORDING
                              {input.metadata?.recording_duration && (
                                <>
                                  <span className="text-medium-gray"> • </span>
                                  <span className="text-cosmic-orange">{formatDuration(input.metadata.recording_duration)}</span>
                                </>
                              )}
                            </>
                          ) : 'TEXT'}
                        </div>
                        
                        {/* Deleted Date */}
                        <div className="text-caption text-medium-gray uppercase tracking-wider">
                          DELETED {new Date(input.deleted_at || input.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </div>
                      </div>
                      
                      {/* Action Buttons - Only for editors and above */}
                      {canEdit && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleRestoreInput(input.id)}
                            className="btn-secondary flex-1 py-2 text-body-sm"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteInput(input.id)}
                            className="flex-1 py-2 text-body-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-glass transition-colors"
                          >
                            Delete Forever
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Trashed Outputs */}
          {trashedOutputs.length > 0 && (
            <div>
              <h3 className="text-body-md text-medium-gray uppercase tracking-wider mb-4">
                Trashed Outputs ({trashedOutputs.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trashedOutputs.map((output) => {
                  const info = getOutputInfo(output)
                  return (
                    <div
                      key={output.id}
                      className="glass-container p-6 opacity-60"
                    >
                      {/* 1. Title */}
                      <h3 className="text-heading-md text-secondary-white font-medium mb-2">
                        {info.title}
                      </h3>
                      
                      {/* 2. Subtitle - all caps */}
                      {info.subtitle && (
                        <p className="text-caption text-purple-400 uppercase tracking-wider mb-2">
                          {info.subtitle.toUpperCase()}
                        </p>
                      )}
                      
                      {/* 3. Author & Deleted Date - all caps */}
                      <div className="text-caption uppercase tracking-wider mb-3">
                        <span className="text-cosmic-orange">{info.author.toUpperCase()}</span>
                        <span className="text-medium-gray"> • </span>
                        <span className="text-medium-gray">
                          DELETED {new Date(output.deleted_at || output.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* 4. Excerpt/Text - Two lines, all caps */}
                      {info.excerpt && (
                        <p className="text-caption text-medium-gray uppercase tracking-wider leading-relaxed line-clamp-2">
                          {info.excerpt.toUpperCase()}
                        </p>
                      )}
                      
                      {/* Action Buttons - Only for editors and above */}
                      {canEdit && (
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleRestoreOutput(output.id)}
                            className="btn-secondary flex-1 py-2 text-body-sm"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handlePermanentDeleteOutput(output.id)}
                            className="flex-1 py-2 text-body-sm bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 rounded-glass transition-colors"
                          >
                            Delete Forever
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state if both are empty (shouldn't happen but just in case) */}
          {trashedInputs.length === 0 && trashedOutputs.length === 0 && (
            <EmptyState
              title="Trash is Empty"
              description="Deleted inputs and outputs will appear here."
            />
          )}
        </div>
      )}

      {/* Modals */}
      {selectedInput && (
        <InputDetailModal 
          input={selectedInput} 
          onClose={() => setSelectedInput(null)}
          onSave={handleSaveInput}
          onDelete={handleDeleteInputFromModal}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
      {selectedOutput && (
        <OutputDetailModal
          output={selectedOutput}
          onClose={() => setSelectedOutput(null)}
          onUpdate={fetchProjectData}
          onDelete={handleDeleteOutput}
          canEdit={canEdit}
          canDelete={canDelete}
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
          <div className="glass-container p-8 max-w-2xl w-full h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h2 className="text-heading-lg text-secondary-white">Add Text Input</h2>
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

            {/* Content */}
            <form onSubmit={handleSaveTextInput} className="flex-1 flex flex-col mt-6 min-h-0">
              {/* Title Input - Fixed */}
              <div className="flex-shrink-0 mb-4">
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
              
              {/* Content Textarea - Scrollable */}
              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-body-sm text-secondary-white mb-2 flex-shrink-0">
                  Content
                </label>
                <textarea
                  value={textInputContent}
                  onChange={(e) => setTextInputContent(e.target.value)}
                  placeholder="Paste or type your text here..."
                  required
                  className="flex-1 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md focus:outline-none focus:border-cosmic-orange transition-colors resize-none overflow-y-auto"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6 flex-shrink-0">
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

      {/* Project Settings Modal */}
      {showProjectSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-container p-6 max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-heading-md text-secondary-white">Project Settings</h2>
              <button
                onClick={() => {
                  setShowProjectSettings(false)
                  setShowDeleteConfirm(false)
                  setDeleteConfirmText('')
                }}
                className="text-medium-gray hover:text-secondary-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-caption text-medium-gray uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                placeholder="Project name"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm focus:outline-none focus:border-cosmic-orange transition-colors"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-caption text-medium-gray uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={editProjectDescription}
                onChange={(e) => setEditProjectDescription(e.target.value)}
                placeholder="Project description (optional)"
                rows={3}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm focus:outline-none focus:border-cosmic-orange transition-colors resize-none"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={async () => {
                if (!editProjectName.trim()) return
                try {
                  const { error } = await supabase
                    .from('diffuse_projects')
                    .update({ 
                      name: editProjectName.trim(),
                      description: editProjectDescription.trim() || null
                    })
                    .eq('id', projectId)
                  if (error) throw error
                  fetchProjectData()
                } catch (error) {
                  console.error('Error updating project:', error)
                  alert('Failed to update project')
                }
              }}
              disabled={!editProjectName.trim()}
              className="btn-primary w-full py-2 text-body-sm disabled:opacity-50 mb-5"
            >
              Save Changes
            </button>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDeleteAllInputs}
                disabled={deletingAllInputs || (inputs.length === 0 && trashedInputs.length === 0)}
                className="p-3 bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/30 rounded-glass transition-colors text-left disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-white/10"
              >
                <p className="text-body-sm text-secondary-white font-medium">Delete Inputs</p>
                <p className="text-caption text-medium-gray">{inputs.length + trashedInputs.length} items</p>
              </button>

              <button
                onClick={handleDeleteAllOutputs}
                disabled={deletingAllOutputs || (outputs.length === 0 && trashedOutputs.length === 0)}
                className="p-3 bg-white/5 hover:bg-yellow-500/10 border border-white/10 hover:border-yellow-500/30 rounded-glass transition-colors text-left disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:border-white/10"
              >
                <p className="text-body-sm text-secondary-white font-medium">Delete Outputs</p>
                <p className="text-caption text-medium-gray">{outputs.length + trashedOutputs.length} items</p>
              </button>

              {canDelete && !showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deletingProject}
                  className="col-span-2 p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 rounded-glass transition-colors text-left disabled:opacity-50"
                >
                  <p className="text-body-sm text-red-400 font-medium">Delete Project</p>
                  <p className="text-caption text-medium-gray">Permanently remove everything</p>
                </button>
              )}

              {canDelete && showDeleteConfirm && (
                <div className="col-span-2 p-3 bg-red-500/10 border border-red-500/30 rounded-glass">
                  <p className="text-body-sm text-red-400 font-medium mb-2">Type &quot;DELETE&quot; to confirm:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                      placeholder="DELETE"
                      className="flex-1 px-3 py-2 bg-white/5 border border-red-500/30 rounded-glass text-secondary-white text-body-sm focus:outline-none focus:border-red-400 transition-colors"
                      autoFocus
                    />
                    <button
                      onClick={handleDeleteProject}
                      disabled={deletingProject || deleteConfirmText !== 'DELETE'}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-glass text-body-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingProject ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                      className="px-3 py-2 text-medium-gray hover:text-secondary-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

