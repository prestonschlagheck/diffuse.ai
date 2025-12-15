'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import HowItWorksInteractive from './HowItWorksInteractive'

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="process" ref={ref} className="relative bg-dark-gray/30 scroll-mt-20 py-16 sm:py-20 md:py-24">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10 md:mb-12 px-4"
          >
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              The Process
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              How <span className="gradient-text">Diffuse.AI</span> Works
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray mb-8">
              AI-driven automated workflow from capture to publication
            </p>
          </motion.div>

          {/* Interactive Steps */}
          <HowItWorksInteractive />
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pale-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}
