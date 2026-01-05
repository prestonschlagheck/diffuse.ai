'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const articles = [
  {
    headline: "Council Approves $2.3M Budget for Road Repairs",
    subtitle: "Infrastructure improvements to begin next month across township",
    body: "The township council unanimously approved a $2.3 million budget allocation for road repairs during Tuesday's meeting. The funding will address critical infrastructure needs..."
  },
  {
    headline: "School Board Votes to Extend Summer Programs",
    subtitle: "Extended learning opportunities will benefit over 500 students",
    body: "In a 6-1 vote, the school board approved extending summer educational programs through August. The decision comes after positive feedback from parents and strong student participation..."
  },
  {
    headline: "Fire Department Receives New Emergency Equipment",
    subtitle: "State grant funds advanced rescue tools and safety gear",
    body: "The volunteer fire department received $150,000 in new emergency equipment, funded by a state safety grant. Fire Chief Michael Roberts said the equipment will significantly improve response capabilities..."
  },
  {
    headline: "Parks Committee Announces Summer Concert Series",
    subtitle: "Free outdoor concerts to take place every Friday evening",
    body: "The Parks and Recreation Committee unveiled plans for a summer concert series featuring local musicians. Events will take place at Central Park starting June 2nd, with performances scheduled every Friday evening..."
  },
]

const SoundwaveToText = () => {
  const [currentArticle, setCurrentArticle] = useState(0)
  const [displayedHeadline, setDisplayedHeadline] = useState('')
  const [displayedSubtitle, setDisplayedSubtitle] = useState('')
  const [displayedBody, setDisplayedBody] = useState('')
  const [typingStage, setTypingStage] = useState<'headline' | 'subtitle' | 'author' | 'body' | 'complete' | 'fadeout'>('headline')
  const [phase, setPhase] = useState<'recording-transcribing' | 'processing' | 'typing'>('recording-transcribing')
  
  const currentArticleData = articles[currentArticle]

  useEffect(() => {
    let headlineInterval: NodeJS.Timeout
    let subtitleInterval: NodeJS.Timeout
    let bodyInterval: NodeJS.Timeout
    let headlineCharIndex = 0
    let subtitleCharIndex = 0
    let bodyCharIndex = 0

    setDisplayedHeadline('')
    setDisplayedSubtitle('')
    setDisplayedBody('')
    setTypingStage('headline')
    setPhase('recording-transcribing')

    const recordingTranscribingTimer = setTimeout(() => setPhase('processing'), 4000)
    
    const processingTimer = setTimeout(() => {
      setPhase('typing')
      setTypingStage('headline')
      
      // Type headline
      headlineInterval = setInterval(() => {
        if (headlineCharIndex < currentArticleData.headline.length) {
          setDisplayedHeadline(currentArticleData.headline.slice(0, headlineCharIndex + 1))
          headlineCharIndex++
        } else {
          clearInterval(headlineInterval)
          // Short pause then start subtitle
          setTimeout(() => {
            setTypingStage('subtitle')
            subtitleInterval = setInterval(() => {
              if (subtitleCharIndex < currentArticleData.subtitle.length) {
                setDisplayedSubtitle(currentArticleData.subtitle.slice(0, subtitleCharIndex + 1))
                subtitleCharIndex++
              } else {
                clearInterval(subtitleInterval)
                // Show author, then start body
                setTimeout(() => {
                  setTypingStage('author')
                  setTimeout(() => {
                    setTypingStage('body')
                    
                    // Find first two sentences for a full line
                    const firstPeriod = currentArticleData.body.indexOf('. ')
                    const secondPeriod = firstPeriod > 0 ? currentArticleData.body.indexOf('. ', firstPeriod + 2) : -1
                    const targetLength = secondPeriod > 0 ? secondPeriod + 1 : (firstPeriod > 0 ? firstPeriod + 1 : currentArticleData.body.length)
                    const textToType = currentArticleData.body.slice(0, targetLength)
                    
                    // Start fade at 70% through typing (while still typing)
                    const fadePoint = Math.floor(textToType.length * 0.7)
                    
                    bodyInterval = setInterval(() => {
                      if (bodyCharIndex < textToType.length) {
                        setDisplayedBody(textToType.slice(0, bodyCharIndex + 1))
                        bodyCharIndex++
                        
                        // Trigger fade while still typing
                        if (bodyCharIndex === fadePoint) {
                          setTypingStage('fadeout')
                        }
                      } else {
                        clearInterval(bodyInterval)
                        setTypingStage('complete')
                      }
                    }, 25)
                  }, 300)
                }, 200)
              }
            }, 35)
          }, 300)
        }
      }, 40)
    }, 5500)

    // Calculate timing for next article based on first sentence only
    const firstSentenceEnd = currentArticleData.body.indexOf('. ') + 1
    const firstSentence = firstSentenceEnd > 0 
      ? currentArticleData.body.slice(0, firstSentenceEnd)
      : currentArticleData.body
    
    const nextArticle = setTimeout(() => {
      setCurrentArticle((prev) => (prev + 1) % articles.length)
    }, 5500 + (currentArticleData.headline.length * 40) + 300 + (currentArticleData.subtitle.length * 35) + 500 + 100 + 1200)

    return () => {
      clearTimeout(recordingTranscribingTimer)
      clearTimeout(processingTimer)
      clearTimeout(nextArticle)
      clearInterval(headlineInterval)
      clearInterval(subtitleInterval)
      clearInterval(bodyInterval)
    }
  }, [currentArticle, currentArticleData.headline, currentArticleData.subtitle, currentArticleData.body])

  const showAudioLabel = phase === 'recording-transcribing'
  const showProcessingLabel = phase === 'processing'
  const showArticleLabel = phase === 'typing'

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-cosmic-orange/15 rounded-full blur-[100px] md:blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-36 md:w-48 h-36 md:h-48 bg-rich-orange/10 rounded-full blur-[80px] md:blur-[100px] -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Header text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8 md:mb-10 px-4 md:px-8"
        >
          <h1 className="text-3xl sm:text-4xl md:text-display-md lg:text-display-lg font-bold mb-4 md:mb-5 leading-tight">
            Reviving Local News Through{' '}
            <span className="gradient-text">Smart Automation</span>
          </h1>
          <p className="text-base sm:text-lg md:text-body-lg text-medium-gray max-w-2xl mx-auto">
            AI-driven workflow that transforms meeting recordings into publication-ready journalism
          </p>
        </motion.div>

        {/* Workflow visualization */}
        <div className="relative glass-container p-6 sm:p-8 md:p-10 mx-4 md:mx-8">
          {/* Fixed label at top */}
          <div className="text-center mb-6 md:mb-8 h-5">
            <AnimatePresence mode="wait">
              {showAudioLabel && (
                <motion.span
                  key="audio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cosmic-orange text-xs sm:text-sm md:text-sm uppercase tracking-widest font-semibold"
                >
                  Audio Input
                </motion.span>
              )}
              {showProcessingLabel && (
                <motion.span
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cosmic-orange text-xs sm:text-sm md:text-sm uppercase tracking-widest font-semibold"
                >
                  Processing
                </motion.span>
              )}
              {showArticleLabel && (
                <motion.span
                  key="article"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-cosmic-orange text-xs sm:text-sm md:text-sm uppercase tracking-widest font-semibold"
                >
                  Generated Article
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Content area with fixed height - increased for 2 lines of body text */}
          <div className="min-h-[220px] sm:min-h-[240px] md:min-h-[260px] flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {/* Phase 1: Recording + Transcribing (Simultaneous) */}
              {phase === 'recording-transcribing' && (
                <motion.div
                  key="recording-transcribing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4 sm:px-6"
                >
                  {/* Recording - Soundwaves */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xl">
                    <div className="h-4 sm:h-5 md:h-6 flex items-center justify-center">
                      <span className="text-medium-gray text-xs sm:text-sm md:text-base font-medium">
                        Recording
                      </span>
                    </div>
                    <div className="flex items-center gap-[2px] sm:gap-[3px] md:gap-1 w-full h-12">
                      {[...Array(48)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 min-w-[2px] sm:min-w-[3px] md:min-w-[4px] bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
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
                  </div>

                  {/* Transcribing - Flickering Lines */}
                  <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xl">
                    <div className="h-4 sm:h-5 md:h-6 flex items-center justify-center">
                      <span className="text-medium-gray text-xs sm:text-sm md:text-base font-medium">
                        Transcribing...
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            opacity: [0.1, 0.6, 0.1],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                          className="h-2 bg-medium-gray/30 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase 2: Processing */}
              {phase === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-medium-gray text-sm sm:text-base md:text-lg font-medium">
                      Analyzing & structuring
                    </span>
                    <div className="flex gap-1 sm:gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-medium-gray"
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

              {/* Phase 3: Typing Article */}
              {phase === 'typing' && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: typingStage === 'fadeout' ? 0 : 1,
                    scale: typingStage === 'fadeout' ? 0.95 : 1
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: typingStage === 'fadeout' ? 1.5 : 0.3 }}
                  className="absolute inset-0 flex items-start justify-center px-4 sm:px-6 py-2 overflow-hidden"
                >
                  <div className="w-full max-w-2xl text-left space-y-2 sm:space-y-3">
                    {/* Headline */}
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                      <span className="text-cosmic-orange">
                        {displayedHeadline}
                        {typingStage === 'headline' && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-5 sm:h-6 bg-cosmic-orange ml-1 align-middle"
                          />
                        )}
                      </span>
                    </h2>

                    {/* Subtitle */}
                    {(typingStage === 'subtitle' || typingStage === 'author' || typingStage === 'body' || typingStage === 'complete' || typingStage === 'fadeout') && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm sm:text-base md:text-lg text-medium-gray italic"
                      >
                        {displayedSubtitle}
                        {typingStage === 'subtitle' && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-4 sm:h-5 bg-medium-gray ml-1 align-middle"
                          />
                        )}
                      </motion.p>
                    )}

                    {/* Author */}
                    {(typingStage === 'author' || typingStage === 'body' || typingStage === 'complete' || typingStage === 'fadeout') && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs sm:text-sm text-medium-gray/70 uppercase tracking-wider pt-1 border-t border-white/10"
                      >
                        Written by Diffuse.AI
                      </motion.p>
                    )}

                    {/* Body */}
                    {(typingStage === 'body' || typingStage === 'complete' || typingStage === 'fadeout') && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs sm:text-sm md:text-base text-secondary-white leading-relaxed pt-2 min-h-[3rem] sm:min-h-[3.5rem]"
                      >
                        {displayedBody}
                        {typingStage === 'body' && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-0.5 h-3 sm:h-4 bg-secondary-white ml-1 align-middle"
                          />
                        )}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6 md:mt-8">
            {articles.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentArticle ? 'bg-cosmic-orange w-8' : 'bg-white/20 w-1.5'
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
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mt-8 mx-4 md:mx-8"
        >
          <a href="#overview" className="btn-primary text-center text-sm sm:text-base py-3 md:py-4 px-6 md:px-8 w-full sm:w-auto">
            Learn More
          </a>
          <a href="#why-diffuse" className="btn-secondary text-center text-sm sm:text-base py-3 md:py-4 px-6 md:px-8 w-full sm:w-auto">
            Why Diffuse?
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 md:pt-28 pb-12 md:pb-16">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Workflow Animation */}
      <div className="relative z-10 container-padding w-full">
        <SoundwaveToText />
      </div>
    </section>
  )
}
