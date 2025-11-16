'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      
      {/* Gradient Orbs - Subtle */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pale-blue/10 rounded-full blur-[120px]"
        animate={{
          x: mousePosition.x * -0.01,
          y: mousePosition.y * -0.01,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      />

      {/* Content */}
      <div className="relative z-10 container-padding text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-display-sm md:text-display-md lg:text-display-lg font-bold mb-6 max-w-4xl mx-auto"
          >
            Reviving <span className="gradient-text">Local News</span>
            <br />
            Through Smart Automation
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-body-md md:text-body-lg text-medium-gray mb-10 max-w-2xl mx-auto"
          >
            API-driven automation that transforms local meetings into news articles—no human intervention required. 
            Built for scalable, tech-first journalism.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button className="btn-primary text-body-md w-full sm:w-auto">
              Schedule a Demo
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

