'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WalkthroughContextType {
  isWalkthroughOpen: boolean
  currentStep: number
  hasCompletedWalkthrough: boolean
  openWalkthrough: () => void
  closeWalkthrough: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  completeWalkthrough: () => void
  resetWalkthrough: () => void
}

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined)

const WALKTHROUGH_STORAGE_KEY = 'diffuse_walkthrough_completed'

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = useState(true) // Default true to prevent flash
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const completed = localStorage.getItem(WALKTHROUGH_STORAGE_KEY)
    const hasCompleted = completed === 'true'
    setHasCompletedWalkthrough(hasCompleted)
    
    // If user hasn't completed walkthrough, open it automatically
    if (!hasCompleted) {
      // Small delay to let the page render first
      setTimeout(() => {
        setIsWalkthroughOpen(true)
      }, 500)
    }
    
    setHasCheckedStorage(true)
  }, [])

  const openWalkthrough = () => {
    setCurrentStep(0)
    setIsWalkthroughOpen(true)
  }

  const closeWalkthrough = () => {
    setIsWalkthroughOpen(false)
  }

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const completeWalkthrough = () => {
    localStorage.setItem(WALKTHROUGH_STORAGE_KEY, 'true')
    setHasCompletedWalkthrough(true)
    setIsWalkthroughOpen(false)
  }

  const resetWalkthrough = () => {
    localStorage.removeItem(WALKTHROUGH_STORAGE_KEY)
    setHasCompletedWalkthrough(false)
    setCurrentStep(0)
  }

  // Don't render children until we've checked storage to prevent flash
  if (!hasCheckedStorage) {
    return null
  }

  return (
    <WalkthroughContext.Provider
      value={{
        isWalkthroughOpen,
        currentStep,
        hasCompletedWalkthrough,
        openWalkthrough,
        closeWalkthrough,
        nextStep,
        prevStep,
        goToStep,
        completeWalkthrough,
        resetWalkthrough,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  )
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext)
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider')
  }
  return context
}
