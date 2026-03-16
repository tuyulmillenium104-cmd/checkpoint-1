'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ========== CONFETTI EFFECT ==========
interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  size: number
  rotation: number
}

export function ConfettiEffect() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  
  useEffect(() => {
    const colors = ['#00fff7', '#ff00ff', '#39ff14', '#ffd700', '#ff0040', '#ffff00']
    const newPieces: ConfettiPiece[] = []
    
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      })
    }
    
    setPieces(newPieces)
    
    // Clean up after animation
    const timer = setTimeout(() => setPieces([]), 3500)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ 
            x: `${piece.x}vw`, 
            y: '-10vh',
            rotate: 0,
            opacity: 1 
          }}
          animate={{ 
            y: '110vh',
            rotate: piece.rotation + 720,
            opacity: 0 
          }}
          transition={{ 
            duration: 3,
            delay: piece.delay,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>
  )
}

// ========== PROGRESS RING COUNTDOWN ==========
interface ProgressRingProps {
  progress: number // 0 to 100
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = '#00fff7',
  bgColor = 'rgba(255,255,255,0.1)',
  children 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <div className="countdown-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          className="ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ========== SOUND EFFECTS HOOK ==========
const SOUND_ENABLED_KEY = 'genlayer-sound-enabled'

export function useSoundEffects() {
  // Use lazy initialization to avoid SSR issues and lint warnings
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem(SOUND_ENABLED_KEY)
    return saved === null ? true : saved === 'true'
  })

  // Save sound preference to localStorage
  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_ENABLED_KEY, String(enabled))
    }
  }, [])
  
  const playSound = useCallback((type: 'click' | 'success' | 'remove' | 'alarm' | 'countdown') => {
    if (!soundEnabled || typeof window === 'undefined') return
    
    // Using Web Audio API for simple sound effects
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Different sounds for different actions
      const sounds: Record<string, { freq: number; duration: number; type: OscillatorType }> = {
        click: { freq: 800, duration: 0.05, type: 'sine' },
        success: { freq: 1200, duration: 0.1, type: 'sine' },
        remove: { freq: 400, duration: 0.1, type: 'sawtooth' },
        alarm: { freq: 1000, duration: 0.3, type: 'square' },
        countdown: { freq: 600, duration: 0.08, type: 'sine' },
      }
      
      const sound = sounds[type] || sounds.click
      oscillator.frequency.value = sound.freq
      oscillator.type = sound.type
      gainNode.gain.value = 0.1
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + sound.duration)
    } catch {
      // Audio not supported
    }
  }, [soundEnabled])
  
  return { playSound, soundEnabled, setSoundEnabled }
}

// ========== ANIMATED NUMBER ==========
interface AnimatedNumberProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, duration = 1000, className = '' }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    const startValue = displayValue
    const endValue = value
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
      
      setDisplayValue(currentValue)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])
  
  return <span className={`count-animate ${className}`}>{displayValue.toLocaleString()}</span>
}

// ========== LIVE BADGE ==========
export function LiveBadge({ isGamingMode }: { isGamingMode: boolean }) {
  return (
    <motion.div 
      className={`flex items-center gap-2 px-3 py-1 live-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.5, repeat: Infinity }}
    >
      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      <span className={`text-xs uppercase tracking-wider font-bold ${isGamingMode ? 'text-white font-pixel-body' : 'text-white font-semibold'}`}>
        ● LIVE
      </span>
    </motion.div>
  )
}

// ========== EVENT TYPE BADGE ==========
type EventType = 'quiz' | 'game' | 'ama' | 'contest' | 'xpspace' | 'regional'

interface EventTypeBadgeProps {
  type: EventType
  isGamingMode: boolean
}

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: string }> = {
  quiz: { label: 'QUIZ', color: '#8a2be2', icon: '❓' },
  game: { label: 'GAME', color: '#ff6347', icon: '🎮' },
  ama: { label: 'AMA', color: '#00fff7', icon: '🎙️' },
  contest: { label: 'CONTEST', color: '#ffd700', icon: '🏆' },
  xpspace: { label: 'X SPACE', color: '#ff00ff', icon: '𝕏' },
  regional: { label: 'REGIONAL', color: '#39ff14', icon: '🌍' },
}

export function EventTypeBadge({ type, isGamingMode }: EventTypeBadgeProps) {
  const config = eventTypeConfig[type]
  
  return (
    <span 
      className={`px-2 py-0.5 text-xs font-bold ${isGamingMode ? 'border-2' : 'border rounded'}`}
      style={{ 
        borderColor: config.color,
        color: config.color,
        backgroundColor: config.color + '20'
      }}
    >
      {config.icon} {config.label}
    </span>
  )
}

// ========== STATS CARD ==========
interface StatsCardProps {
  icon: React.ReactNode
  value: number
  label: string
  color: string
  isGamingMode: boolean
  delay?: number
}

export function StatsCard({ icon, value, label, color, isGamingMode, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`p-4 text-center relative overflow-hidden card-3d ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#12121a]' : 'border border-border bg-card rounded-lg'}`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{ 
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` 
        }}
      />
      
      {/* Icon */}
      <motion.div 
        className="relative z-10 mb-2 icon-float"
        style={{ color }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: delay * 0.5 }}
      >
        {icon}
      </motion.div>
      
      {/* Value */}
      <AnimatedNumber 
        value={value} 
        className={`relative z-10 text-2xl font-bold ${isGamingMode ? 'font-pixel' : ''}`}
        duration={1500}
      />
      
      {/* Label */}
      <p 
        className={`relative z-10 text-sm mt-1 ${isGamingMode ? 'text-[#8888aa] font-pixel-body' : 'text-muted-foreground'}`}
      >
        {label}
      </p>
    </motion.div>
  )
}

// ========== SOCIAL LINK ==========
interface SocialLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isGamingMode: boolean
}

export function SocialLink({ href, icon, label, isGamingMode }: SocialLinkProps) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`social-link flex items-center gap-2 px-4 py-2 ${isGamingMode ? 'border-2 border-[#2a2a4e] hover:border-[#00fff7]' : 'border border-border rounded-lg hover:border-primary'}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={isGamingMode ? 'text-[#00fff7]' : 'text-primary'}>{icon}</span>
      <span className={`text-sm ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'}`}>{label}</span>
    </motion.a>
  )
}
