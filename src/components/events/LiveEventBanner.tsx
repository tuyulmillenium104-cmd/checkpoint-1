'use client'

import { motion } from 'framer-motion'
import { BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/lib/events-data'

interface LiveEventBannerProps {
  events: Event[]
  isGamingMode: boolean
  isDemo?: boolean
  onEventClick: (event: Event) => void
  formatTimeWithLabel: (time: string) => string
}

export function LiveEventBanner({
  events,
  isGamingMode,
  isDemo = false,
  onEventClick,
  formatTimeWithLabel,
}: LiveEventBannerProps) {
  if (events.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isGamingMode ? 'bg-[#ff0040]/20 border-b-4 border-[#ff0040]' : 'bg-red-50 dark:bg-red-900/10 border-b border-red-500'} px-4 py-3`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center gap-2 px-3 py-1 animate-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className={`text-xs uppercase tracking-wider ${isGamingMode ? 'font-bold text-white' : 'text-white font-semibold'}`}>
              {isDemo ? '🧪 DEMO LIVE' : 'LIVE NOW'}
            </span>
          </div>
          <span className={`text-sm ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'}`}>
            {events.length} event{events.length > 1 ? 's' : ''} sedang berlangsung
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {events.map(event => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${isGamingMode ? 'border-2 border-[#ff0040] bg-[#ff0040]/10 hover:bg-[#ff0040]/20' : 'border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg'}`}
              onClick={() => onEventClick(event)}
              role="button"
              tabIndex={0}
              aria-label={`${event.name} is live now. Click to view details.`}
            >
              {event.icon && (
                <img 
                  src={event.icon} 
                  alt={event.name}
                  className={`w-10 h-10 ${isGamingMode ? 'border-2 border-[#ff0040]' : 'border border-red-300 rounded-lg'}`}
                  style={{ imageRendering: 'pixelated' }}
                  loading="lazy"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs truncate ${isGamingMode ? 'font-bold text-[#ff0040]' : 'text-red-600 dark:text-red-400 font-semibold'}`}>
                    {event.name}
                  </span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                  {formatTimeWithLabel(event.timeUTC)}
                </span>
              </div>
              <Button
                size="sm"
                className={`text-xs px-2 py-1 border-0 ${isGamingMode ? 'bg-[#ff0040] text-white hover:bg-[#ff0040]/80' : 'bg-red-500 text-white hover:bg-red-600'}`}
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(event.link || 'https://discord.gg/genlayer', '_blank')
                }}
                aria-label={`Join ${event.name}`}
              >
                JOIN
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Demo Mode Banner
export function DemoModeBanner({
  isGamingMode,
  manualLiveEvent,
  onEventClick,
  onClearLive,
}: {
  isGamingMode: boolean
  manualLiveEvent: Event | null
  onEventClick: (event: Event) => void
  onClearLive: () => void
}) {
  if (!manualLiveEvent) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isGamingMode ? 'bg-[#ff0040]/20 border-b-4 border-[#ff0040]' : 'bg-red-50 dark:bg-red-900/10 border-b border-red-500'} px-4 py-3`}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className={`flex items-center gap-2 px-3 py-1 animate-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className={`text-xs uppercase tracking-wider ${isGamingMode ? 'font-bold text-white' : 'text-white font-semibold'}`}>
              🧪 DEMO LIVE
            </span>
          </div>
          <span className={`text-sm ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'}`}>
            Event yang dipilih sedang berlangsung
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            className={`text-xs px-4 py-2 ${isGamingMode ? 'border-2 border-[#ff0040] text-[#ff0040] bg-transparent hover:bg-[#ff0040]/20' : 'border border-red-500 text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20'}`}
            onClick={() => onEventClick(manualLiveEvent)}
          >
            {manualLiveEvent.name}
          </Button>
          <Button
            size="sm"
            className={`text-xs px-3 py-2 ${isGamingMode ? 'bg-[#ff0040] text-white hover:bg-[#ff0040]/80' : 'bg-red-500 text-white hover:bg-red-600'}`}
            onClick={() => window.open(manualLiveEvent.link || 'https://discord.gg/genlayer', '_blank')}
          >
            Join Event
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`text-xs ${isGamingMode ? 'text-[#ff0040] hover:bg-[#ff0040]/10' : 'text-red-500 hover:bg-red-100'}`}
            onClick={onClearLive}
          >
            Clear
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Demo Mode Notification Test Panel
export function DemoNotificationPanel({
  isGamingMode,
  backgroundTestCountdown,
  onStartTest,
}: {
  isGamingMode: boolean
  backgroundTestCountdown: number | null
  onStartTest: (seconds: number) => void
}) {
  const timers = [5, 10, 15, 30]
  
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-2">
        {timers.map(seconds => (
          <Button
            key={seconds}
            size="sm"
            className={`text-xs font-bold ${backgroundTestCountdown ? 'opacity-50 cursor-not-allowed' : ''} ${isGamingMode ? 'border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10' : 'border border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'}`}
            disabled={backgroundTestCountdown !== null}
            onClick={() => onStartTest(seconds)}
          >
            {seconds}s
          </Button>
        ))}
      </div>
      
      {backgroundTestCountdown !== null && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-3 p-3 text-center ${isGamingMode ? 'bg-[#00fff7]/10 border-2 border-[#00fff7]' : 'bg-primary/10 border border-primary rounded-lg'}`}
        >
          <div className={`text-xs mb-1 ${isGamingMode ? 'text-[#00fff7] font-bold' : 'text-primary font-semibold'}`}>
            ⏰ ALARM DALAM:
          </div>
          <div className={`text-3xl font-mono font-bold ${isGamingMode ? 'text-[#00fff7]' : 'text-primary'}`}>
            {backgroundTestCountdown}
          </div>
          <div className={`text-xs mt-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
            💡 Pindah tab/minimize browser sekarang!
          </div>
        </motion.div>
      )}
    </div>
  )
}
