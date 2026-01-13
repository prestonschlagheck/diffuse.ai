'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Mock news story about Diffuse.AI
const mockArticle = {
  title: "Local Startup Diffuse.AI Revolutionizes How Newsrooms Create Content",
  subtitle: "AI-powered platform cuts article production time by 80%, already adopted by regional publications",
  author: "Diffuse.AI",
  excerpt: "A Philadelphia-based technology startup is transforming the way local newsrooms operate with an innovative AI platform that converts meeting recordings directly into publication-ready articles...",
  content: "A Philadelphia-based technology startup is transforming the way local newsrooms operate with an innovative AI platform that converts meeting recordings directly into publication-ready articles.\n\nDiffuse.AI, founded in 2024, has developed a workflow tool that allows journalists to simply record public meetings, press conferences, and interviews, then automatically generates structured news articles complete with headlines, quotes, and proper formatting."
}

const mockTranscriptLines = [
  "Sarah Chen, Founder: Thanks for having me. We built Diffuse because we saw journalists spending hours on transcription...",
  "...and that's time they could spend actually investigating stories and connecting with their communities.",
  "The response has been incredible. One reporter told us she now covers three times as many meetings.",
  "We're not replacing journalists—we're giving them superpowers. The AI handles the tedious parts.",
]

const mockInputs = [
  { id: 1, title: "Interview - Sarah Chen, Founder", type: "recording", duration: "4:32" },
  { id: 2, title: "Press Release - Series A", type: "document" },
  { id: 3, title: "Product Demo Screenshots", type: "image" },
]

type Phase = 'recording' | 'transcribing' | 'project-inputs' | 'project-outputs' | 'generating' | 'output'

const WorkflowDemo = () => {
  const [phase, setPhase] = useState<Phase>('recording')
  const [recordingTime, setRecordingTime] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptLines, setTranscriptLines] = useState(0)
  const [visibleInputs, setVisibleInputs] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [generateClicked, setGenerateClicked] = useState(false)
  const [typedTitle, setTypedTitle] = useState('')
  const [typedContent, setTypedContent] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(32).fill(0.1))

  // Main animation cycle
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = []
    
    const runCycle = () => {
      // Reset
      setPhase('recording')
      setRecordingTime(0)
      setIsRecording(false)
      setTranscriptLines(0)
      setVisibleInputs(0)
      setShowDropdown(false)
      setGenerateClicked(false)
      setTypedTitle('')
      setTypedContent('')

      // Start recording
      timeouts.push(setTimeout(() => setIsRecording(true), 600))
      
      // Stop recording, start transcribing
      timeouts.push(setTimeout(() => {
        setIsRecording(false)
        setPhase('transcribing')
        setTranscriptLines(1)
      }, 4000))
      
      // Add transcript lines
      timeouts.push(setTimeout(() => setTranscriptLines(2), 4600))
      timeouts.push(setTimeout(() => setTranscriptLines(3), 5200))
      timeouts.push(setTimeout(() => setTranscriptLines(4), 5800))
      
      // Show project with single input (inputs tab)
      timeouts.push(setTimeout(() => {
        setPhase('project-inputs')
        setVisibleInputs(1)
      }, 6800))
      
      // Show dropdown
      timeouts.push(setTimeout(() => setShowDropdown(true), 8000))
      
      // Add document input, hide dropdown
      timeouts.push(setTimeout(() => {
        setShowDropdown(false)
        setVisibleInputs(2)
      }, 9200))
      
      // Show dropdown again
      timeouts.push(setTimeout(() => setShowDropdown(true), 10000))
      
      // Add image input, hide dropdown
      timeouts.push(setTimeout(() => {
        setShowDropdown(false)
        setVisibleInputs(3)
      }, 11200))
      
      // Switch to outputs tab
      timeouts.push(setTimeout(() => setPhase('project-outputs'), 12200))
      
      // Click generate button
      timeouts.push(setTimeout(() => setGenerateClicked(true), 13200))
      
      // Start generating
      timeouts.push(setTimeout(() => setPhase('generating'), 13800))
      
      // Show output
      timeouts.push(setTimeout(() => setPhase('output'), 16300))
      
      // Restart cycle
      timeouts.push(setTimeout(runCycle, 25500))
    }
    
    runCycle()
    return () => timeouts.forEach(clearTimeout)
  }, [])

  // Recording timer
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => setRecordingTime(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [isRecording])

  // Audio visualization
  useEffect(() => {
    if (!isRecording) {
      setAudioLevels(Array(32).fill(0.08))
      return
    }
    const interval = setInterval(() => {
      setAudioLevels(Array(32).fill(0).map(() => 0.1 + Math.random() * 0.9))
    }, 80)
    return () => clearInterval(interval)
  }, [isRecording])

  // Title typing
  useEffect(() => {
    if (phase !== 'output') return
    let i = 0
    const interval = setInterval(() => {
      if (i < mockArticle.title.length) {
        setTypedTitle(mockArticle.title.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [phase])

  // Content typing
  useEffect(() => {
    if (phase !== 'output') return
    const delay = setTimeout(() => {
      let i = 0
      const targetText = mockArticle.excerpt
      const interval = setInterval(() => {
        if (i < targetText.length) {
          setTypedContent(targetText.slice(0, i + 1))
          i++
        } else {
          clearInterval(interval)
        }
      }, 12)
      return () => clearInterval(interval)
    }, mockArticle.title.length * 30 + 200)
    return () => clearTimeout(delay)
  }, [phase])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(c => !c), 500)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-cosmic-orange/15 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-accent-purple/10 rounded-full blur-[80px] -translate-y-1/2" />
      </div>

      {/* Browser Frame */}
      <div className="glass-container overflow-hidden shadow-2xl shadow-black/50">
        {/* Browser Chrome */}
        <div className="flex items-center justify-center px-4 py-3 border-b border-white/10 bg-black/40 relative">
          <div className="absolute left-4 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-sm text-medium-gray font-medium">diffuse.ai</span>
        </div>

        {/* App Content */}
        <div className="h-[380px] md:h-[420px] bg-[#0a0a0a] relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* RECORDING PHASE */}
            {phase === 'recording' && (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                {/* Recording Modal */}
                <div className="glass-container w-full max-w-md p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-medium text-secondary-white">
                      {isRecording ? 'Recording...' : 'New Recording'}
                    </h3>
                    <button className="text-medium-gray">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-col items-center py-4">
                    {/* Mic Button */}
                    <motion.div
                      className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                        isRecording ? 'bg-red-500/20 border-red-500' : 'bg-cosmic-orange/20 border-cosmic-orange'
                      }`}
                      animate={isRecording ? { scale: [1, 1.03, 1] } : {}}
                      transition={{ duration: 0.8, repeat: isRecording ? Infinity : 0 }}
                    >
                      {isRecording ? (
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-2.5 h-2.5 bg-red-500 rounded-full mb-1.5"
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                          <span className="text-xl font-bold text-red-400">{formatTime(recordingTime)}</span>
                        </div>
                      ) : (
                        <svg className="w-10 h-10 text-cosmic-orange" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                        </svg>
                      )}
                    </motion.div>
                    
                    {/* Audio Bars */}
                    <div className="flex items-center gap-[2px] mt-5 h-10 w-full max-w-xs">
                      {audioLevels.map((level, i) => (
                        <motion.div
                          key={i}
                          className={`flex-1 rounded-sm ${isRecording ? 'bg-gradient-to-t from-cosmic-orange to-rich-orange' : 'bg-medium-gray/30'}`}
                          animate={{ height: `${Math.max(3, level * 40)}px` }}
                          transition={{ duration: 0.05 }}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-medium-gray mt-4">
                      {isRecording ? 'Click to stop recording' : 'Click the microphone to start'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TRANSCRIBING PHASE */}
            {phase === 'transcribing' && (
              <motion.div
                key="transcribing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-6"
              >
                <div className="glass-container w-full max-w-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <motion.div
                      className="w-2 h-2 bg-cosmic-orange rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm text-cosmic-orange font-medium">Transcribing audio...</span>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg border border-white/10 p-4 min-h-[180px]">
                    <div className="space-y-2.5">
                      {mockTranscriptLines.slice(0, transcriptLines).map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-secondary-white/80 leading-relaxed"
                        >
                          {line}
                        </motion.p>
                      ))}
                      {transcriptLines < 4 && (
                        <motion.div className="flex gap-1" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
                          <span className="w-1.5 h-1.5 bg-cosmic-orange rounded-full" />
                          <span className="w-1.5 h-1.5 bg-cosmic-orange rounded-full" />
                          <span className="w-1.5 h-1.5 bg-cosmic-orange rounded-full" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROJECT VIEW - INPUTS TAB */}
            {phase === 'project-inputs' && (
              <motion.div
                key="project-inputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-4 md:p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button className="text-medium-gray hover:text-secondary-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-secondary-white">Diffuse.AI Launch Coverage</h2>
                  </div>
                  
                  {/* Add Input Button & Dropdown */}
                  <div className="relative">
                    <button className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 hover:bg-white/20">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Input
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-48 glass-container py-1.5 z-50"
                        >
                          <button className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/10">
                            <svg className="w-4 h-4 text-pale-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs text-secondary-white">Text</span>
                          </button>
                          <button className="w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/10">
                            <svg className="w-4 h-4 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            <span className="text-xs text-secondary-white">Recording</span>
                          </button>
                          <div className="border-t border-white/10 my-1" />
                          <button className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/10 ${visibleInputs === 1 ? 'bg-white/10' : ''}`}>
                            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-secondary-white">Document</span>
                          </button>
                          <button className={`w-full px-3 py-2 flex items-center gap-2.5 text-left hover:bg-white/10 ${visibleInputs === 2 ? 'bg-white/10' : ''}`}>
                            <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-secondary-white">Image</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b border-white/10">
                  <button className="pb-2 text-sm text-cosmic-orange border-b-2 border-cosmic-orange">
                    Inputs ({visibleInputs})
                  </button>
                  <button className="pb-2 text-sm text-medium-gray">Outputs (0)</button>
                </div>
                
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mockInputs.slice(0, visibleInputs).map((input, i) => (
                    <motion.div
                      key={input.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i === 0 ? 0 : 0.1 }}
                      className="glass-container p-4 hover:bg-white/10 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-white/5 ${
                          input.type === 'recording' ? 'text-cosmic-orange' :
                          input.type === 'document' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {input.type === 'recording' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          )}
                          {input.type === 'document' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          {input.type === 'image' && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-secondary-white truncate">{input.title}</h4>
                          <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${
                            input.type === 'recording' ? 'text-cosmic-orange' :
                            input.type === 'document' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {input.type.toUpperCase()}
                            {input.duration && <span className="text-medium-gray"> • {input.duration}</span>}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PROJECT VIEW - OUTPUTS TAB (Empty with Generate Button) */}
            {phase === 'project-outputs' && (
              <motion.div
                key="project-outputs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-4 md:p-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button className="text-medium-gray hover:text-secondary-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-secondary-white">Diffuse.AI Launch Coverage</h2>
                  </div>
                  
                  {/* Generate Button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: generateClicked ? 0.95 : 1
                    }}
                    transition={{ duration: 0.15 }}
                    className={`px-3 py-1.5 bg-gradient-to-r from-cosmic-orange to-rich-orange text-white text-xs font-medium rounded-lg flex items-center gap-1.5 ${generateClicked ? 'ring-2 ring-cosmic-orange ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate with diffuse.ai
                  </motion.button>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b border-white/10">
                  <button className="pb-2 text-sm text-medium-gray">Inputs (3)</button>
                  <button className="pb-2 text-sm text-cosmic-orange border-b-2 border-cosmic-orange">Outputs (0)</button>
                </div>
                
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-medium-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-medium-gray mb-1">No outputs yet</p>
                  <p className="text-xs text-medium-gray/70">Click Generate to create your article</p>
                </div>
              </motion.div>
            )}

            {/* GENERATING PHASE */}
            {phase === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-6"
              >
                <div className="relative mb-5">
                  <motion.div
                    className="w-16 h-16 rounded-full border-2 border-cosmic-orange/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.div
                    className="absolute inset-1 rounded-full border-2 border-t-cosmic-orange border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cosmic-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-base font-medium text-secondary-white mb-3">Generating Article</h3>
                
                <div className="flex flex-col items-center gap-1.5">
                  {['Analyzing inputs...', 'Extracting key quotes...', 'Structuring content...'].map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.7 }}
                    >
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-cosmic-orange"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
                      />
                      <span className="text-xs text-medium-gray">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* OUTPUT PHASE */}
            {phase === 'output' && (
              <motion.div
                key="output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-4 md:p-6 overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <button className="text-medium-gray">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-secondary-white">Diffuse.AI Launch Coverage</h2>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-4 border-b border-white/10">
                  <button className="pb-2 text-sm text-medium-gray">Inputs (3)</button>
                  <button className="pb-2 text-sm text-cosmic-orange border-b-2 border-cosmic-orange">Outputs (1)</button>
                </div>
                
                {/* Article Card */}
                <div className="glass-container p-5 relative">
                  {/* Actions - Top Right */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute top-4 right-4 flex gap-2"
                  >
                    <button className="px-2.5 py-1 bg-cosmic-orange/20 border border-cosmic-orange/30 text-cosmic-orange rounded text-[10px] font-medium">
                      Copy
                    </button>
                    <button className="px-2.5 py-1 bg-white/5 border border-white/10 text-secondary-white rounded text-[10px] font-medium">
                      Edit
                    </button>
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className="text-base md:text-lg font-bold text-secondary-white mb-2 leading-tight min-h-[1.5rem] pr-24">
                    {typedTitle}
                    {typedTitle.length < mockArticle.title.length && showCursor && (
                      <span className="inline-block w-0.5 h-5 bg-secondary-white ml-0.5 align-middle" />
                    )}
                  </h3>
                  
                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: typedTitle.length === mockArticle.title.length ? 1 : 0 }}
                    className="text-xs text-accent-purple italic mb-2"
                  >
                    {mockArticle.subtitle}
                  </motion.p>
                  
                  {/* Meta */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: typedTitle.length === mockArticle.title.length ? 1 : 0 }}
                    className="flex items-center gap-2 text-[10px] text-medium-gray uppercase tracking-wider mb-3 pb-3 border-b border-white/10"
                  >
                    <span className="text-cosmic-orange">By {mockArticle.author}</span>
                    <span>•</span>
                    <span>Just Now</span>
                  </motion.div>
                  
                  {/* Content */}
                  <p className="text-xs text-secondary-white/80 leading-relaxed">
                    {typedContent}
                    {typedContent.length > 0 && typedContent.length < mockArticle.excerpt.length && showCursor && (
                      <span className="inline-block w-0.5 h-3 bg-secondary-white/80 ml-0.5 align-middle" />
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 md:pb-16">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Content */}
      <div className="relative z-10 container-padding w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8 md:mb-10 px-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-display-md lg:text-display-lg font-bold mb-4 leading-tight">
            Turn Meeting Recordings Into{' '}
            <span className="gradient-text">Published Articles</span>
            <br className="hidden sm:block" />
            <span className="text-secondary-white"> in Minutes, Not Hours</span>
          </h1>
          <p className="text-base sm:text-lg md:text-body-lg text-medium-gray max-w-2xl mx-auto">
            AI-powered workflow that transforms audio into publication-ready journalism
          </p>
        </motion.div>

        {/* Workflow Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <WorkflowDemo />
        </motion.div>

        {/* CTA buttons - same width as browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-4xl mx-auto mt-6"
        >
          <div className="flex gap-3">
            <a href="/login" className="btn-secondary text-center text-sm sm:text-base py-3 md:py-4 flex-1">
              Start Free
            </a>
            <a href="#how-it-works" className="btn-secondary text-center text-sm sm:text-base py-3 md:py-4 flex-1">
              See How It Works
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
