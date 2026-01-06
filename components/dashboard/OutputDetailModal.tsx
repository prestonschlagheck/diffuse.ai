'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils/format'
import type { DiffuseProjectOutput } from '@/types/database'

interface OutputDetailModalProps {
  output: DiffuseProjectOutput
  onClose: () => void
  onUpdate?: () => void
  onDelete?: (id: string) => Promise<void>
  canEdit?: boolean
  canDelete?: boolean
}

interface StructuredArticle {
  title: string
  author: string
  subtitle?: string | null
  excerpt: string
  content: string
  suggested_sections?: string[]
  category?: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
}

export default function OutputDetailModal({ 
  output, 
  onClose, 
  onUpdate,
  onDelete,
  canEdit = true,
  canDelete = true
}: OutputDetailModalProps) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [article, setArticle] = useState<StructuredArticle | null>(null)
  const [rawContent, setRawContent] = useState(output.content)
  const supabase = createClient()

  const showDeleteButton = canDelete && onDelete

  // Try to parse structured content
  useEffect(() => {
    const parseContent = (content: string): StructuredArticle | null => {
      try {
        let parsed = content
        
        // If content is a string, try to parse it
        if (typeof content === 'string') {
          // Handle double-encoded JSON (string within string)
          let jsonString = content.trim()
          
          // Try parsing directly first
          try {
            parsed = JSON.parse(jsonString)
          } catch {
            // If that fails, check if it's double-encoded
            if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
              try {
                jsonString = JSON.parse(jsonString) // Unwrap the outer quotes
                parsed = JSON.parse(jsonString)
              } catch {
                return null
              }
            } else {
              return null
            }
          }
        }
        
        // Verify it has the expected structure
        if (parsed && typeof parsed === 'object' && (parsed.title || parsed.content)) {
          return {
          ...parsed,
          author: parsed.author || 'Diffuse.AI',
          // Clean up any escaped newlines in content
          content: parsed.content?.replace(/\\n/g, '\n') || '',
          excerpt: parsed.excerpt?.replace(/\\n/g, '\n') || '',
            subtitle: parsed.subtitle?.replace(/\\n/g, '\n') || null,
          }
        }
        
        return null
      } catch {
        return null
      }
    }
    
    const parsedArticle = parseContent(output.content)
    setArticle(parsedArticle)
  }, [output.content])

  const handleSave = async () => {
    setSaving(true)
    try {
      const contentToSave = article ? JSON.stringify(article) : rawContent
      
      const { error: updateError } = await supabase
        .from('diffuse_project_outputs')
        .update({
          content: contentToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', output.id)

      if (updateError) throw updateError

      if (onUpdate) onUpdate()
      onClose()
    } catch (error) {
      console.error('Error saving output:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Are you sure you want to delete this output?')) return
    setDeleting(true)
    try {
      await onDelete(output.id)
      onClose()
    } catch (error) {
      console.error('Error deleting output:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleCopyAll = async () => {
    if (article) {
      // Copy structured article with clean formatting
      const sections = [
        article.title && `${article.title}`,
        article.subtitle && `${article.subtitle}`,
        article.author && `By ${article.author}`,
        article.excerpt && `${article.excerpt}`,
        article.content && `${article.content}`,
        article.category && `Category: ${article.category}`,
        article.suggested_sections?.length && `Sections: ${article.suggested_sections.join(', ')}`,
        article.tags?.length && `Tags: ${article.tags.join(', ')}`,
        article.meta_title && `Meta Title: ${article.meta_title}`,
        article.meta_description && `Meta Description: ${article.meta_description}`,
      ].filter(Boolean)

      const allContent = sections.join('\n\n')
      handleCopy(allContent, 'all')
      return
    }

    // Try to extract and format from raw content
    try {
      const extractField = (json: string, field: string): string | null => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\"[^"]*)*)"`, 's')
        const match = json.match(regex)
        if (match) {
          return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        }
        return null
      }
      
      const title = extractField(rawContent, 'title')
      const subtitle = extractField(rawContent, 'subtitle')
      const excerpt = extractField(rawContent, 'excerpt')
      const content = extractField(rawContent, 'content')
      const category = extractField(rawContent, 'category')
      const metaTitle = extractField(rawContent, 'meta_title')
      const metaDesc = extractField(rawContent, 'meta_description')

    const sections = [
        title,
        subtitle,
        excerpt,
        content,
        category && `Category: ${category}`,
        metaTitle && `Meta Title: ${metaTitle}`,
        metaDesc && `Meta Description: ${metaDesc}`,
    ].filter(Boolean)

      if (sections.length >= 2) {
        handleCopy(sections.join('\n\n'), 'all')
        return
      }
    } catch {
      // Fall through to raw copy
    }
    
    // Fallback: copy raw content
    handleCopy(rawContent, 'all')
  }

  const updateArticleField = (field: keyof StructuredArticle, value: any) => {
    if (article) {
      setArticle({ ...article, [field]: value })
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'text-pale-blue',
    processing: 'text-cosmic-orange',
    completed: 'text-green-400',
    failed: 'text-red-400',
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1.5 text-medium-gray hover:text-cosmic-orange hover:bg-cosmic-orange/10 rounded transition-colors"
      title="Copy"
    >
      {copied === field ? (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )

  const EditableField = ({ 
    label, 
    field, 
    value, 
    multiline = false,
    rows = 3,
    charLimit,
    autoExpand = false,
  }: { 
    label: string
    field: string
    value: string
    multiline?: boolean
    rows?: number
    charLimit?: number
    autoExpand?: boolean
  }) => {
    // Calculate dynamic rows based on content for auto-expand
    const calculateRows = (text: string) => {
      if (!text) return rows
      const lineBreaks = (text.match(/\n/g) || []).length + 1
      const estimatedWrappedLines = Math.ceil(text.length / 80) // Rough estimate for line wrapping
      return Math.max(rows, lineBreaks, estimatedWrappedLines)
    }

    return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-caption text-medium-gray uppercase tracking-wider">
          {label}
          {charLimit && <span className="text-medium-gray/60 ml-1">({value?.length || 0}/{charLimit})</span>}
        </label>
        <CopyButton text={value || ''} field={field} />
      </div>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={(e) => updateArticleField(field as keyof StructuredArticle, e.target.value)}
            rows={autoExpand ? calculateRows(value) : rows}
          readOnly={!canEdit}
          className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm transition-colors resize-none ${
            canEdit 
              ? 'focus:outline-none focus:border-cosmic-orange' 
              : 'cursor-default opacity-75'
          }`}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => updateArticleField(field as keyof StructuredArticle, e.target.value)}
          readOnly={!canEdit}
          className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md transition-colors ${
            canEdit 
              ? 'focus:outline-none focus:border-cosmic-orange' 
              : 'cursor-default opacity-75'
          }`}
        />
      )}
    </div>
  )
  }

  const TagsField = ({ 
    label, 
    field, 
    values,
    color = 'bg-white/10 text-secondary-white'
  }: { 
    label: string
    field: string
    values: string[]
    color?: string
  }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-caption text-medium-gray uppercase tracking-wider">{label}</label>
        <CopyButton text={values?.join(', ') || ''} field={field} />
      </div>
      <div className="flex flex-wrap gap-2">
        {values?.map((item, i) => (
          <span key={i} className={`px-3 py-1 ${color} text-caption rounded-full`}>
            {item}
          </span>
        ))}
        {(!values || values.length === 0) && (
          <span className="text-caption text-medium-gray">None</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="glass-container p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-heading-lg text-secondary-white">Output Details</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Copy All Button */}
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 text-medium-gray hover:text-cosmic-orange hover:bg-cosmic-orange/10 rounded-glass transition-colors"
              title="Copy all fields"
            >
              {copied === 'all' ? (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              <span className="text-caption font-medium tracking-wider">
                {copied === 'all' ? 'COPIED' : 'COPY ALL'}
              </span>
            </button>
            {/* Delete Button */}
            {showDeleteButton && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-medium-gray hover:text-red-400 hover:bg-red-500/10 rounded-glass transition-colors disabled:opacity-50"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-medium-gray hover:text-secondary-white hover:bg-white/10 rounded-glass transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-body-sm text-medium-gray mb-6 flex-shrink-0">
          <span className={`uppercase font-medium tracking-wider ${statusColors[output.workflow_status]}`}>
            {output.workflow_status.toUpperCase()}
          </span>
          <span>•</span>
          <span>{formatDateTime(output.created_at)}</span>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
        {article ? (
          /* Structured Article View */
          <div className="space-y-5">
            {/* Title */}
            <EditableField label="Title" field="title" value={article.title} />

            {/* Author */}
            <EditableField label="Author" field="author" value={article.author} />

            {/* Subtitle */}
            <EditableField label="Subtitle" field="subtitle" value={article.subtitle || ''} />

            {/* Excerpt */}
            <EditableField label="Excerpt" field="excerpt" value={article.excerpt} multiline rows={3} />

            {/* Content */}
            <EditableField label="Article Content" field="content" value={article.content} multiline rows={3} autoExpand />

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-caption text-medium-gray uppercase tracking-wider">Category</label>
                  <CopyButton text={article.category || ''} field="category" />
                </div>
                <input
                  type="text"
                  value={article.category || ''}
                  onChange={(e) => updateArticleField('category', e.target.value)}
                  readOnly={!canEdit}
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md transition-colors ${
                    canEdit 
                      ? 'focus:outline-none focus:border-cosmic-orange' 
                      : 'cursor-default opacity-75'
                  }`}
                />
              </div>

              {/* Suggested Sections */}
              <TagsField 
                label="Suggested Sections" 
                field="sections" 
                values={article.suggested_sections || []} 
                color="bg-pale-blue/20 text-pale-blue"
              />

            {/* Tags */}
            <TagsField 
              label="Tags" 
              field="tags" 
              values={article.tags || []} 
            />

            {/* SEO Section */}
            <div className="pt-4 border-t border-white/10 space-y-5">
              <h3 className="text-body-md text-secondary-white font-medium">SEO Settings</h3>
              
              <EditableField 
                label="Meta Title" 
                field="meta_title" 
                value={article.meta_title || ''} 
                charLimit={60}
              />
              
              <EditableField 
                label="Meta Description" 
                field="meta_description" 
                value={article.meta_description || ''} 
                multiline 
                rows={2}
                charLimit={160}
              />
            </div>
          </div>
        ) : (
          /* Raw Content View (fallback) - Try to extract fields from JSON-like content */
          <div className="space-y-5">
            {(() => {
              // Try to extract fields even if formal parsing failed
              try {
                const extractField = (json: string, field: string): string | null => {
                  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*(?:\\\\"[^"]*)*)"`, 's')
                  const match = json.match(regex)
                  if (match) {
                    return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
                  }
                  return null
                }

                // Extract array fields like tags and suggested_sections
                const extractArrayField = (json: string, field: string): string[] => {
                  const regex = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)\\]`, 's')
                  const match = json.match(regex)
                  if (match) {
                    const arrayContent = match[1]
                    const items = arrayContent.match(/"([^"]*)"/g)
                    if (items) {
                      return items.map(item => item.replace(/"/g, ''))
                    }
                  }
                  return []
                }
                
                // Main content fields
                const mainFields = [
                  { key: 'title', label: 'Title', multiline: false, autoExpand: false },
                  { key: 'subtitle', label: 'Subtitle', multiline: false, autoExpand: false },
                  { key: 'excerpt', label: 'Excerpt', multiline: true, rows: 3, autoExpand: false },
                  { key: 'content', label: 'Article Content', multiline: true, rows: 3, autoExpand: true },
                  { key: 'category', label: 'Category', multiline: false, autoExpand: false },
                ]

                // SEO fields (displayed after sections/tags)
                const seoFields = [
                  { key: 'meta_title', label: 'Meta Title', multiline: false, autoExpand: false },
                  { key: 'meta_description', label: 'Meta Description', multiline: true, rows: 2, autoExpand: false },
                ]

                // Helper to calculate rows for auto-expand
                const calcRows = (text: string, baseRows: number) => {
                  if (!text) return baseRows
                  const lineBreaks = (text.match(/\n/g) || []).length + 1
                  const estimatedWrappedLines = Math.ceil(text.length / 80)
                  return Math.max(baseRows, lineBreaks, estimatedWrappedLines)
                }
                
                const extractedMainFields = mainFields.map(f => ({
                  ...f,
                  value: extractField(rawContent, f.key)
                })).filter(f => f.value)

                const extractedSeoFields = seoFields.map(f => ({
                  ...f,
                  value: extractField(rawContent, f.key)
                })).filter(f => f.value)

                // Extract array fields
                const suggestedSections = extractArrayField(rawContent, 'suggested_sections')
                const tags = extractArrayField(rawContent, 'tags')

                // Helper to render a field
                const renderField = (f: { key: string; label: string; value?: string | null; multiline: boolean; rows?: number; autoExpand: boolean }) => (
                  <div key={f.key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-caption text-medium-gray uppercase tracking-wider">{f.label}</label>
                      <CopyButton text={f.value || ''} field={f.key} />
                    </div>
                    {f.multiline ? (
                      <textarea
                        value={f.value || ''}
                        readOnly
                        rows={f.autoExpand ? calcRows(f.value || '', f.rows || 3) : f.rows}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm resize-none cursor-default opacity-75"
                      />
                    ) : (
                      <input
                        type="text"
                        value={f.value || ''}
                        readOnly
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-md cursor-default opacity-75"
                      />
                    )}
                  </div>
                )
                
                // If we extracted at least 2 fields, show them individually
                if (extractedMainFields.length >= 2) {
                  return (
                    <>
                      {/* Main fields: Title, Subtitle, Excerpt, Content, Category */}
                      {extractedMainFields.map(renderField)}

                      {/* Suggested Sections - right after category */}
                      {suggestedSections.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-caption text-medium-gray uppercase tracking-wider">Suggested Sections</label>
                            <CopyButton text={suggestedSections.join(', ')} field="sections" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestedSections.map((section, i) => (
                              <span key={i} className="px-3 py-1 bg-pale-blue/20 text-pale-blue text-caption rounded-full">
                                {section}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags - after sections */}
                      {tags.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-caption text-medium-gray uppercase tracking-wider">Tags</label>
                            <CopyButton text={tags.join(', ')} field="tags" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                              <span key={i} className="px-3 py-1 bg-white/10 text-secondary-white text-caption rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SEO fields: Meta Title, Meta Description */}
                      {extractedSeoFields.length > 0 && (
                        <div className="pt-4 border-t border-white/10 space-y-5">
                          <h3 className="text-body-md text-secondary-white font-medium">SEO Settings</h3>
                          {extractedSeoFields.map(renderField)}
                        </div>
                      )}
                    </>
                  )
                }
              } catch {
                // Fall through to raw view
              }
              
              // Ultimate fallback: show raw content
              return (
            <div>
              <div className="flex items-center justify-between mb-2">
                    <label className="text-caption text-medium-gray uppercase tracking-wider">Raw Content</label>
                <CopyButton text={rawContent} field="raw" />
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                rows={15}
                readOnly={!canEdit}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-glass text-secondary-white text-body-sm transition-colors resize-none ${
                  canEdit 
                    ? 'focus:outline-none focus:border-cosmic-orange' 
                    : 'cursor-default opacity-75'
                }`}
              />
            </div>
              )
            })()}
          </div>
        )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="btn-secondary flex-1 py-3"
            disabled={saving}
          >
            Close
          </button>
          {canEdit && (
            <button 
              onClick={handleSave} 
              className="btn-primary flex-1 py-3 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
