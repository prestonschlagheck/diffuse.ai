'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

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
    description: 'Diffuse AI uses advanced transcription and natural language processing to understand context, decisions, and key quotes.',
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

const StepCard = ({ step, index, scrollYProgress }: { step: typeof steps[0], index: number, scrollYProgress: any }) => {
  const opacity = useTransform(
    scrollYProgress,
    [
      (index * 0.2) + 0.1,
      (index * 0.2) + 0.3,
      (index * 0.2) + 0.5,
      (index * 0.2) + 0.7,
    ],
    [0, 1, 1, 0]
  )
  
  const scale = useTransform(
    scrollYProgress,
    [
      (index * 0.2) + 0.1,
      (index * 0.2) + 0.3,
      (index * 0.2) + 0.5,
      (index * 0.2) + 0.7,
    ],
    [0.8, 1, 1, 0.8]
  )

  return (
    <motion.div
      style={{
        opacity,
        scale,
        position: 'absolute' as const,
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="glass-container p-10 md:p-14 max-w-3xl w-full">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          {/* Number & Icon */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-7xl md:text-8xl font-bold text-cosmic-orange/40">
              {step.number}
            </div>
            <div className="w-20 h-20 rounded-glass bg-cosmic-orange/20 flex items-center justify-center text-cosmic-orange">
              {step.icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-display-sm md:text-display-md font-bold mb-4 gradient-text">
              {step.title}
            </h3>
            <p className="text-body-lg text-medium-gray leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function HowItWorksScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  return (
    <div ref={containerRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="container-padding w-full">
          <div className="max-w-4xl mx-auto relative h-full">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
