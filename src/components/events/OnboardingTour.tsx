'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Bell, Calendar, Search, Gamepad2, Sun, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to GenLayer Event Alarm!',
    description: 'Never miss a GenLayer event again. Set alarms and get notified before events start.',
    icon: <Bell className="w-12 h-12" />,
    color: '#39ff14'
  },
  {
    title: 'Browse Events by Day',
    description: 'Use the day tabs to see events scheduled for each day of the week. Today\'s events are highlighted.',
    icon: <Calendar className="w-12 h-12" />,
    color: '#ff00ff'
  },
  {
    title: 'Search & Filter',
    description: 'Click the Filter button to search events by name or filter by category (Quiz, Game, AMA, Contest).',
    icon: <Search className="w-12 h-12" />,
    color: '#00fff7'
  },
  {
    title: 'Gaming Mode & Normal Mode',
    description: 'Toggle between Gaming Mode (dark neon theme) and Normal Mode (clean light theme) using the toggle button.',
    icon: <Gamepad2 className="w-12 h-12" />,
    color: '#ffd700'
  },
  {
    title: 'Admin Mode',
    description: 'Enable ADMIN mode to access the admin panel. Manage events, roles, and settings. Default password: admin123',
    icon: <Settings className="w-12 h-12" />,
    color: '#ff0040'
  }
]

export function OnboardingTour({
  isOpen,
  onClose,
  isGamingMode
}: {
  isOpen: boolean
  onClose: () => void
  isGamingMode: boolean
}) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('genlayer-seen-onboarding')
    if (hasSeenOnboarding) {
      onClose()
    }
  }, [onClose])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    localStorage.setItem('genlayer-seen-onboarding', 'true')
    onClose()
  }

  const handleSkip = () => {
    handleFinish()
  }

  if (!isOpen) return null

  const step = steps[currentStep]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-md ${isGamingMode ? 'border-4 bg-[#0a0a0f]' : 'border rounded-2xl bg-card'}`}
          style={{ borderColor: isGamingMode ? step.color : undefined }}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className={`absolute top-3 right-3 p-1 ${isGamingMode ? 'text-[#8888aa] hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Skip onboarding"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pt-6">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep 
                    ? 'w-6' 
                    : 'w-2'
                }`}
                style={{
                  backgroundColor: idx === currentStep ? step.color : isGamingMode ? '#2a2a4e' : '#e5e5e5'
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-4 flex justify-center"
              style={{ color: step.color }}
            >
              {step.icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xl font-bold mb-3 ${isGamingMode ? 'font-pixel' : ''}`}
              style={{ color: isGamingMode ? step.color : undefined }}
            >
              {step.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              key={`desc-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-sm mb-6 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}
            >
              {step.description}
            </motion.p>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className={`gap-1 ${isGamingMode ? 'border-2 font-bold' : ''}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="gap-1 font-bold"
                style={{ 
                  backgroundColor: isGamingMode ? step.color : undefined,
                  color: isGamingMode ? '#0a0a0f' : undefined
                }}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Skip link */}
          <div className="pb-4 text-center">
            <button
              onClick={handleSkip}
              className={`text-xs ${isGamingMode ? 'text-[#8888aa] hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Skip tutorial
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem('genlayer-seen-onboarding')
    if (!hasSeenOnboarding) {
      // Small delay to let the page load first
      const timer = setTimeout(() => setShowOnboarding(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const closeOnboarding = () => setShowOnboarding(false)
  const resetOnboarding = () => {
    localStorage.removeItem('genlayer-seen-onboarding')
    setShowOnboarding(true)
  }

  return { showOnboarding, closeOnboarding, resetOnboarding }
}
