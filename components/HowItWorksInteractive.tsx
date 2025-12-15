'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

const steps = [
  {
    number: 'Step 1',
    title: 'Capture',
    description: 'Record local government meetings, town halls, or community events.',
  },
  {
    number: 'Step 2',
    title: 'Process',
    description: 'Diffuse.AI uses advanced transcription and natural language processing to understand context, decisions, and key quotes.',
  },
  {
    number: 'Step 3',
    title: 'Generate',
    description: 'Our editorial AI logic creates factually accurate, publication-ready news articles in minutes, not hours.',
  },
  {
    number: 'Step 4',
    title: 'Publish',
    description: 'Human editors refine and publish quickly, freeing them to focus on investigative work and community engagement.',
  },
]

export default function HowItWorksInteractive() {
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    // Clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current)
    
    // Auto-advance after 8 seconds
    timerRef.current = setTimeout(() => {
      nextStep()
    }, 8000)
  }

  useEffect(() => {
    resetTimer()
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [currentStep])

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
  }

  const handleManualStepChange = (index: number) => {
    setCurrentStep(index)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-container overflow-hidden">
        {/* Orange Header - Static */}
        <div className="bg-cosmic-orange/90 px-6 py-3">
          <h3 className="text-body-lg font-bold text-center text-black">{steps[currentStep].number}</h3>
        </div>

        {/* Animated Content Area - Fixed height */}
        <div className="min-h-[180px] md:min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="p-6 md:p-8 text-center w-full"
            >
              <h4 className="text-heading-lg md:text-heading-xl font-bold mb-3 md:mb-4 gradient-text">
                {steps[currentStep].title}
              </h4>
              <p className="text-body-sm md:text-body-md text-medium-gray leading-relaxed">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 pb-6 border-t border-white/10 pt-4">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-4 py-2 rounded-glass text-secondary-white hover:text-cosmic-orange transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="text-body-sm font-medium">Previous</span>
          </button>

          {/* Step Indicators */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleManualStepChange(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-cosmic-orange w-8' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 rounded-glass text-secondary-white hover:text-cosmic-orange transition-colors"
          >
            <span className="text-body-sm font-medium">Next</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Progress Bar - Below Navigation */}
        <div className="relative h-2 bg-white/5 overflow-hidden rounded-b-glass">
          <motion.div
            key={`progress-${currentStep}`}
            className="absolute top-0 left-0 h-full bg-cosmic-orange/90"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ 
              duration: 8, 
              ease: 'linear',
              times: [0, 1]
            }}
          />
        </div>
      </div>
    </div>
  )
}
