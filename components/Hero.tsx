'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

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
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
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
      <div className="relative z-10 container-padding w-full">
        <div className="max-w-7xl mx-auto relative min-h-[600px] md:min-h-[700px] flex items-center">
          {/* Large Figure Image - Overlapping */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-full lg:w-[60%] max-w-4xl z-0 pointer-events-none"
          >
            <div className="relative w-full aspect-square">
              <Image
                src="/figure.png"
                alt="Diffuse AI Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>

          {/* Content - Layered on top */}
          <div className="relative z-10 w-full">
            {/* Center-aligned Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-display-sm md:text-display-md lg:text-display-lg font-bold mb-8 text-center w-full"
            >
              Reviving <span className="gradient-text">Local News</span>
              <br />
              Through Smart Automation
            </motion.h1>

            {/* Right-aligned Content */}
            <div className="lg:ml-auto lg:max-w-xl mx-auto lg:mr-0">
              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-body-md md:text-body-lg text-medium-gray mb-10 text-center lg:text-left"
              >
                API-driven automation that transforms local meetings into news articles—no human intervention required. 
                Built for scalable, tech-first journalism.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
              >
                <button className="btn-primary text-body-md w-full sm:w-auto">
                  Schedule a Demo
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

