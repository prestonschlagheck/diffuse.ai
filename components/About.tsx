'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
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
    <section id="overview" ref={ref} className="relative py-12 md:py-15 scroll-mt-20">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-heading-xl font-bold mb-8"
          >
            The Infrastructure for <span className="gradient-text">Modern Local News</span>
          </motion.h2>

          {/* Main Content Glass Container */}
          <motion.div
            variants={itemVariants}
            className="glass-container p-6 md:p-8 mb-6"
          >
            <p className="text-body-md md:text-body-lg text-secondary-white leading-relaxed mb-4">
              We&apos;re building the <span className="text-cosmic-orange font-semibold">platform</span> that local newsrooms leverage to combine{' '}
              <span className="text-cosmic-orange font-semibold">community reporting</span> with{' '}
              <span className="text-cosmic-orange font-semibold">AI-driven workflows</span>—solving two critical problems 
              facing journalism today.
            </p>
            <p className="text-body-sm md:text-body-md text-medium-gray leading-relaxed">
              The Spring-Ford Press pilot uses our proprietary automation engine to transform meeting recordings 
              into publication-ready articles—enabling efficient, scalable coverage.
            </p>
          </motion.div>

          {/* Problem Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Card 1 */}
            <motion.div
              className="glass-container overflow-hidden"
            >
              <div className="bg-cosmic-orange/90 px-6 py-3 rounded-t-glass">
                <h3 className="text-heading-md font-bold text-center text-black">
                  The Collapse of Local Journalism
                </h3>
              </div>
              <div className="p-6">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  Small towns have lost local news sources, creating information deserts 
                  where community stories go untold.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="glass-container overflow-hidden"
            >
              <div className="bg-cosmic-orange/90 px-6 py-3 rounded-t-glass">
                <h3 className="text-heading-md font-bold text-center text-black">
                  Unsustainable Costs
                </h3>
              </div>
              <div className="p-6">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  Traditional reporting requires significant resources, preventing sustainable coverage 
                  of local government and community events.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { number: '100%', label: 'Automated' },
              { number: '<5min', label: 'Processing' },
              { number: '24/7', label: 'Coverage' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3 }}
                className="glass-container p-4 text-center group cursor-default"
              >
                <div className="text-heading-xl md:text-display-sm font-bold gradient-text mb-1">
                  {stat.number}
                </div>
                <div className="text-caption text-medium-gray uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accent */}
      <div className="absolute top-1/2 left-0 w-1/3 h-1/3 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}
