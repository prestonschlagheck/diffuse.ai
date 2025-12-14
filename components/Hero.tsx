'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Animated soundwave that transforms into typed text
const SoundwaveToText = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [phase, setPhase] = useState<'wave' | 'thinking' | 'typing'>('wave')
  
  const headlines = [
    "Council Approves $2.3M Budget for Road Repairs",
    "School Board Votes to Extend Summer Programs",
    "Township Planning Commission Reviews Zoning Changes",
    "Fire Department Receives New Emergency Equipment",
    "Parks Committee Announces Summer Concert Series",
  ]

  useEffect(() => {
    const currentText = headlines[currentHeadline]
    let charIndex = 0
    setDisplayedText('')
    setPhase('wave')

    // Phase 1: Wave animation (3 seconds)
    const waveTimer = setTimeout(() => {
      setPhase('thinking')
    }, 3000)

    // Phase 2: Thinking animation (1.5 seconds)
    const thinkingTimer = setTimeout(() => {
      setPhase('typing')
      setDisplayedText('')
      charIndex = 0

      // Phase 3: Typing animation
      const typeInterval = setInterval(() => {
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
        }
      }, 30) // LLM typing speed

      return () => clearInterval(typeInterval)
    }, 4500)

    // Move to next headline after full cycle
    const nextHeadline = setTimeout(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length)
    }, 3000 + 1500 + (currentText.length * 30) + 2000) // wave + thinking + typing + pause

    return () => {
      clearTimeout(waveTimer)
      clearTimeout(thinkingTimer)
      clearTimeout(nextHeadline)
    }
  }, [currentHeadline])

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-cosmic-orange/15 rounded-full blur-[100px] md:blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-36 md:w-48 h-36 md:h-48 bg-rich-orange/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8">
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

        {/* Transformation visualization - Side by side */}
        <div className="relative glass-container p-6 md:p-8">
          {/* Fixed labels row */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 mb-6">
            <div className="text-center">
              <span className="text-cosmic-orange text-[10px] md:text-caption uppercase tracking-wider font-semibold">
                Audio Input
              </span>
            </div>
            <div className="text-center">
              <span className="text-cosmic-orange text-[10px] md:text-caption uppercase tracking-wider font-semibold">
                Generated Article
              </span>
            </div>
          </div>

          {/* Content row - fixed height */}
          <div className="grid grid-cols-2 gap-4 md:gap-8 min-h-[100px] md:min-h-[120px]">
            {/* Left side - Soundwave */}
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center gap-[3px] md:gap-[4px]">
                {[...Array(28)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] md:w-[3px] bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                    style={{ height: 8 }}
                    animate={{
                      height: phase === 'wave' 
                        ? [8, 15 + (i % 6) * 10, 8, 20 + (i % 4) * 8, 8]
                        : phase === 'thinking'
                        ? [8, 12 + (i % 3) * 4, 8]
                        : [8, 6, 8],
                    }}
                    transition={{
                      duration: phase === 'wave' 
                        ? 1.2 + (i % 3) * 0.3
                        : phase === 'thinking'
                        ? 0.8 + (i % 2) * 0.2
                        : 1.5,
                      repeat: Infinity,
                      repeatType: 'loop',
                      delay: i * 0.03,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Text (no container box) */}
            <div className="flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === 'thinking' && (
                  <motion.div
                    key="thinking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-cosmic-orange text-sm md:text-base font-semibold">
                      Thinking
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-cosmic-orange"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {phase === 'typing' && (
                  <motion.p
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs md:text-sm font-semibold text-cosmic-orange leading-relaxed text-center"
                  >
                    {displayedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-3 md:h-4 bg-cosmic-orange ml-0.5 align-middle"
                    />
                  </motion.p>
                )}
                {phase === 'wave' && (
                  <motion.div
                    key="wave"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Fixed progress indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {headlines.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                  index === currentHeadline ? 'bg-cosmic-orange w-5 md:w-6' : 'bg-white/20 w-1.5 md:w-2'
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
