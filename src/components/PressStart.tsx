'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PressStartProps {
  onComplete: () => void
}

type Phase = 'idle' | 'countdown' | 'blastoff' | 'done'

// Pre-generate deterministic star positions
function generateStarPositions(count: number) {
  const stars: Array<{ left: number; top: number; duration: number; delay: number; size: number }> = []
  for (let i = 0; i < count; i++) {
    const seed = i * 9973
    const left = ((seed * 7919) % 10000) / 100
    const top = ((seed * 104729) % 10000) / 100
    const duration = 2 + ((seed * 3571) % 200) / 100
    const delay = ((seed * 7333) % 200) / 100
    const size = 1 + ((seed * 13) % 3)
    stars.push({ left, top, duration, delay, size })
  }
  return stars
}

// Generate sparkle trail positions for blastoff
function generateSparkles(count: number) {
  const sparkles: Array<{ x: number; y: number; delay: number; size: number }> = []
  for (let i = 0; i < count; i++) {
    const seed = i * 7919
    const x = ((seed * 9973) % 100) - 50 // -50 to 50
    const y = ((seed * 104729) % 100) - 50
    const delay = i * 0.03
    const size = 4 + ((seed * 17) % 8)
    sparkles.push({ x, y, delay, size })
  }
  return sparkles
}

const starPositions = generateStarPositions(60)
const sparklePositions = generateSparkles(15)

export function PressStart({ onComplete }: PressStartProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 700)
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
    }, 1000)
    return () => clearTimeout(timer)
  }, [phase, onComplete])

  const handleClick = useCallback(() => {
    if (phase === 'idle') {
      setPhase('countdown')
      // Play coin insert sound using Web Audio API
      if (typeof window !== 'undefined') {
        try {
          const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
          
          // Play a coin-insert like sound (two tones)
          const playTone = (freq: number, startTime: number, duration: number) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            oscillator.frequency.value = freq
            oscillator.type = 'sine'
            gainNode.gain.setValueAtTime(0.15, startTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
            oscillator.start(startTime)
            oscillator.stop(startTime + duration)
          }
          
          const now = audioContext.currentTime
          playTone(1200, now, 0.08)
          playTone(1600, now + 0.08, 0.12)
        } catch {
          // Audio not supported
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
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#0a0a12] via-[#0d0d18] to-[#05050a] flex items-center justify-center overflow-hidden"
        >
          {/* Animated gradient orbs background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,255,247,0.08) 0%, transparent 70%)',
                left: '20%',
                top: '30%',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,0,255,0.08) 0%, transparent 70%)',
                right: '10%',
                bottom: '20%',
              }}
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Star background */}
          <div className="absolute inset-0 overflow-hidden">
            {starPositions.map((star, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: star.size,
                  height: star.size,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
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
            
            {/* IDLE PHASE */}
            {phase === 'idle' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                {/* Glowing orb behind title */}
                <motion.div
                  className="absolute w-80 h-80 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(0,255,247,0.15) 0%, transparent 60%)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* Title */}
                <motion.div className="relative">
                  <motion.h1 
                    className="font-pixel text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-[#00fff7] via-[#00e5ff] to-[#00fff7] mb-2 text-center"
                    style={{
                      textShadow: '0 0 30px rgba(0,255,247,0.5), 0 0 60px rgba(0,255,247,0.3)',
                    }}
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(0,255,247,0.5), 0 0 40px rgba(0,255,247,0.3)',
                        '0 0 30px rgba(0,255,247,0.7), 0 0 60px rgba(0,255,247,0.5)',
                        '0 0 20px rgba(0,255,247,0.5), 0 0 40px rgba(0,255,247,0.3)',
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    GENLAYER
                  </motion.h1>
                  
                  <motion.h2 
                    className="font-pixel text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] via-[#ff66ff] to-[#ff00ff] text-center"
                    style={{
                      textShadow: '0 0 20px rgba(255,0,255,0.5)',
                    }}
                    animate={{
                      textShadow: [
                        '0 0 15px rgba(255,0,255,0.4), 0 0 30px rgba(255,0,255,0.2)',
                        '0 0 25px rgba(255,0,255,0.6), 0 0 50px rgba(255,0,255,0.4)',
                        '0 0 15px rgba(255,0,255,0.4), 0 0 30px rgba(255,0,255,0.2)',
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                  >
                    EVENT ALARM
                  </motion.h2>
                </motion.div>

                {/* Decorative line */}
                <motion.div
                  className="w-48 h-0.5 mt-8 mb-10 bg-gradient-to-r from-transparent via-[#00fff7] to-transparent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* PRESS START Button */}
                <motion.button
                  onClick={handleClick}
                  className="font-pixel text-base sm:text-lg md:text-xl text-[#ffd700] px-8 sm:px-10 py-4 sm:py-5 
                    border-2 border-[#ffd700] bg-[#0a0a12]/80 backdrop-blur-sm
                    hover:bg-[#ffd700]/10 hover:border-[#ffe066]
                    transition-all duration-300 cursor-pointer
                    relative overflow-hidden group"
                  animate={{
                    boxShadow: [
                      '0 0 15px rgba(255,215,0,0.3), inset 0 0 15px rgba(255,215,0,0.05)',
                      '0 0 30px rgba(255,215,0,0.5), inset 0 0 25px rgba(255,215,0,0.1)',
                      '0 0 15px rgba(255,215,0,0.3), inset 0 0 15px rgba(255,215,0,0.05)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ▶
                    </motion.span>
                    PRESS START
                  </span>
                  
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#ffd700]" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#ffd700]" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#ffd700]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ffd700]" />
                </motion.button>

                {/* Subtitle */}
                <motion.p
                  className="font-pixel-body text-sm text-[#667] mt-8 tracking-widest"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  CLICK TO CONTINUE
                </motion.p>
              </motion.div>
            )}

            {/* COUNTDOWN PHASE */}
            {phase === 'countdown' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                {/* Mascot with smooth floating */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ 
                    y: [0, -15, 0],
                    opacity: 1,
                  }}
                  transition={{
                    y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    opacity: { duration: 0.5 },
                  }}
                  className="mb-8 relative"
                >
                  {/* Glow behind mascot */}
                  <motion.div
                    className="absolute inset-0 w-40 h-40 md:w-52 md:h-52 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(0,255,247,0.2) 0%, transparent 70%)',
                      filter: 'blur(15px)',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  
                  <img
                    src="/mascot-rocket.png"
                    alt="GenLayer Mascot"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain pixelated relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </motion.div>

                {/* Countdown Number */}
                <div className="relative">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 1.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="font-pixel text-7xl sm:text-8xl md:text-9xl text-[#00fff7]"
                    style={{
                      textShadow: '0 0 30px rgba(0,255,247,0.8), 0 0 60px rgba(0,255,247,0.4), 0 0 90px rgba(0,255,247,0.2)',
                    }}
                  >
                    {countdown}
                  </motion.div>
                  
                  {/* Ring effect around number */}
                  <motion.div
                    key={`ring-${countdown}`}
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute inset-0 w-24 h-24 sm:w-32 sm:h-32 border-4 border-[#00fff7] rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                </div>

                {/* GET READY text */}
                <motion.p
                  className="font-pixel text-lg sm:text-xl text-[#ff00ff] mt-6 tracking-wider"
                  style={{
                    textShadow: '0 0 15px rgba(255,0,255,0.6)',
                  }}
                  animate={{ 
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.02, 1],
                  }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  GET READY!
                </motion.p>
              </motion.div>
            )}

            {/* BLASTOFF PHASE */}
            {phase === 'blastoff' && (
              <>
                {/* Sparkle trail effect */}
                {sparklePositions.map((sparkle, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      opacity: 0 
                    }}
                    animate={{ 
                      x: sparkle.x,
                      y: sparkle.y,
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: sparkle.delay,
                      ease: 'easeOut',
                    }}
                    className="absolute rounded-full bg-[#00fff7]"
                    style={{
                      width: sparkle.size,
                      height: sparkle.size,
                      boxShadow: '0 0 10px #00fff7, 0 0 20px #00fff7',
                    }}
                  />
                ))}
                
                {/* Mascot flying to top-left */}
                <motion.div
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    scale: 1, 
                    opacity: 1,
                    rotate: 0,
                  }}
                  animate={{
                    x: '-42vw',
                    y: '-42vh',
                    scale: 0.2,
                    opacity: 0,
                    rotate: -20,
                  }}
                  transition={{
                    duration: 0.9,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="flex flex-col items-center relative z-20"
                >
                  {/* Glow trail */}
                  <motion.div
                    className="absolute w-20 h-20 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(0,255,247,0.4) 0%, transparent 70%)',
                      filter: 'blur(8px)',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  
                  <img
                    src="/mascot-rocket.png"
                    alt="GenLayer Mascot"
                    className="w-28 h-28 md:w-40 md:h-40 object-contain pixelated relative z-10"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </motion.div>
              </>
            )}
          </div>

          {/* Scanline effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)',
            }}
          />
          
          {/* Vignette effect */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
