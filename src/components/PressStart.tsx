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
  const [flameFlicker, setFlameFlicker] = useState(false)

  // Flame flicker animation
  useEffect(() => {
    if (phase !== 'idle') return
    
    const interval = setInterval(() => {
      setFlameFlicker(prev => !prev)
    }, 100)
    
    return () => clearInterval(interval)
  }, [phase])

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
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setPhase('countdown')
      // Play sound effect if available
      try {
        const audio = new Audio('/sounds/coin-insert.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
      } catch {}
    }
  }, [phase])

  if (phase === 'done') return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] cursor-pointer overflow-hidden"
        onClick={handleClick}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Stars background - using pre-generated positions to avoid hydration mismatch */}
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
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}
        </div>

        {phase === 'idle' && (
          <>
            {/* Mascot with rocket */}
            <motion.div
              className="relative mb-8"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Flame effect */}
              <motion.div
                className="absolute -bottom-4 left-1/2 -translate-x-1/2"
                animate={{
                  scale: flameFlicker ? [1, 1.2, 1] : [1, 0.8, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 0.15,
                }}
              >
                <div className="flex gap-0.5">
                  <div className={`w-4 h-6 ${flameFlicker ? 'bg-orange-500' : 'bg-yellow-400'}`} 
                    style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                  <div className={`w-6 h-8 ${flameFlicker ? 'bg-yellow-400' : 'bg-orange-500'}`} 
                    style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                  <div className={`w-4 h-6 ${flameFlicker ? 'bg-orange-500' : 'bg-yellow-400'}`} 
                    style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                </div>
              </motion.div>

              {/* Mascot image */}
              <img
                src="/mascot-rocket.png"
                alt="GenLayer Mascot"
                className="w-48 h-48 md:w-64 md:h-64 object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Press Start text */}
            <motion.div
              className="text-center"
              animate={{
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <p className="font-pixel text-lg md:text-2xl text-[#00fff7] neon-text-cyan tracking-wider">
                PRESS START TO CONTINUE
              </p>
            </motion.div>

            {/* Click hint */}
            <motion.p
              className="mt-4 text-xs font-pixel text-[#8888aa]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ CLICK ANYWHERE ]
            </motion.p>
          </>
        )}

        {phase === 'countdown' && (
          <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {/* Screen shake effect */}
            <motion.div
              animate={{
                x: [0, -5, 5, -3, 3, 0],
                y: [0, 3, -3, 2, -2, 0],
              }}
              transition={{
                duration: 0.3,
                repeat: countdown > 0 ? Infinity : 0,
              }}
            >
              <motion.p
                key={countdown}
                className="font-pixel text-6xl md:text-8xl text-[#ffd700] neon-text-gold"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ duration: 0.3 }}
              >
                {countdown > 0 ? countdown : 'GO!'}
              </motion.p>
            </motion.div>

            {/* Mascot during countdown */}
            <motion.div
              className="mt-8"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
              }}
            >
              <img
                src="/mascot-rocket.png"
                alt="GenLayer Mascot"
                className="w-32 h-32 md:w-48 md:h-48 object-contain pixelated mx-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>
          </motion.div>
        )}

        {phase === 'blastoff' && (
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: '-150vh' }}
            transition={{
              duration: 1.2,
              ease: [0.2, 0, 0.8, 1],
            }}
            className="flex flex-col items-center"
          >
            {/* Rocket trail effect */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{
                  scaleY: [1, 2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                }}
              >
                <div className="flex gap-1">
                  <div className="w-6 h-20 bg-orange-500" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                  <div className="w-8 h-28 bg-yellow-400" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                  <div className="w-6 h-20 bg-orange-500" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                </div>
              </motion.div>
            </div>

            {/* Mascot rocket */}
            <img
              src="/mascot-rocket.png"
              alt="GenLayer Mascot"
              className="w-48 h-48 md:w-64 md:h-64 object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* BLAST OFF text */}
            <motion.p
              className="font-pixel text-2xl md:text-4xl text-[#39ff14] neon-text-lime mt-4"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
              }}
            >
              🚀 BLAST OFF!
            </motion.p>
          </motion.div>
        )}

        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
