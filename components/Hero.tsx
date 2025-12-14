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
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cosmic-orange/15 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-rich-orange/10 rounded-full blur-[100px] -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-8">
        {/* Header text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-heading-xl md:text-display-md font-bold mb-4">
            Reviving Local News Through{' '}
            <span className="gradient-text">Smart Automation</span>
          </h1>
          <p className="text-body-md md:text-body-lg text-medium-gray max-w-2xl mx-auto">
            AI-driven workflow that transforms meeting recordings into publication-ready journalism
          </p>
        </motion.div>

        {/* Transformation visualization */}
        <div className="relative glass-container p-8 md:p-12 min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* Soundwave Phase */}
            {phase === 'wave' && (
              <motion.div
                key="wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-1"
              >
                {[...Array(32)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 md:w-2 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                    initial={{ height: 8 }}
                    animate={{
                      height: [8, Math.random() * 80 + 20, 8],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.03,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
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
                className="flex items-center justify-center"
              >
                <motion.div
                  className="flex items-center gap-1"
                  animate={{ 
                    scaleX: [1, 0.5, 0.1],
                    opacity: [1, 0.8, 0]
                  }}
                  transition={{ duration: 0.4, ease: 'easeIn' }}
                >
                  {[...Array(32)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 md:w-2 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                      animate={{ height: [40, 4] }}
                      transition={{ duration: 0.3, delay: i * 0.01 }}
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
                className="text-center px-4"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="h-0.5 bg-cosmic-orange"
                  />
                  <span className="text-cosmic-orange text-caption uppercase tracking-wider font-semibold">
                    Generated Article
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: 40 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="h-0.5 bg-cosmic-orange"
                  />
                </div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="text-heading-lg md:text-heading-xl font-bold text-secondary-white leading-tight"
                >
                  {headlines[currentHeadline]}
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mt-4 flex items-center justify-center gap-2 text-medium-gray text-body-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Generated in 4.2 seconds</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {headlines.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentHeadline ? 'bg-cosmic-orange w-6' : 'bg-white/20'
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
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <a href="#overview" className="btn-primary text-center">
            Learn More
          </a>
          <a href="#process" className="btn-secondary text-center">
            See How It Works
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Soundwave to Text Animation */}
      <div className="relative z-10 container-padding w-full">
        <SoundwaveToText />
      </div>
    </section>
  )
}
