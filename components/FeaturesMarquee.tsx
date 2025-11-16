'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'

const features = [
  {
    title: 'Advanced Transcription',
    description: 'Speaker ID, timestamps, context awareness',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    title: 'Smart Summarization',
    description: 'Key decisions, votes, discussion points',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    ),
  },
  {
    title: 'Editorial Logic',
    description: 'Journalistic standards, factual accuracy',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: 'Quote Extraction',
    description: 'Auto-identify important quotes',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 11V9a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z" />
        <path d="M18 11V9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z" />
        <path d="M12 16v-4" />
      </svg>
    ),
  },
  {
    title: 'Multi-Format Output',
    description: 'Articles, summaries, social posts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Editor workflow for review',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
      </svg>
    ),
  },
  {
    title: 'OpenAPI Generation',
    description: 'CMS, publishing platforms',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Multiple meetings simultaneously',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
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
            key={`feature-${index}`}
            className="glass-container flex-shrink-0 w-80 overflow-hidden group hover:bg-white/10 transition-colors duration-300"
          >
            <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
              <h3 className="text-body-md font-bold text-black">
                {feature.title}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

