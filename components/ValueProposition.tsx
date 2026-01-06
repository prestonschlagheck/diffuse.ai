'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function ValueProposition() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section id="value" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20 bg-dark-gray/30">
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
              The Bottom Line
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              Finally, <span className="gradient-text">Sustainable Local Journalism</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-3xl mx-auto">
              Traditional reporting models are broken. Diffuse makes local news coverage economically viable again.
            </p>
          </motion.div>

          {/* ROI Comparison Cards */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Without Diffuse */}
            <div className="glass-container p-6 md:p-8 border-red-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-secondary-white">Traditional Approach</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Time per article</span>
                  <span className="text-red-400 font-semibold">4-6 hours</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Cost per article</span>
                  <span className="text-red-400 font-semibold">$150-300</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Meetings covered/week</span>
                  <span className="text-red-400 font-semibold">2-3 max</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-medium-gray">Sustainable?</span>
                  <span className="text-red-400 font-semibold">Rarely</span>
                </div>
              </div>
            </div>

            {/* With Diffuse */}
            <div className="glass-container p-6 md:p-8 border-cosmic-orange/30 bg-cosmic-orange/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-cosmic-orange/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-secondary-white">With Diffuse.AI</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Time per article</span>
                  <span className="text-cosmic-orange font-semibold">10-15 minutes</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Cost per article</span>
                  <span className="text-cosmic-orange font-semibold">$5-15</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-medium-gray">Meetings covered/week</span>
                  <span className="text-cosmic-orange font-semibold">Unlimited</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-medium-gray">Sustainable?</span>
                  <span className="text-cosmic-orange font-semibold">Absolutely</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            {[
              { number: '90%', label: 'Cost Reduction' },
              { number: '95%', label: 'Time Saved' },
              { number: '24/7', label: 'Availability' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                className="glass-container p-4 md:p-6 text-center group cursor-default"
              >
                <div className="text-xl sm:text-2xl md:text-heading-lg lg:text-display-sm font-bold gradient-text mb-1">
                  {stat.number}
                </div>
                <div className="text-[10px] sm:text-xs md:text-caption text-medium-gray uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 right-0 w-1/4 h-1/4 bg-dusty-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

