'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Animated soundwave that transforms into typed text
const SoundwaveToText = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
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
    setIsTyping(true)

    // Start typing after a short delay
    const startDelay = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
          setIsTyping(false)
        }
      }, 40) // Typing speed

      return () => clearInterval(typeInterval)
    }, 500)

    // Move to next headline after display time
    const nextHeadline = setTimeout(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length)
    }, 5000)

    return () => {
      clearTimeout(startDelay)
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
        <div className="relative glass-container p-6 md:p-8 min-h-[280px] md:min-h-[260px]">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center h-full">
            {/* Left side - Soundwave */}
            <div className="flex flex-col items-center">
              <div className="text-cosmic-orange text-[10px] md:text-caption uppercase tracking-wider font-semibold mb-4">
                Audio Input
              </div>
              <div className="flex items-center justify-center gap-[4px] md:gap-[5px] h-20">
                {[...Array(32)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[2px] md:w-[3px] bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                    style={{ height: 8 }}
                    animate={{
                      height: isTyping ? [8, 20 + (i % 5) * 12, 8] : [8, 12, 8],
                    }}
                    transition={{
                      duration: isTyping ? 0.4 + (i % 3) * 0.15 : 1.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.02,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Center arrow - hidden on mobile */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-full bg-cosmic-orange/20 flex items-center justify-center"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>

            {/* Mobile arrow */}
            <div className="flex md:hidden justify-center -my-2">
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-8 h-8 rounded-full bg-cosmic-orange/20 flex items-center justify-center"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange rotate-90">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </div>

            {/* Right side - Typed text */}
            <div className="flex flex-col items-center md:items-start">
              <div className="text-cosmic-orange text-[10px] md:text-caption uppercase tracking-wider font-semibold mb-4 text-center md:text-left">
                Generated Article
              </div>
              <div className="glass-container-sm p-4 md:p-5 w-full min-h-[80px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentHeadline}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm md:text-base font-semibold text-secondary-white leading-relaxed"
                  >
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="inline-block w-0.5 h-4 md:h-5 bg-cosmic-orange ml-0.5 align-middle"
                      />
                    )}
                  </motion.p>
                </AnimatePresence>
              </div>
              {!isTyping && displayedText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 flex items-center gap-2 text-medium-gray text-[10px] md:text-xs"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>Generated in 4.2 seconds</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Progress indicator dots - fixed at bottom */}
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
