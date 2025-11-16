'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const steps = [
  {
    number: '01',
    title: 'Capture',
    description: 'Record local government meetings, town halls, or community events using any audio/video device.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Process',
    description: 'Diffuse AI uses advanced transcription and natural language processing to understand context, decisions, and key quotes.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Generate',
    description: 'Our editorial AI logic creates factually accurate, publication-ready news articles in minutes, not hours.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Publish',
    description: 'Human editors refine and publish quickly, freeing them to focus on investigative work and community engagement.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </svg>
    ),
  },
]

export default function HowItWorksInteractive() {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length)
  }

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-container p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Number & Icon */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="text-6xl md:text-7xl font-bold text-cosmic-orange/40">
                  {steps[currentStep].number}
                </div>
                <div className="w-16 h-16 rounded-glass bg-cosmic-orange/20 flex items-center justify-center text-cosmic-orange">
                  {steps[currentStep].icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-heading-xl md:text-display-sm font-bold mb-3 gradient-text">
                  {steps[currentStep].title}
                </h3>
                <p className="text-body-md text-medium-gray leading-relaxed">
                  {steps[currentStep].description}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-4 py-2 rounded-glass text-secondary-white hover:text-cosmic-orange transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-body-sm font-medium">Previous</span>
          </button>

          {/* Step Indicators */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
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
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

