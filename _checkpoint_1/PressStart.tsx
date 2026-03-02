'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PressStartProps {
  onComplete: () => void
}

type Phase = 'idle' | 'countdown' | 'blastoff' | 'done'

// Pre-generate deterministic star positions
function generateStarPositions(count: number) {
  const stars: Array<{ left: number; top: number; duration: number; delay: number }> = []
  for (let i = 0; i < count; i++) {
    const seed = i * 9973
    const left = ((seed * 7919) % 10000) / 100
    const top = ((seed * 104729) % 10000) / 100
    const duration = 2 + ((seed * 3571) % 200) / 100
    const delay = ((seed * 7333) % 200) / 100
    stars.push({ left, top, duration, delay })
  }
  return stars
}

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
        {/* Stars background */}
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
          <>
            {/* Trail path - diagonal line from center to top-left */}
            <motion.div
              className="absolute left-1/2 top-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ translateX: '-50%', translateY: '-50%' }}
            >
              <motion.div
                className="origin-center"
                initial={{ width: 0 }}
                animate={{ width: 400 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '3px',
                  background: 'linear-gradient(to left, #00fff7, #ffd700, transparent)',
                  transform: 'rotate(-135deg)',
                  transformOrigin: 'right center',
                  boxShadow: '0 0 10px #00fff7, 0 0 20px #ffd700',
                  borderRadius: '2px',
                }}
              />
            </motion.div>

            {/* Rocket flying to top-left corner */}
            <motion.div
              className="absolute"
              initial={{ 
                left: '50%', 
                top: '50%', 
                scale: 1, 
                rotate: 0,
                x: '-50%',
                y: '-50%'
              }}
              animate={{ 
                left: '0%', 
                top: '0%', 
                scale: 0.2,
                rotate: -45,
                x: '-20%',
                y: '-20%'
              }}
              transition={{
                duration: 1,
                ease: 'easeIn',
              }}
            >
              <img
                src="/mascot-rocket.png"
                alt="GenLayer Mascot"
                className="w-40 h-40 md:w-52 md:h-52 object-contain pixelated"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* BLAST OFF text - stays in center briefly */}
            <motion.p
              className="font-pixel text-2xl md:text-4xl text-[#39ff14] neon-text-lime"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              🚀 BLAST OFF!
            </motion.p>
          </>
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
