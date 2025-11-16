'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    title: 'Advanced Transcription',
    description: 'Speaker ID, timestamps, context awareness',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    title: 'Smart Summarization',
    description: 'Key decisions, votes, discussion points',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Editorial Logic',
    description: 'Journalistic standards, factual accuracy',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: 'Quote Extraction',
    description: 'Auto-identify important quotes',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    title: 'Multi-Format Output',
    description: 'Articles, summaries, social posts',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Editor workflow for review',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'API Integration',
    description: 'CMS, publishing platforms',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Multiple meetings simultaneously',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
]

export default function FeaturesMarquee() {
  const ref = useRef(null)

  // Duplicate features for seamless loop
  const allFeatures = [...features, ...features]

  return (
    <div className="relative overflow-hidden py-12">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Scrolling container */}
      <motion.div
        ref={ref}
        className="flex gap-6"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {allFeatures.map((feature, index) => (
          <div
            key={index}
            className="glass-container p-6 flex-shrink-0 w-80 group hover:bg-white/10 transition-colors duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-glass-sm bg-gradient-to-br from-cosmic-orange/20 to-rich-orange/10 flex items-center justify-center flex-shrink-0 text-cosmic-orange group-hover:from-cosmic-orange/30 group-hover:to-rich-orange/20 transition-all duration-300">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-heading-md font-bold mb-2 group-hover:text-cosmic-orange transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-medium-gray leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

