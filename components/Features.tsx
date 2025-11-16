'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import FeaturesMarquee from './FeaturesMarquee'

const features = [
  {
    title: 'Advanced Transcription',
    description: 'Crystal-clear transcription with speaker identification, timestamps, and context awareness.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    title: 'Smart Summarization',
    description: 'AI-powered extraction of key decisions, votes, and discussion points that matter most.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Editorial Logic',
    description: 'Trained on journalistic standards to maintain factual accuracy and proper news structure.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    title: 'Quote Extraction',
    description: 'Automatically identifies and formats important quotes from officials and community members.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    title: 'Multi-Format Output',
    description: 'Generate articles, summaries, social posts, and newsletters from a single source.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Seamless editor workflow for review, refinement, and approval before publication.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'API Integration',
    description: 'Plug into your existing CMS, publishing platform, or custom workflow with our API.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Process multiple meetings simultaneously across different communities and jurisdictions.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
]

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" ref={ref} className="relative py-16 md:py-20 scroll-mt-20">
      <div className="container-padding">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="text-cosmic-orange text-caption uppercase tracking-wider font-semibold mb-3 block">
              Capabilities
            </span>
            <h2 className="text-heading-xl font-bold mb-4">
              Powerful <span className="gradient-text">AI Features</span>
            </h2>
            <p className="text-body-md text-medium-gray">
              Enterprise-grade NLP with API-accessible integration
            </p>
          </motion.div>

          {/* Features Marquee */}
          <FeaturesMarquee />

          {/* Enterprise Integration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <div className="glass-container p-8 md:p-10">
              <h3 className="text-heading-xl font-bold mb-4 text-center">
                Integrate with Your Workflow
              </h3>
              <p className="text-body-md text-medium-gray mb-8 text-center">
                Seamless API integration with WordPress, CMS, and publishing platforms
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="glass-container-sm overflow-hidden">
                  <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                    <h4 className="text-body-md font-bold text-black">OpenAI API Usage</h4>
                  </div>
                  <div className="p-5">
                    <p className="text-body-sm text-medium-gray text-center">Top-tier language models with custom integration</p>
                  </div>
                </div>
                <div className="glass-container-sm overflow-hidden">
                  <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                    <h4 className="text-body-md font-bold text-black">OpenAI API</h4>
                  </div>
                  <div className="p-5">
                    <p className="text-body-sm text-medium-gray text-center">Top-tier model</p>
                  </div>
                </div>
                <div className="glass-container-sm overflow-hidden">
                  <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                    <h4 className="text-body-md font-bold text-black">Custom Solutions</h4>
                  </div>
                  <div className="p-5">
                    <p className="text-body-sm text-medium-gray text-center">Tailored integrations for your workflow</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-body-md text-secondary-white mb-5">
                  Ready to automate your newsroom? Let&apos;s discuss how Diffuse.AI fits your workflow.
                </p>
                <div className="flex justify-center">
                  <button className="btn-primary px-6 py-3 text-body-sm">
                    Schedule Integration Call
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/4 right-0 w-1/4 h-1/4 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-dusty-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

