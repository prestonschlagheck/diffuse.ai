'use client'

import { useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      execCommand('createLink', url)
    }
  }

  return (
    <div className="glass-container p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 pb-3 mb-3 border-b border-white/10">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Bullet List"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Numbered List"
        >
          ≣
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={insertLink}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white"
          title="Insert Link"
        >
          🔗
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h1')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white text-sm"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'h2')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white text-sm"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => execCommand('formatBlock', 'p')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white text-sm"
          title="Paragraph"
        >
          P
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-1" />
        
        <button
          type="button"
          onClick={() => execCommand('removeFormat')}
          className="p-2 rounded hover:bg-white/10 transition-colors text-secondary-white text-sm"
          title="Clear Formatting"
        >
          ✕
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
        className={`min-h-[200px] p-4 bg-white/5 rounded-glass text-secondary-white text-body-md focus:outline-none transition-colors ${
          isFocused ? 'ring-2 ring-cosmic-orange' : ''
        }`}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      />
      
      {!value && !isFocused && placeholder && (
        <div className="pointer-events-none absolute top-[88px] left-8 text-medium-gray text-body-md">
          {placeholder}
        </div>
      )}
    </div>
  )
}

