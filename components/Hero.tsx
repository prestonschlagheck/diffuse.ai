'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Animated soundwave that morphs into text
const SoundwaveToText = () => {
  const [phase, setPhase] = useState<'wave' | 'morphing' | 'text'>('wave')
  const [currentHeadline, setCurrentHeadline] = useState(0)
  
  const headlines = [
    "Council Approves $2.3M Budget for Road Repairs",
    "School Board Votes to Extend Summer Programs",
    "Township Planning Commission Reviews Zoning Changes",
  ]

  useEffect(() => {
    const cycleAnimation = () => {
      // Show wave
      setPhase('wave')
      
      // Start morphing after 2s
      setTimeout(() => setPhase('morphing'), 2000)
      
      // Show text after 2.5s
      setTimeout(() => setPhase('text'), 2500)
      
      // Reset and change headline after 5s
      setTimeout(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlines.length)
      }, 5000)
    }

    cycleAnimation()
    const interval = setInterval(cycleAnimation, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-48 md:w-64 h-48 md:h-64 bg-cosmic-orange/15 rounded-full blur-[100px] md:blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/3 w-36 md:w-48 h-36 md:h-48 bg-rich-orange/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 md:px-8">
        {/* Header text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-2xl sm:text-3xl md:text-display-md font-bold mb-3 md:mb-4 leading-tight">
            Reviving Local News Through{' '}
            <span className="gradient-text">Smart Automation</span>
          </h1>
          <p className="text-body-sm md:text-body-lg text-medium-gray max-w-2xl mx-auto px-2">
            AI-driven workflow that transforms meeting recordings into publication-ready journalism
          </p>
        </motion.div>

        {/* Transformation visualization - FIXED HEIGHT */}
        <div className="relative glass-container p-6 md:p-10 h-[220px] md:h-[260px] flex flex-col">
          {/* Animation container - fixed height with flex grow */}
          <div className="flex-1 flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {/* Soundwave Phase */}
              {phase === 'wave' && (
                <motion.div
                  key="wave"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center justify-center gap-[5px]">
                    {[...Array(48)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] md:w-1 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                        style={{ height: 8 }}
                        animate={{
                          height: [8, 20 + (i % 5) * 15, 8],
                        }}
                        transition={{
                          duration: 0.5 + (i % 3) * 0.2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          delay: i * 0.015,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Morphing Phase - bars collapse into a line */}
              {phase === 'morphing' && (
                <motion.div
                  key="morphing"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    className="flex items-center gap-[5px]"
                    animate={{ 
                      scaleX: [1, 0.5, 0.1],
                      opacity: [1, 0.8, 0]
                    }}
                    transition={{ duration: 0.4, ease: 'easeIn' }}
                  >
                    {[...Array(48)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] md:w-1 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                        animate={{ height: [40, 4] }}
                        transition={{ duration: 0.3, delay: i * 0.006 }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Text Phase - headline appears */}
              {phase === 'text' && (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 md:px-4"
                >
                  <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 24 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="h-0.5 bg-cosmic-orange hidden sm:block"
                    />
                    <span className="text-cosmic-orange text-[10px] md:text-caption uppercase tracking-wider font-semibold">
                      Generated Article
                    </span>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 24 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="h-0.5 bg-cosmic-orange hidden sm:block"
                    />
                  </div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-lg sm:text-xl md:text-heading-xl font-bold text-secondary-white leading-tight max-w-lg"
                  >
                    {headlines[currentHeadline]}
                  </motion.h3>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="mt-3 md:mt-4 flex items-center justify-center gap-2 text-medium-gray text-[11px] md:text-body-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>Generated in 4.2 seconds</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress indicator dots - fixed at bottom */}
          <div className="flex justify-center gap-2 pt-4">
            {headlines.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentHeadline ? 'bg-cosmic-orange w-6' : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-6 md:mt-8 px-4"
        >
          <a href="#overview" className="btn-primary text-center text-sm md:text-base py-3 md:py-4">
            Learn More
          </a>
          <a href="#process" className="btn-secondary text-center text-sm md:text-base py-3 md:py-4">
            See How It Works
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 md:pt-20 pb-8 md:pb-10">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Soundwave to Text Animation */}
      <div className="relative z-10 container-padding w-full">
        <SoundwaveToText />
      </div>
    </section>
  )
}
