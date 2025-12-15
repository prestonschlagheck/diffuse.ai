'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import FeaturesMarquee from './FeaturesMarquee'

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="features" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20">
      <div className="container-padding">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-10 md:mb-12 px-4"
          >
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              Powerful <span className="gradient-text">AI Features</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray">
              Enterprise-grade NLP with seamless integration
            </p>
          </motion.div>

          {/* Features Marquee */}
          <FeaturesMarquee />
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/4 right-0 w-1/4 h-1/4 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-dusty-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}
