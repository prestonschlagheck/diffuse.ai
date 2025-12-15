'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const SoundwaveToText = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [phase, setPhase] = useState<'listening' | 'recording' | 'transcribing' | 'processing' | 'typing'>('listening')
  
  const headlines = [
    "Council Approves $2.3M Budget for Road Repairs",
    "School Board Votes to Extend Summer Programs",
    "Fire Department Receives New Emergency Equipment",
    "Parks Committee Announces Summer Concert Series",
  ]

  useEffect(() => {
    const currentText = headlines[currentHeadline]
    let charIndex = 0
    setDisplayedText('')
    setPhase('listening')

    const listeningTimer = setTimeout(() => setPhase('recording'), 1500)
    const recordingTimer = setTimeout(() => setPhase('transcribing'), 4000)
    const transcribingTimer = setTimeout(() => setPhase('processing'), 6000)
    const processingTimer = setTimeout(() => {
      setPhase('typing')
      setDisplayedText('')
      charIndex = 0

      const typeInterval = setInterval(() => {
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.slice(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typeInterval)
        }
      }, 30)

      return () => clearInterval(typeInterval)
    }, 7500)

    const nextHeadline = setTimeout(() => {
      setCurrentHeadline((prev) => (prev + 1) % headlines.length)
    }, 7500 + (currentText.length * 30) + 2000)

    return () => {
      clearTimeout(listeningTimer)
      clearTimeout(recordingTimer)
      clearTimeout(transcribingTimer)
      clearTimeout(processingTimer)
      clearTimeout(nextHeadline)
    }
  }, [currentHeadline])

  const showAudioLabel = phase === 'listening' || phase === 'recording'
  const showArticleLabel = phase === 'transcribing' || phase === 'processing' || phase === 'typing'

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

        {/* Workflow visualization */}
        <div className="relative glass-container p-8 md:p-10">
          {/* Static label area - always visible, changes text */}
          <div className="text-center mb-8 h-5">
            <AnimatePresence mode="wait">
              {showAudioLabel && (
                <motion.span
                  key="audio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cosmic-orange text-xs md:text-sm uppercase tracking-widest font-semibold"
                >
                  Audio Input
                </motion.span>
              )}
              {showArticleLabel && (
                <motion.span
                  key="article"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cosmic-orange text-xs md:text-sm uppercase tracking-widest font-semibold"
                >
                  Generated Article
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Content area with fixed height */}
          <div className="min-h-[140px] md:min-h-[160px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {/* Phase 1: Listening */}
              {phase === 'listening' && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-medium-gray text-base md:text-lg font-medium">
                      Listening for audio
                    </span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-medium-gray"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase 2: Recording */}
              {phase === 'recording' && (
                <motion.div
                  key="recording"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                >
                  <span className="text-medium-gray text-sm md:text-base font-medium">
                    Recording
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(32)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-[3px] md:w-1 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                        animate={{
                          height: [4, 12 + (i % 4) * 8, 4],
                        }}
                        transition={{
                          duration: 0.6 + (i % 2) * 0.2,
                          repeat: Infinity,
                          repeatType: 'reverse',
                          delay: i * 0.04,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Phase 3: Transcribing */}
              {phase === 'transcribing' && (
                <motion.div
                  key="transcribing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-medium-gray text-base md:text-lg font-medium">
                      Transcribing
                    </span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-medium-gray"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="overflow-hidden w-full max-w-lg">
                    <motion.div
                      animate={{ x: [-50, -350] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="text-xs md:text-sm text-medium-gray/40 whitespace-nowrap font-mono"
                    >
                      council members discussed budget allocation • positive community feedback • meeting adjourned 9pm
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Phase 4: Processing */}
              {phase === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-medium-gray text-base md:text-lg font-medium">
                      Analyzing & structuring
                    </span>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-medium-gray"
                          animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [1, 1.3, 1],
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
                  </div>
                </motion.div>
              )}

              {/* Phase 5: Typing */}
              {phase === 'typing' && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center px-6"
                >
                  <p className="text-base md:text-lg font-semibold text-cosmic-orange leading-relaxed text-center max-w-2xl">
                    {displayedText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-5 md:h-6 bg-cosmic-orange ml-1 align-middle"
                    />
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {headlines.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentHeadline ? 'bg-cosmic-orange w-8' : 'bg-white/20 w-1.5'
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
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-8"
        >
          <a href="#overview" className="btn-primary text-center text-sm md:text-base py-3 md:py-4 w-full sm:w-auto">
            Learn More
          </a>
          <a href="#process" className="btn-secondary text-center text-sm md:text-base py-3 md:py-4 w-full sm:w-auto">
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

      {/* Workflow Animation */}
      <div className="relative z-10 container-padding w-full">
        <SoundwaveToText />
      </div>
    </section>
  )
}
