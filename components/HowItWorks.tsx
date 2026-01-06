'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    number: '01',
    title: 'Record',
    description: 'Upload any audio or video from meetings, interviews, press conferences, or community events.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Transcribe',
    description: 'AI automatically transcribes with high accuracy, speaker identification, and timestamps.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Generate',
    description: 'Smart AI structures content into publication-ready articles with headlines, quotes, and proper formatting.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Publish',
    description: 'Export, edit if needed, or integrate directly with your CMS for one-click publishing.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <section id="how-it-works" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16 px-4">
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              Simple Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              From Recording to <span className="gradient-text">Published Article</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-2xl mx-auto">
              Four simple steps to transform any meeting or event into professional journalism
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={itemVariants}
                className="glass-container p-6 group hover:bg-white/10 transition-all duration-300"
              >
                {/* Step number */}
                <div className="text-cosmic-orange/30 text-4xl font-bold mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cosmic-orange/20 to-rich-orange/20 flex items-center justify-center text-cosmic-orange mb-4 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold text-secondary-white mb-2">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm md:text-base text-medium-gray leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accent */}
      <div className="absolute top-1/2 right-0 w-1/3 h-1/3 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

