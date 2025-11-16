'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import HowItWorksInteractive from './HowItWorksInteractive'

const steps = [
  {
    number: '01',
    title: 'Capture',
    description: 'Record local government meetings, town halls, or community events using any audio/video device.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Process',
    description: 'Diffuse.AI uses advanced transcription and natural language processing to understand context, decisions, and key quotes.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Generate',
    description: 'Our editorial AI logic creates factually accurate, publication-ready news articles in minutes, not hours.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Publish',
    description: 'Human editors refine and publish quickly, freeing them to focus on investigative work and community engagement.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="process" ref={ref} className="relative bg-dark-gray/30 scroll-mt-20 py-16 md:py-20">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12"
          >
            <span className="text-cosmic-orange text-caption uppercase tracking-wider font-semibold mb-3 block">
              The Process
            </span>
            <h2 className="text-heading-xl font-bold mb-4">
              How <span className="gradient-text">Diffuse.AI</span> Works
            </h2>
            <p className="text-body-md text-medium-gray mb-8">
              API-first automated workflow from capture to publication
            </p>
          </motion.div>

          {/* Interactive Steps */}
          <HowItWorksInteractive />
        </div>
      </div>

      {/* Old Mobile Steps - Keep for reference but hidden */}
      <div className="hidden">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="glass-container p-6 md:p-8 group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Number & Icon */}
                    <div className="flex items-center gap-6 md:min-w-[200px]">
                      <div className="text-6xl md:text-7xl font-bold text-cosmic-orange/20 group-hover:text-cosmic-orange/40 transition-colors duration-300">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 rounded-glass-sm bg-cosmic-orange/10 flex items-center justify-center text-cosmic-orange group-hover:bg-cosmic-orange/20 transition-colors duration-300">
                        {step.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-heading-lg font-bold mb-3 group-hover:text-cosmic-orange transition-colors duration-300">
                        {step.title}
                      </h3>
                      <p className="text-body-md text-medium-gray leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow Icon for Desktop */}
                    {index < steps.length - 1 && (
                      <div className="hidden md:block text-cosmic-orange/30 group-hover:text-cosmic-orange/60 transition-colors duration-300">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 5v14M19 12l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="h-6 w-0.5 bg-gradient-to-b from-cosmic-orange/50 to-transparent mx-auto md:ml-[88px]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pale-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

