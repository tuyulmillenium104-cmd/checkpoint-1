'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PressStartProps {
  onComplete: () => void
}

type Phase = 'idle' | 'countdown' | 'blastoff' | 'done'

// Pre-generate deterministic star positions using a seeded approach
// This avoids hydration mismatch by using fixed values based on index
function generateStarPositions(count: number) {
  const stars: Array<{ left: number; top: number; duration: number; delay: number }> = []
  for (let i = 0; i < count; i++) {
    // Use a simple hash-like function to generate deterministic values
    const seed = i * 9973 // Prime number for better distribution
    const left = ((seed * 7919) % 10000) / 100
    const top = ((seed * 104729) % 10000) / 100
    const duration = 2 + ((seed * 3571) % 200) / 100
    const delay = ((seed * 7333) % 200) / 100
    stars.push({ left, top, duration, delay })
  }
  return stars
}

// Generate star positions once outside component to avoid hydration mismatch
const starPositions = generateStarPositions(50)

export function PressStart({ onComplete }: PressStartProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      // Countdown finished, start blast off (wrap in timeout to avoid cascading render)
      const timer = setTimeout(() => {
        setPhase('blastoff')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [phase, countdown])

  // Blast off complete
  useEffect(() => {
    if (phase !== 'blastoff') return
    
    const timer = setTimeout(() => {
      setPhase('done')
      onComplete()
    }, 1200)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setPhase('countdown')
      if (typeof window !== 'undefined') {
        try {
          const audio = new Audio('/sounds/coin-insert.mp3')
          audio.volume = 0.5
          audio.play().catch(() => {
            // Audio failed to play - this is fine, just continue without sound
          })
        } catch {
          // Audio not supported - continue without sound
        }
      }
    }
  }, [phase])

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key="press-start-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center overflow-hidden"
        >
          {/* Star background */}
          <div className="absolute inset-0 overflow-hidden">
            {starPositions.map((star, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center">
            
            {/* IDLE PHASE - Just the button, no mascot */}
            {phase === 'idle' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Title */}
                <motion.h1 
                  className="font-pixel text-2xl md:text-4xl text-[#00fff7] neon-text-cyan mb-8 text-center px-4"
                  animate={{
                    textShadow: [
                      '0 0 10px #00fff7, 0 0 20px #00fff7',
                      '0 0 20px #00fff7, 0 0 40px #00fff7',
                      '0 0 10px #00fff7, 0 0 20px #00fff7',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  GENLAYER
                  <br />
                  <span className="text-[#ff00ff]">EVENT ALARM</span>
                </motion.h1>

                {/* PRESS START Button */}
                <motion.button
                  onClick={handleClick}
                  className="font-pixel text-lg md:text-2xl text-[#ffd700] px-8 py-4 
                    border-4 border-[#ffd700] bg-transparent
                    hover:bg-[#ffd700]/20 hover:shadow-[0_0_30px_#ffd700]
                    transition-all duration-300 cursor-pointer
                    relative overflow-hidden group"
                  animate={{
                    boxShadow: [
                      '0 0 10px #ffd700, inset 0 0 10px rgba(255,215,0,0.1)',
                      '0 0 30px #ffd700, inset 0 0 20px rgba(255,215,0,0.2)',
                      '0 0 10px #ffd700, inset 0 0 10px rgba(255,215,0,0.1)',
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="relative z-10">▶ PRESS START</span>
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.button>

                {/* Subtitle */}
                <motion.p
                  className="font-pixel-body text-sm text-[#8888aa] mt-6"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  CLICK TO CONTINUE
                </motion.p>
              </motion.div>
            )}

            {/* COUNTDOWN PHASE - Show mascot with countdown */}
            {phase === 'countdown' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Mascot appears here */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [-2, 2, -2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="mb-6"
                >
                  <img
                    src="/mascot-rocket.png"
                    alt="GenLayer Mascot"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain pixelated mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </motion.div>

                {/* Countdown Number */}
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="font-pixel text-6xl md:text-8xl text-[#00fff7] neon-text-cyan"
                >
                  {countdown}
                </motion.div>

                {/* GET READY text */}
                <motion.p
                  className="font-pixel text-xl text-[#ff00ff] mt-4 neon-text-magenta"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  GET READY!
                </motion.p>
              </motion.div>
            )}

            {/* BLASTOFF PHASE - Flying mascot to top-left corner */}
            {phase === 'blastoff' && (
              <motion.div
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: '-45vw',
                  y: '-45vh',
                  scale: 0.3,
                  opacity: 0,
                }}
                transition={{
                  duration: 1,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className="flex flex-col items-center"
              >
                {/* Mascot */}
                <img
                  src="/mascot-rocket.png"
                  alt="GenLayer Mascot"
                  className="w-32 h-32 md:w-48 md:h-48 object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </motion.div>
            )}
          </div>

          {/* Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
