'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  Clock, Trophy, Bell, Users, ChevronRight, Zap,
  Calendar, Sun, Moon,
  Star, Award, BellRing, Check, Globe,
  Gamepad2, Sword, Shield, Heart, Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  events, roles, functionalRoles, DAYS,
  getTodayEvents, getNextEvent,
  xpPoapSources, monthlyContributorHighlights, importantNotes,
  type Event
} from '@/lib/events-data'
import { LanguageProvider, useLanguage, useDayName } from '@/lib/language-context'
import { PressStart } from '@/components/PressStart'

// Get current day in UTC
function getCurrentUTCDay(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  return days[new Date().getUTCDay()]
}

// Check if event is currently live using event's duration
function isEventLive(event: Event): boolean {
  const now = new Date()
  const currentDay = DAYS[new Date().getUTCDay()]
  if (event.day !== currentDay) return false

  const [hours, minutes] = event.timeUTC.split(':').map(Number)
  const eventStartMinutes = hours * 60 + minutes
  const eventDuration = event.duration || 60 // Default 60 minutes if not specified
  const eventEndMinutes = eventStartMinutes + eventDuration
  const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()

  return nowMinutes >= eventStartMinutes && nowMinutes < eventEndMinutes
}

// Get current live events
function getLiveEvents(): Event[] {
  return events.filter(event => isEventLive(event))
}

// Countdown timer hook
function useCountdown(targetTime: string, targetDay: string) {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, days: 0 })

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const currentDay = now.getUTCDay()
      const targetDayIndex = DAYS.indexOf(targetDay as typeof DAYS[number])
      
      let daysUntil = targetDayIndex - currentDay
      if (daysUntil < 0) daysUntil += 7
      if (daysUntil === 0) {
        const [hours, minutes] = targetTime.split(':').map(Number)
        const eventMinutes = hours * 60 + minutes
        const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
        if (eventMinutes <= nowMinutes) {
          daysUntil = 7
        }
      }

      const [eventHours, eventMinutes] = targetTime.split(':').map(Number)
      const eventDate = new Date(now)
      eventDate.setUTCHours(eventHours, eventMinutes, 0, 0)
      eventDate.setUTCDate(now.getUTCDate() + daysUntil)

      const diff = eventDate.getTime() - now.getTime()
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)
    return () => clearInterval(interval)
  }, [targetTime, targetDay])

  return countdown
}

// Current UTC time hook
function useCurrentTime() {
  const { language } = useLanguage()
  const [time, setTime] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      
      if (language === 'id') {
        // Indonesian: 24-hour format for WIB
        setTime(now.toLocaleTimeString('en-GB', { 
          timeZone: 'Asia/Jakarta', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: false 
        }))
      } else {
        // English: 12-hour format for UTC
        setTime(now.toLocaleTimeString('en-US', { 
          timeZone: 'UTC', 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        }))
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [language])

  return time
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useEffect : () => {}

function PixelDecoration({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="flex gap-0.5">
        <div className="w-2 h-2 bg-[#00fff7]" />
        <div className="w-2 h-2 bg-[#ff00ff]" />
        <div className="w-2 h-2 bg-[#39ff14]" />
      </div>
    </div>
  )
}

function GameControls({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1">
      {children}
    </div>
  )
}

function PixelProgressBar({ value, max, color = "#39ff14" }: { value: number; max: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full h-4 border-2 border-[#2a2a4e] bg-[#0a0a0f] relative overflow-hidden">
      <div 
        className="h-full transition-all duration-300"
        style={{ 
          width: `${percentage}%`,
          background: `repeating-linear-gradient(
            90deg,
            ${color} 0px,
            ${color} 4px,
            transparent 4px,
            transparent 8px
          )`
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-pixel text-white drop-shadow-lg">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useIsomorphicLayoutEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    // Toggle between Gaming Mode (dark) and Biasa Mode (dark-clean)
    setTheme(theme === 'dark' ? 'dark-clean' : 'dark')
  }, [theme, setTheme])

  const isGamingMode = theme === 'dark'

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`w-10 h-10 p-0 pixel-button ${isGamingMode ? 'border-3 border-[#ffd700] bg-[#12121a] hover:bg-[#ffd700]/20' : 'border border-border bg-card hover:bg-muted'}`}
      onClick={toggleTheme}
      title={isGamingMode ? 'Switch to Normal Mode' : 'Switch to Gaming Mode'}
    >
      {!mounted ? (
        <Gamepad2 className="w-5 h-5 text-[#ffd700]" />
      ) : isGamingMode ? (
        <Gamepad2 className="w-5 h-5 text-[#ffd700] pulse-neon" />
      ) : (
        <Moon className="w-5 h-5 text-foreground" />
      )}
    </Button>
  )
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-1.5 border-3 border-[#ff00ff] bg-[#12121a] hover:bg-[#ff00ff]/20 font-pixel text-xs pixel-button"
      onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
    >
      <Globe className="w-4 h-4 text-[#ff00ff]" />
      <span className="text-[#ff00ff] font-bold">{language === 'id' ? 'ID' : 'EN'}</span>
    </Button>
  )
}

function RoleSystemModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useLanguage()
  const getDayName = useDayName()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[10px] neon-text-gold font-pixel">
            <div className="w-8 h-8 border-2 border-[#ffd700] bg-[#12121a] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#ffd700]" />
            </div>
            {t('roleSystem')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Role Hierarchy */}
          <section>
            <h3 className="text-[10px] font-pixel mb-3 flex items-center gap-2 neon-text-magenta">
              <Sword className="w-4 h-4" />
              {t('roleHierarchy')}
            </h3>
            <div className="space-y-2">
              {roles.map((role, index) => (
                <motion.div 
                  key={role.name} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 border-3 border-[#2a2a4e] bg-[#12121a] hover:border-[#00fff7] transition-colors relative"
                >
                  <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-[#2a2a4e] bg-[#0a0a0f]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-[#2a2a4e] bg-[#0a0a0f]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-[#2a2a4e] bg-[#0a0a0f]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-[#2a2a4e] bg-[#0a0a0f]" />
                  
                  <div className="flex items-center gap-3">
                    {role.emoji && <span className="text-2xl float">{role.emoji}</span>}
                    <div className="flex-1">
                      <h4 className="text-xs font-pixel" style={{ color: role.color, textShadow: `0 0 10px ${role.color}, 0 0 20px ${role.color}40` }}>
                        {role.name}
                      </h4>
                      <div className="mt-1 text-base">
                        <span className="text-[#8888aa]">{t('requirements')}: </span>
                        <span className="text-[#b8b8c8]">{role.requirements}</span>
                      </div>
                      <div className="text-base">
                        <span className="text-[#8888aa]">{t('perks')}: </span>
                        <span className="text-[#b8b8c8]">{role.perks}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Functional Roles */}
          <section>
            <h3 className="text-[10px] font-pixel mb-3 flex items-center gap-2 neon-text-cyan">
              <Shield className="w-4 h-4" />
              {t('functionalRoles')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {functionalRoles.map((role) => (
                <div key={role.name} className="p-2 border-3 border-[#2a2a4e] bg-[#12121a] hover:border-[#00fff7] transition-colors">
                  <h4 className="text-xs font-pixel text-[#00fff7]">{role.name}</h4>
                  <p className="text-sm text-[#b8b8c8]">{role.requirements}</p>
                </div>
              ))}
            </div>
          </section>

          {/* XP & POAP Sources */}
          <section>
            <h3 className="text-[10px] font-pixel mb-3 flex items-center gap-2 neon-text-gold">
              <Trophy className="w-4 h-4" />
              {t('xpPoapSources')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {xpPoapSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-2 border-3 border-[#2a2a4e] bg-[#12121a]">
                  <span className="text-sm text-[#b8b8c8]">{source.source}</span>
                  <div className="flex gap-1">
                    {source.xp && <span className="text-[10px] px-2 py-0.5 border-2 border-[#39ff14] text-[#39ff14] font-pixel">XP</span>}
                    {source.poap && <span className="text-[10px] px-2 py-0.5 border-2 border-[#ff00ff] text-[#ff00ff] font-pixel">POAP</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Monthly Contributor Highlights */}
          <section>
            <h3 className="text-[10px] font-pixel mb-3 flex items-center gap-2 neon-text-cyan">
              <Star className="w-4 h-4" />
              {t('monthlyContributor')}
            </h3>
            <div className="space-y-2">
              {monthlyContributorHighlights.map((highlight, index) => (
                <motion.div
                  key={highlight.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 border-3 border-[#2a2a4e] bg-[#12121a] hover:border-[#ff00ff] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-pixel text-[#ff00ff]">{highlight.category}</span>
                    <span className="text-[10px] font-pixel text-[#ffd700]">
                      {t('rank')} #{index + 1}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {highlight.rewards.map((reward, idx) => (
                      <span 
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-[#1a1a2e] text-[#00fff7] border border-[#2a2a4e]"
                      >
                        {reward}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Important Notes */}
          <section>
            <h3 className="text-[10px] font-pixel mb-3 neon-text-yellow flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ffff00]" />
              {t('importantNotes')}
            </h3>
            <div className="p-3 border-3 border-[#ffd700] bg-[#12121a]">
              <ul className="space-y-1">
                {importantNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-[#ffd700] font-pixel">&gt;</span>
                    <span className="text-[#b8b8c8]">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventDetailModal({ 
  event, 
  open, 
  onOpenChange,
  hasAlarm,
  onToggleAlarm 
}: { 
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  hasAlarm: boolean
  onToggleAlarm: () => void
}) {
  const { t, formatTimeWithLabel } = useLanguage()
  const getDayName = useDayName()

  if (!event) return null

  const maxXP = event.xpRewards.length > 0 
    ? Math.max(...event.xpRewards.map(r => r.xp))
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3">
            {event.icon && (
              <div className="relative">
                <img 
                  src={event.icon} 
                  alt={event.name}
                  className="w-16 h-16 border-3 border-[#00fff7] pixel-shadow"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39ff14]" />
              </div>
            )}
            <div className="flex-1">
              <span className="text-sm font-pixel neon-text-cyan">{event.name}</span>
              {event.isSpecial && (
                <div className="mt-1">
                  <span className="text-[10px] px-2 py-0.5 border-2 border-[#ffd700] text-[#ffd700] font-pixel bg-[#ffd700]/10">
                    ★ SPECIAL EVENT
                  </span>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Time & Day */}
          <div className="flex items-center gap-4 text-base p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f]">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00fff7] pulse-neon" />
              <span className="font-pixel text-[#00fff7] text-sm">{formatTimeWithLabel(event.timeUTC)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff00ff]" />
              <span className="text-[#ff00ff]">{getDayName(event.day)}</span>
            </div>
          </div>

          {/* Role Requirement */}
          <div className="flex items-center gap-2 p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f]">
            <Users className="w-5 h-5 text-[#8888aa]" />
            <span 
              className="text-sm font-pixel px-3 py-1 border-3"
              style={{ 
                borderColor: event.roleColor,
                color: event.roleColor,
                backgroundColor: event.roleColor + '20'
              }}
            >
              {event.roleReq}
            </span>
          </div>

          {/* Description */}
          {event.description && (
            <div className="p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f]">
              <p className="text-sm text-[#b0b0c0] leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Tags */}
          {(event.hasPOAP || event.hasInsight || (event.rewards && event.rewards.length > 0)) && (
            <div className="flex flex-wrap gap-2">
              {event.hasPOAP && (
                <span className="text-[10px] px-3 py-1 border-3 border-[#ff00ff] text-[#ff00ff] font-pixel bg-[#ff00ff]/10">
                  <Star className="w-3 h-3 inline mr-1" /> POAP
                </span>
              )}
              {event.hasInsight && (
                <span className="text-[10px] px-3 py-1 border-3 border-[#00fff7] text-[#00fff7] font-pixel bg-[#00fff7]/10">
                  <Zap className="w-3 h-3 inline mr-1" /> Insight
                </span>
              )}
            </div>
          )}

          {/* XP Rewards */}
          {event.xpRewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-[#ffd700]/10 border-3 border-[#ffd700]">
                <h4 className="text-[10px] font-pixel flex items-center gap-2 text-[#ffd700]">
                  <Trophy className="w-4 h-4" />
                  {t('xpRewards')}
                </h4>
                <span className="text-xs font-pixel text-[#ffd700] neon-text-gold">
                  MAX: {maxXP.toLocaleString('en-US')} XP
                </span>
              </div>
              <div className="p-2 border-3 border-[#2a2a4e] bg-[#0a0a0f] max-h-40 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {event.xpRewards.map((reward, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-1 hover:bg-[#39ff14]/10">
                      <span className="text-[#8888aa]">{reward.position}</span>
                      <span className="font-bold text-[#39ff14]">
                        {reward.xp > 0 ? `${reward.xp.toLocaleString('en-US')} XP` : 'XP'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              className="flex-1 border-3 border-[#00fff7] bg-[#00fff7] text-[#0a0a0f] hover:bg-[#39ff14] hover:border-[#39ff14] font-pixel text-xs pixel-button"
              onClick={() => {
                window.open(event.link || 'https://discord.gg/genlayer', '_blank')
              }}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              {t('joinEvent')}
            </Button>
            
            <Button
              variant="outline"
              className={`border-3 font-pixel text-xs pixel-button ${hasAlarm ? 'border-[#39ff14] bg-[#39ff14]/20 text-[#39ff14]' : 'border-[#ff00ff] text-[#ff00ff] bg-transparent'}`}
              onClick={onToggleAlarm}
            >
              {hasAlarm ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('alarmSet')}
                </>
              ) : (
                <>
                  <BellRing className="w-4 h-4 mr-1.5" />
                  {t('setAlarm')}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AlarmListModal({ 
  open, 
  onOpenChange,
  alarmedEvents,
  onRemoveAlarm,
  onClearAll
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  alarmedEvents: Event[]
  onRemoveAlarm: (eventId: string) => void
  onClearAll: () => void
}) {
  const { t, formatTimeWithLabel } = useLanguage()
  const getDayName = useDayName()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-[10px] neon-text-gold font-pixel">
            <div className="w-8 h-8 border-2 border-[#39ff14] bg-[#12121a] flex items-center justify-center">
              <BellRing className="w-5 h-5 text-[#39ff14] animate-pulse" />
            </div>
            {t('alarmList')} ({alarmedEvents.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 space-y-2">
          {alarmedEvents.length === 0 ? (
            <div className="text-center py-8 text-[#8888aa]">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('noAlarms')}</p>
            </div>
          ) : (
            <>
              {alarmedEvents.map(event => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 border-3 border-[#2a2a4e] bg-[#12121a] hover:border-[#39ff14] transition-colors"
                >
                  {event.icon && (
                    <img 
                      src={event.icon} 
                      alt={event.name}
                      className="w-10 h-10 border-2 border-[#00fff7]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-pixel text-[#00fff7] truncate">{event.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#8888aa] mt-1">
                      <span className="text-[#ff00ff]">{getDayName(event.day)}</span>
                      <span>•</span>
                      <span className="text-[#00fff7]">{formatTimeWithLabel(event.timeUTC)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveAlarm(event.id)}
                    className="p-2 border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 transition-colors"
                    title={t('removeAlarm')}
                  >
                    <span className="text-lg font-bold">×</span>
                  </button>
                </motion.div>
              ))}
            </>
          )}
        </div>

        {alarmedEvents.length > 0 && (
          <div className="pt-4 border-t-2 border-[#2a2a4e] mt-4">
            <Button
              variant="outline"
              className="w-full border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 font-pixel text-xs"
              onClick={onClearAll}
            >
              {t('clearAllAlarms')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AlarmAlert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <motion.div 
        className="relative border-4 border-[#39ff14] bg-[#0a0a0f] p-8 max-w-md mx-4 text-center"
        animate={{ 
          boxShadow: [
            '0 0 20px #39ff14, 0 0 40px #39ff14',
            '0 0 40px #39ff14, 0 0 80px #39ff14',
            '0 0 20px #39ff14, 0 0 40px #39ff14'
          ]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-[#39ff14]" />
        <div className="absolute top-0 right-0 w-4 h-4 bg-[#39ff14]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#39ff14]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39ff14]" />
        
        {/* Animated bell */}
        <motion.div
          animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          className="mb-4"
        >
          <BellRing className="w-16 h-16 mx-auto text-[#39ff14]" />
        </motion.div>
        
        <h2 className="text-lg font-pixel text-[#39ff14] mb-2">🔔 ALARM!</h2>
        <p className="text-sm text-[#b8b8c8] whitespace-pre-line mb-6">{message}</p>
        
        <Button
          className="bg-[#39ff14] text-[#0a0a0f] font-pixel hover:bg-[#39ff14]/80"
          onClick={onClose}
        >
          TUTUP
        </Button>
      </motion.div>
    </motion.div>
  )
}

// Discord-style Toast Notification at bottom-right corner
interface ToastNotificationProps {
  title: string
  message: string
  icon?: string
  onClick?: () => void
  onClose: () => void
  duration?: number
}

function ToastNotification({ title, message, icon, onClick, onClose, duration = 8000 }: ToastNotificationProps) {
  const [progress, setProgress] = useState(100)
  const [isPaused, setIsPaused] = useState(false)
  const onCloseRef = useRef(onClose)
  
  // Keep onClose ref updated
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  
  useEffect(() => {
    if (isPaused) return
    
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
        onCloseRef.current()
      }
    }, 50)
    
    return () => clearInterval(interval)
  }, [duration, isPaused])
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-4 right-4 z-[10001] w-80 pointer-events-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="relative bg-[#2f3136] rounded-md shadow-2xl cursor-pointer overflow-hidden border-l-4 border-[#39ff14]"
        style={{ boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}
        onClick={() => {
          onClick?.()
          onCloseRef.current()
        }}
      >
        {/* Progress bar at bottom */}
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-[#39ff14] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        
        <div className="flex items-start gap-3 p-3">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            {icon ? (
              <img src={icon} alt="" className="w-10 h-10 rounded-full border-2 border-[#39ff14]" style={{ imageRendering: 'pixelated' }} />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#39ff14] flex items-center justify-center">
                <BellRing className="w-5 h-5 text-[#0a0a0f]" />
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#39ff14]">GenLayer Event</span>
                <span className="text-[10px] text-[#72767d]">•</span>
                <span className="text-[10px] text-[#72767d]">Just now</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseRef.current()
                }}
                className="text-[#72767d] hover:text-white transition-colors p-0.5 hover:bg-[#36393f] rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <h4 className="text-sm font-semibold text-white mt-0.5">{title}</h4>
            <p className="text-xs text-[#dcddde] mt-0.5 line-clamp-2">{message}</p>
          </div>
        </div>
        
        {/* Click hint */}
        <div className="px-3 pb-2 text-[10px] text-[#72767d]">
          Click to open
        </div>
      </div>
    </motion.div>
  )
}

function Notification({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, y: -50, x: '-50%', scale: 0.9 }}
      className="fixed top-24 left-1/2 z-50 border-4 border-[#39ff14] bg-[#0a0a0f] px-6 py-4 flex items-center gap-3 max-w-sm pixel-shadow"
    >
      <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#39ff14]" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39ff14]" />
      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#39ff14]" />
      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#39ff14]" />
      
      <BellRing className="w-6 h-6 text-[#39ff14] animate-pulse" />
      <span className="text-xs font-pixel text-[#39ff14]">{message}</span>
      <button onClick={onClose} className="ml-2 text-[#8888aa] hover:text-[#ff0040] text-xl font-bold">
        ×
      </button>
    </motion.div>
  )
}

function AppContent() {
  const { t, language, formatTimeWithLabel } = useLanguage()
  const getDayName = useDayName()
  
  const [selectedDay, setSelectedDay] = useState<string>(getCurrentUTCDay())
  const [alarmedEvents, setAlarmedEvents] = useState<Set<string>>(new Set())
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set())
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventDetailOpen, setEventDetailOpen] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [alarmAlert, setAlarmAlert] = useState<string | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [liveEvents, setLiveEvents] = useState<Event[]>([])
  const [manualLiveEvent, setManualLiveEvent] = useState<Event | null>(null)
  const [alarmListOpen, setAlarmListOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [backgroundTestCountdown, setBackgroundTestCountdown] = useState<number | null>(null)
  const [toastData, setToastData] = useState<{ title: string; message: string; icon?: string; eventId?: string } | null>(null)

  const currentTime = useCurrentTime()
  const nextEvent = getNextEvent()
  const countdown = useCountdown(nextEvent?.timeUTC || '00:00', nextEvent?.day || 'MONDAY')
  const filteredEvents = events.filter(e => e.day === selectedDay)
  const todayEvents = getTodayEvents()

  const alarmEnabled = alarmedEvents.size > 0
  const alarmsLoadedRef = useRef(false)

  // Set client mount state
  useIsomorphicLayoutEffect(() => {
    setIsClient(true)
  }, [])

  // Register Service Worker for background notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered:', registration.scope)
        })
        .catch((error) => {
          console.log('[SW] Service Worker registration failed:', error)
        })
    }
  }, [])

  // Load alarms from localStorage after hydration (avoid SSR mismatch)
  useEffect(() => {
    if (isClient && !alarmsLoadedRef.current) {
      alarmsLoadedRef.current = true
      const saved = localStorage.getItem('genlayer-alarms')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as string[]
          // Only update if there are alarms to load
          if (parsed.length > 0) {
            // Defer setState to avoid cascading renders warning
            setTimeout(() => {
              setAlarmedEvents(new Set(parsed))
            }, 0)
          }
        } catch { }
      }
    }
  }, [isClient])

  // Get date string only on client to avoid hydration mismatch
  const currentDateString = isClient 
    ? new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      })
    : ''

  // Save alarms to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('genlayer-alarms', JSON.stringify([...alarmedEvents]))
    }
  }, [alarmedEvents])

  // Update live events every 30 seconds
  useEffect(() => {
    const updateLiveEvents = () => {
      setLiveEvents(getLiveEvents())
    }
    updateLiveEvents()
    const interval = setInterval(updateLiveEvents, 30000)
    return () => clearInterval(interval)
  }, [])

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Function to show browser notification with sound - works even when tab is in background
  const showBrowserNotification = useCallback(async (title: string, body: string, eventIcon?: string, eventId?: string, skipModal?: boolean) => {
    console.log('[Alarm] showBrowserNotification called:', title, body)
    
    // Play alarm sound using Web Audio API (multiple beeps for attention)
    try {
      const playBeep = (freq: number, duration: number, delay: number) => {
        setTimeout(() => {
          try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            if (audioContext.state === 'suspended') {
              audioContext.resume()
            }
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            oscillator.frequency.value = freq
            oscillator.type = 'square' // More attention-grabbing
            gainNode.gain.value = 0.5
            oscillator.start()
            oscillator.stop(audioContext.currentTime + duration)
          } catch (e) {}
        }, delay)
      }
      
      // Play 5 beeps with increasing frequency
      playBeep(600, 0.15, 0)
      playBeep(800, 0.15, 200)
      playBeep(1000, 0.15, 400)
      playBeep(1200, 0.15, 600)
      playBeep(1500, 0.3, 800)
      
      console.log('[Alarm] Sound played')
    } catch (e) {
      console.error('[Alarm] Sound error:', e)
    }

    // Show Discord-style toast notification at bottom (always visible)
    console.log('[Alarm] Setting toast data:', { title, body, eventIcon, eventId, skipModal })
    setToastData({ title, message: body, icon: eventIcon, eventId })
    console.log('[Alarm] Toast data set!')
    
    // Show visual notification on page (always works when tab is visible)
    setNotification(`${title}\n${body}`)
    
    // Show BIG alarm alert only for real events (not for test)
    if (!skipModal) {
      setAlarmAlert(`${title}\n\n${body}`)
    }
    
    // Show browser notification - works even when tab is in background
    try {
      const notificationOptions = {
        body: body,
        icon: eventIcon || '/genlayer-logo.jpg',
        badge: '/genlayer-logo.jpg',
        tag: 'genlayer-alarm-' + Date.now(),
        requireInteraction: true, // Notification stays until user interacts
        vibrate: [200, 100, 200, 100, 200], // Vibration pattern for mobile
        renotify: true, // Notify even if tag exists
        silent: false
      }
      
      // Try to use Service Worker for notifications (works when tab is hidden/closed)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if (registration && registration.showNotification) {
          await registration.showNotification(title, notificationOptions)
          console.log('[Alarm] Service Worker notification shown')
          return
        }
      }
      
      // Fallback to regular Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, notificationOptions)
        console.log('[Alarm] Browser notification shown')
      }
    } catch (e) {
      console.log('[Alarm] Browser notification not available:', e)
    }
  }, [])

  const toggleEventAlarm = useCallback((eventId: string) => {
    setAlarmedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
        setNotification(t('notification.removed'))
        // Remove from LIVE if it was manually set
        if (manualLiveEvent?.id === eventId) {
          setManualLiveEvent(null)
        }
      } else {
        newSet.add(eventId)
        setNotification(t('notification.set'))
      }
      return newSet
    })
    setTimeout(() => setNotification(null), 3000)
  }, [t, manualLiveEvent])

  // Start background test alarm (fires after X seconds, even if tab is hidden)
  const startBackgroundTest = useCallback((seconds: number) => {
    setBackgroundTestCountdown(seconds)
    
    // Use setTimeout that will fire even when tab is in background
    // Modern browsers throttle setTimeout but still execute it
    const timeoutId = setTimeout(() => {
      showBrowserNotification(
        '🔔 Test Background Alarm',
        `Notifikasi muncul setelah ${seconds} detik! Alarm bekerja meski tab di background.`,
        undefined,
        undefined,
        true // Skip big modal, only show toast
      )
      setBackgroundTestCountdown(null)
    }, seconds * 1000)
    
    // Store timeout ID so we can cancel if needed
    return () => {
      clearTimeout(timeoutId)
      setBackgroundTestCountdown(null)
    }
  }, [showBrowserNotification])

  // Countdown display for background test
  useEffect(() => {
    if (backgroundTestCountdown === null || backgroundTestCountdown <= 0) return
    
    const interval = setInterval(() => {
      setBackgroundTestCountdown(prev => {
        if (prev === null || prev <= 1) {
          return null
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [backgroundTestCountdown !== null])

  // In demo mode, clicking event sets it as LIVE
  const handleEventClick = useCallback((event: Event) => {
    if (demoMode) {
      setManualLiveEvent(event)
      // Also add to alarmed events
      setAlarmedEvents(prev => new Set(prev).add(event.id))
    }
    setSelectedEvent(event)
    setEventDetailOpen(true)
  }, [demoMode])

  // Live alarm system
  useEffect(() => {
    if (alarmedEvents.size === 0 || demoMode) return

    const checkNotifications = () => {
      const now = new Date()
      const currentDay = DAYS[new Date().getUTCDay()]
      const nowMinutes = now.getUTCHours() * 60 + now.getUTCMinutes()
      const nowSeconds = now.getUTCSeconds()

      events.forEach(event => {
        if (!alarmedEvents.has(event.id)) return
        if (event.day !== currentDay) return

        const [hours, minutes] = event.timeUTC.split(':').map(Number)
        const eventMinutes = hours * 60 + minutes
        const minutesUntil = eventMinutes - nowMinutes
        
        // Create unique notification ID for this event + day
        const notificationId = `${event.id}-${currentDay}`
        
        // Notify 5 minutes before
        if (minutesUntil === 5 && !notifiedEvents.has(`${notificationId}-5min`)) {
          const message = `[${event.name}] akan dimulai dalam 5 menit!`
          setNotification(message)
          showBrowserNotification(
            `🔔 ${event.name}`,
            `Event dimulai dalam 5 menit!`,
            event.icon,
            event.id
          )
          setNotifiedEvents(prev => new Set(prev).add(`${notificationId}-5min`))
          setTimeout(() => setNotification(null), 10000)
        }
        
        // Notify 1 minute before
        if (minutesUntil === 1 && !notifiedEvents.has(`${notificationId}-1min`)) {
          const message = `[${event.name}] akan dimulai dalam 1 menit!`
          setNotification(message)
          showBrowserNotification(
            `🔔 ${event.name}`,
            `Event dimulai dalam 1 menit!`,
            event.icon,
            event.id
          )
          setNotifiedEvents(prev => new Set(prev).add(`${notificationId}-1min`))
          setTimeout(() => setNotification(null), 10000)
        }
        
        // Notify when event starts
        if (minutesUntil === 0 && nowSeconds < 30 && !notifiedEvents.has(`${notificationId}-start`)) {
          const message = `[${event.name}] sudah dimulai!`
          setNotification(message)
          showBrowserNotification(
            `🔴 ${event.name}`,
            `Event sudah dimulai! Ayo gabung sekarang!`,
            event.icon,
            event.id
          )
          setNotifiedEvents(prev => new Set(prev).add(`${notificationId}-start`))
          setTimeout(() => setNotification(null), 10000)
        }
      })
    }

    checkNotifications()
    const interval = setInterval(checkNotifications, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [alarmedEvents, notifiedEvents, t, demoMode, showBrowserNotification])

  // Reset notified events at midnight (when day changes)
  useEffect(() => {
    const lastDayRef = { current: getCurrentUTCDay() }
    
    const checkDayChange = () => {
      const currentDay = getCurrentUTCDay()
      if (currentDay !== lastDayRef.current) {
        lastDayRef.current = currentDay
        setNotifiedEvents(new Set()) // Reset notifications for new day
      }
    }
    
    const interval = setInterval(checkDayChange, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const openEventDetail = useCallback((event: Event) => {
    // In demo mode, clicking event sets it as LIVE
    if (demoMode) {
      setManualLiveEvent(event)
      // Also add to alarmed events
      setAlarmedEvents(prev => new Set(prev).add(event.id))
    }
    setSelectedEvent(event)
    setEventDetailOpen(true)
  }, [demoMode])

  const getMaxXP = (event: Event): number => {
    return event.xpRewards.length > 0 
      ? Math.max(...event.xpRewards.map(r => r.xp))
      : 0
  }

  // Get alarmed events as Event objects
  const getAlarmedEventObjects = (): Event[] => {
    return events.filter(e => alarmedEvents.has(e.id))
  }

  // Remove single alarm
  const removeAlarm = useCallback((eventId: string) => {
    setAlarmedEvents(prev => {
      const newSet = new Set(prev)
      newSet.delete(eventId)
      return newSet
    })
  }, [])

  // Clear all alarms
  const clearAllAlarms = useCallback(() => {
    setAlarmedEvents(new Set())
    setAlarmListOpen(false)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] text-[#e0e0e0] retro-grid relative crt">
      {/* Animated pixel decorations */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00fff7] via-[#ff00ff] to-[#39ff14] opacity-50 z-50" />
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#39ff14] via-[#ff00ff] to-[#00fff7] opacity-50 z-50" />

      <AnimatePresence>
        {notification && (
          <Notification message={notification} onClose={() => setNotification(null)} />
        )}
      </AnimatePresence>

      {/* Big Alarm Alert */}
      <AnimatePresence>
        {alarmAlert && (
          <AlarmAlert message={alarmAlert} onClose={() => setAlarmAlert(null)} />
        )}
      </AnimatePresence>

      {/* Discord-style Toast Notification at bottom */}
      <AnimatePresence mode="wait">
        {toastData && (
          <ToastNotification 
            key="toast-notification"
            title={toastData.title}
            message={toastData.message}
            icon={toastData.icon}
            onClick={() => {
              // If eventId provided, open event detail
              if (toastData?.eventId) {
                const event = events.find(e => e.id === toastData.eventId)
                if (event) {
                  openEventDetail(event)
                }
              }
            }}
            onClose={() => {
              console.log('[Toast] Closing toast')
              setToastData(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b-4 border-[#00fff7] bg-[#0a0a0f]/95 backdrop-blur-sm relative">
        <PixelDecoration className="top-2 left-4" />
        <PixelDecoration className="top-2 right-4" />
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-3 border-[#00fff7] bg-[#12121a] flex items-center justify-center pixel-shadow relative overflow-hidden">
                <img 
                  src="/genlayer-logo.jpg" 
                  alt="GenLayer" 
                  className="w-10 h-10 object-contain"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39ff14] animate-pulse" />
              </div>
              <div>
                <h1 className="text-[10px] font-pixel neon-text-cyan glitch" data-text={t('app.title')}>
                  {t('app.title')}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clock Display */}
              <div className="hidden sm:flex flex-col items-center px-3 py-1 border-3 border-[#2a2a4e] bg-[#12121a]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#00fff7]" />
                  <span className="text-xs font-mono text-[#00fff7]">{currentTime}</span>
                  <span className="text-[8px] font-pixel text-[#ff00ff]">{language === 'id' ? 'WIB' : 'UTC'}</span>
                </div>
                <span className="text-[8px] font-pixel text-[#8888aa]">
                  {currentDateString || 'Loading...'}
                </span>
              </div>

              {isClient && alarmEnabled && (
                <button
                  onClick={() => setAlarmListOpen(true)}
                  className="flex items-center gap-1 text-[10px] px-3 py-2 border-3 border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10 font-pixel hover:bg-[#39ff14]/30 transition-colors cursor-pointer"
                >
                  <BellRing className="w-4 h-4 animate-pulse" />
                  <span>{alarmedEvents.size}</span>
                </button>
              )}

              {/* Demo Mode Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-1.5 border-3 font-pixel text-xs pixel-button ${demoMode ? 'border-[#ff0040] bg-[#ff0040]/20 text-[#ff0040]' : 'border-[#8888aa] bg-[#12121a] text-[#8888aa]'}`}
                onClick={() => setDemoMode(!demoMode)}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">DEMO</span>
              </Button>

              <LanguageToggle />

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1.5 border-3 border-[#ffd700] bg-[#12121a] hover:bg-[#ffd700]/20 pixel-button"
                onClick={() => setRoleModalOpen(true)}
              >
                <Users className="w-4 h-4 text-[#ffd700]" />
                <span className="hidden sm:inline text-[10px] font-pixel text-[#ffd700]">{t('roles')}</span>
              </Button>

              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Clock */}
          <div className="flex sm:hidden flex-col items-start mt-2 px-2 py-1 border-3 border-[#2a2a4e] bg-[#12121a] w-fit">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-[#00fff7]" />
              <span className="text-xs font-mono text-[#00fff7]">{currentTime}</span>
              <span className="text-[8px] font-pixel text-[#ff00ff]">{language === 'id' ? 'WIB' : 'UTC'}</span>
            </div>
            <span className="text-[8px] font-pixel text-[#8888aa]">
              {currentDateString || 'Loading...'}
            </span>
          </div>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {demoMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ff0040]/20 border-b-4 border-[#ff0040] px-4 py-3"
        >
          <div className="max-w-4xl mx-auto">
            {/* Sandbox Warning - Show if notifications not available */}
            {typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function' ? (
              <div className="mb-3 p-3 bg-[#ffd700]/20 border-2 border-[#ffd700]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">⚠️</span>
                  <span className="text-[10px] font-pixel text-[#ffd700]">MODE PREVIEW - NOTIFIKASI TERBATAS</span>
                </div>
                <p className="text-[10px] text-[#b8b8c8] mb-2">
                  Anda sedang dalam mode preview/sandbox. Notifikasi desktop tidak tersedia.
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#39ff14] font-bold">
                    👆 Klik tombol "Open in New Tab" di atas preview untuk mengaktifkan notifikasi desktop!
                  </span>
                </div>
              </div>
            ) : null}
            
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[#ff0040] animate-pulse" />
                <span className="text-sm font-pixel text-[#ff0040]">🧪 DEMO MODE AKTIF</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Demo Mode Info */}
                <span className="text-[10px] text-[#8888aa]">
                  Test notifikasi di sini sebelum event mulai
                </span>
              </div>
            </div>
            
            {/* Test Buttons */}
            <div className="bg-[#0a0a0f] p-3 border-2 border-[#ff0040]/50 mb-3">
              <div className="text-[10px] text-[#ffd700] font-pixel mb-2">🎮 TEST ALARM:</div>
              <div className="flex flex-wrap gap-2">
                {/* Instant Test - Toast Only */}
                <Button
                  size="sm"
                  className="text-[10px] px-3 py-2 bg-[#39ff14] text-[#0a0a0f] hover:bg-[#39ff14]/80 font-bold"
                  onClick={() => {
                    showBrowserNotification(
                      '🔔 Test Alarm',
                      'Notifikasi langsung muncul! Klik untuk test.',
                      undefined,
                      undefined,
                      true // Skip big modal, only show toast
                    )
                  }}
                >
                  🔔 INSTANT
                </Button>
                
                {/* Background Test Buttons */}
                <span className="text-[10px] text-[#8888aa] self-center ml-2">Background Test:</span>
                {[5, 10, 15, 30].map((seconds) => (
                  <Button
                    key={seconds}
                    size="sm"
                    disabled={backgroundTestCountdown !== null}
                    className={`text-[10px] px-3 py-2 border-2 font-bold ${
                      backgroundTestCountdown !== null 
                        ? 'border-[#8888aa] text-[#8888aa] cursor-not-allowed' 
                        : 'border-[#00fff7] text-[#00fff7] hover:bg-[#00fff7]/20'
                    }`}
                    onClick={() => startBackgroundTest(seconds)}
                  >
                    ⏱️ {seconds}s
                  </Button>
                ))}
              </div>
              
              {/* Browser Notification Status */}
              <div className="mt-3 p-3 bg-[#0a0a0f] border-2 border-[#ffd700]/50">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-pixel text-[#ffd700]">📢 NOTIFIKASI DESKTOP:</span>
                    {typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function' ? (
                      <span className={`text-[10px] px-2 py-0.5 border-2 ${
                        Notification.permission === 'granted' 
                          ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10' 
                          : Notification.permission === 'denied'
                          ? 'border-[#ff0040] text-[#ff0040] bg-[#ff0040]/10'
                          : 'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10'
                      }`}>
                        {Notification.permission === 'granted' ? '✓ AKTIF' : Notification.permission === 'denied' ? '✗ DIBLOKIR' : '? BELUM AKTIF'}
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 border-2 border-[#8888aa] text-[#8888aa]">
                        ⚠ TIDAK TERSEDIA
                      </span>
                    )}
                  </div>
                  {typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function' && Notification.permission !== 'granted' && (
                    <Button
                      size="sm"
                      className="text-[10px] px-3 py-1 bg-[#ffd700] text-[#0a0a0f] hover:bg-[#ffd700]/80 font-bold"
                      onClick={async () => {
                        try {
                          const permission = await Notification.requestPermission()
                          if (permission === 'granted') {
                            // Test notification immediately
                            new Notification('✓ Notifikasi Diaktifkan!', {
                              body: 'Anda akan menerima alarm event GenLayer!',
                              icon: '/genlayer-logo.jpg',
                              badge: '/genlayer-logo.jpg'
                            })
                            setNotification('✓ Notifikasi browser diaktifkan!')
                          } else {
                            setNotification(`Permission: ${permission}`)
                          }
                          setTimeout(() => setNotification(null), 3000)
                        } catch (e) {
                          console.error('[Notification] Error:', e)
                          setNotification('⚠ Notifikasi desktop tidak tersedia di environment ini (sandbox/iframe). Buka di tab baru untuk fitur lengkap.')
                          setTimeout(() => setNotification(null), 5000)
                        }
                      }}
                    >
                      🔔 AKTIFKAN NOTIF
                    </Button>
                  )}
                </div>
                <div className="text-[9px] text-[#8888aa] mt-2">
                  {typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function' ? (
                    <span className="text-[#ffd700]">
                      ⚠️ Browser Notification tidak tersedia di mode preview/sandbox.
                      <strong className="text-[#39ff14]"> Buka di tab baru</strong> untuk mengaktifkan notifikasi desktop.
                    </span>
                  ) : Notification.permission === 'granted' 
                    ? '✅ Notifikasi desktop aktif. Alarm akan muncul meski Anda di tab lain!'
                    : Notification.permission === 'denied'
                    ? '❌ Notifikasi diblokir. Buka Settings browser → Site Settings → Notifications → Allow'
                    : '⚠️ Klik tombol di atas untuk mengaktifkan notifikasi desktop'}
                </div>
                <div className="text-[9px] text-[#39ff14] mt-1">
                  💡 <strong>Catatan:</strong> Toast notification (pojok kanan bawah) selalu berfungsi meski di sandbox!
                </div>
              </div>
              
              {/* Countdown Display */}
              {backgroundTestCountdown !== null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-[#00fff7]/10 border-2 border-[#00fff7] text-center"
                >
                  <div className="text-[10px] text-[#00fff7] font-pixel mb-1">⏰ ALARM DALAM:</div>
                  <div className="text-3xl font-mono font-bold text-[#00fff7] neon-text-cyan">
                    {backgroundTestCountdown}
                  </div>
                  <div className="text-[10px] text-[#8888aa] mt-1">
                    💡 Pindah tab/minimize browser sekarang!
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Tips */}
            <div className="text-[10px] text-[#b8b8c8] bg-[#0a0a0f]/50 p-2 border-2 border-[#ff0040]/30">
              <div className="font-bold text-[#ffd700] mb-1">💡 CARA TEST NOTIFIKASI BACKGROUND:</div>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Klik <strong>"🔔 AKTIFKAN NOTIF"</strong> di atas (jika belum aktif)</li>
                <li>Klik timer <strong>(5s/10s/15s/30s)</strong></li>
                <li><strong>SEGERA pindah ke tab lain</strong> atau minimize browser</li>
                <li>Tunggu... <strong>Notifikasi akan muncul di desktop!</strong></li>
              </ol>
            </div>
          </div>
        </motion.div>
      )}

      {/* Live Events Banner - Normal Mode */}
      {liveEvents.length > 0 && !demoMode && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ff0040]/20 border-b-4 border-[#ff0040] px-4 py-3"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#ff0040] animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-pixel text-white uppercase tracking-wider">LIVE NOW</span>
              </div>
              <span className="text-sm text-[#b8b8c8]">{liveEvents.length} event sedang berlangsung</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {liveEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-2 border-2 border-[#ff0040] bg-[#ff0040]/10 hover:bg-[#ff0040]/20 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedEvent(event)
                    setEventDetailOpen(true)
                  }}
                >
                  {event.icon && (
                    <img 
                      src={event.icon} 
                      alt={event.name}
                      className="w-10 h-10 border-2 border-[#ff0040]"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-pixel text-[#ff0040] truncate">{event.name}</span>
                      <div className="w-2 h-2 bg-[#ff0040] rounded-full animate-pulse" />
                    </div>
                    <span className="text-[10px] text-[#8888aa]">{formatTimeWithLabel(event.timeUTC)}</span>
                  </div>
                  <Button
                    size="sm"
                    className="text-[10px] px-2 py-1 bg-[#ff0040] text-white hover:bg-[#ff0040]/80 border-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(event.link || 'https://discord.gg/genlayer', '_blank')
                    }}
                  >
                    JOIN
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Demo Mode - Manual Live Event */}
      {demoMode && manualLiveEvent && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#ff0040]/20 border-b-4 border-[#ff0040] px-4 py-3"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-[#ff0040] animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-[10px] font-pixel text-white uppercase tracking-wider">🧪 DEMO LIVE</span>
              </div>
              <span className="text-sm text-[#b8b8c8]">Event yang dipilih sedang berlangsung</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="text-xs px-4 py-2 border-2 border-[#ff0040] text-[#ff0040] bg-transparent hover:bg-[#ff0040]/20"
                onClick={() => {
                  setSelectedEvent(manualLiveEvent)
                  setEventDetailOpen(true)
                }}
              >
                {manualLiveEvent.name}
              </Button>
              <Button
                size="sm"
                className="text-xs px-3 py-2 bg-[#ff0040] text-white hover:bg-[#ff0040]/80"
                onClick={() => {
                  window.open(manualLiveEvent.link || 'https://discord.gg/genlayer', '_blank')
                }}
              >
                Join Event
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Next Event - Hero Section */}
        {nextEvent && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="border-4 border-[#00fff7] bg-[#12121a] p-5 relative overflow-hidden pixel-shadow"
          >
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 bg-[#00fff7]" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#00fff7]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#00fff7]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00fff7]" />
            
            {/* Inner corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-[#00fff7]/30" />
            <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-[#00fff7]/30" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-[#00fff7]/30" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-t-2 border-[#00fff7]/30" />

            <div className="flex items-center gap-2 mb-4">
              {isEventLive(nextEvent) ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#ff0040] animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-[10px] font-pixel text-white uppercase tracking-wider">LIVE</span>
                  </div>
                  <span className="text-sm text-[#ff0040] font-pixel">Event sedang berlangsung!</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-[#ffff00] pulse-neon" />
                  <span className="text-[10px] font-pixel text-[#ffff00] uppercase tracking-wider">
                    {t('nextEvent')}
                  </span>
                </>
              )}
              {isClient && alarmedEvents.has(nextEvent.id) && (
                <span className="ml-auto text-[10px] px-3 py-1 border-2 border-[#39ff14] text-[#39ff14] font-pixel bg-[#39ff14]/10">
                  <Bell className="w-3 h-3 inline mr-1" /> {t('alarmSet')}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                {nextEvent.icon && (
                  <div className="relative">
                    <img 
                      src={nextEvent.icon} 
                      alt={nextEvent.name}
                      className="w-16 h-16 border-3 border-[#00fff7] pixel-shadow"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39ff14] animate-pulse" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-pixel neon-text-cyan mb-2">{nextEvent.name}</h2>
                  <div className="flex items-center gap-4 text-[#8888aa] text-base">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#00fff7]" />
                      <span className="text-[#00fff7] font-pixel">{formatTimeWithLabel(nextEvent.timeUTC)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#ff00ff]" />
                      <span className="text-[#ff00ff]">{getDayName(nextEvent.day)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-pixel px-4 py-2 border-3"
                  style={{ 
                    borderColor: nextEvent.roleColor,
                    color: nextEvent.roleColor,
                    backgroundColor: nextEvent.roleColor + '20'
                  }}
                >
                  {nextEvent.roleReq}
                </span>
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { value: countdown.days, label: t('days'), color: '#00fff7' },
                { value: countdown.hours, label: t('hours'), color: '#ff00ff' },
                { value: countdown.minutes, label: t('min'), color: '#39ff14' },
                { value: countdown.seconds, label: t('sec'), color: '#ffd700' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f] text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
                  <div className="text-2xl font-mono font-bold" style={{ color: item.color }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-[#8888aa] mt-1 font-pixel">{item.label}</div>
                </motion.div>
              ))}
            </div>

            {/* XP Rewards */}
            {nextEvent.xpRewards.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between p-2 border-3 border-[#ffd700] bg-[#ffd700]/10">
                  <h4 className="text-[10px] font-pixel flex items-center gap-2 text-[#ffd700]">
                    <Trophy className="w-4 h-4" />
                    <span>{t('xpRewards')}</span>
                  </h4>
                  <span className="text-xs font-pixel text-[#ffd700] neon-text-gold">
                    MAX: {getMaxXP(nextEvent).toLocaleString('en-US')} XP
                  </span>
                </div>
                <div className="p-2 border-3 border-[#2a2a4e] bg-[#0a0a0f] max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                    {nextEvent.xpRewards.map((reward, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-1 hover:bg-[#39ff14]/10">
                        <span className="text-[#8888aa]">{reward.position}</span>
                        <span className="font-bold text-[#39ff14]">
                          {reward.xp > 0 ? `${reward.xp.toLocaleString('en-US')} XP` : 'XP'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 border-3 border-[#00fff7] bg-[#00fff7] text-[#0a0a0f] hover:bg-[#39ff14] hover:border-[#39ff14] font-pixel text-xs pixel-button"
                onClick={() => toggleEventAlarm(nextEvent.id)}
              >
                {isClient && alarmedEvents.has(nextEvent.id) ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('alarmSet')}
                  </>
                ) : (
                  <>
                    <BellRing className="w-4 h-4 mr-2" />
                    {t('setAlarm')}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="border-3 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/20 font-pixel text-xs pixel-button bg-transparent"
                onClick={() => {
                  window.open(nextEvent.link || 'https://discord.gg/genlayer', '_blank')
                }}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                {t('joinEvent')}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Today's Events */}
        <div className="border-4 border-[#ff00ff] bg-[#12121a] p-5 relative pixel-shadow">
          <div className="absolute top-0 left-0 w-4 h-4 bg-[#ff00ff]" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-[#ff00ff]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#ff00ff]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ff00ff]" />
          
          <div className="flex items-center gap-3 mb-4 border-b-3 border-[#2a2a4e] pb-3">
            <div className="w-8 h-8 border-2 border-[#ff00ff] flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#ff00ff]" />
            </div>
            <h3 className="text-[10px] font-pixel neon-text-magenta">{t('todayEvents')} ({todayEvents.length})</h3>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {todayEvents.slice(0, 5).map((event, index) => (
              <motion.div 
                key={event.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 border-3 transition-all cursor-pointer ${isEventLive(event) ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#ff00ff] hover:bg-[#ff00ff]/5'}`}
                onClick={() => openEventDetail(event)}
              >
                <div className="flex items-center gap-3">
                  {event.icon && (
                    <div className="relative">
                      <img 
                        src={event.icon} 
                        alt={event.name}
                        className="w-10 h-10 border-2 border-[#ff00ff]"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      {isEventLive(event) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff0040] rounded-full animate-pulse" />
                      )}
                    </div>
                  )}
                  <Clock className="w-4 h-4 text-[#8888aa]" />
                  <span className="text-sm text-[#00fff7] font-pixel">{formatTimeWithLabel(event.timeUTC)}</span>
                  <span className="text-base truncate max-w-[120px]">{event.name}</span>
                  {isEventLive(event) && (
                    <span className="px-2 py-0.5 bg-[#ff0040] text-white text-[8px] font-pixel uppercase animate-pulse">LIVE</span>
                  )}
                  {isClient && alarmedEvents.has(event.id) && !isEventLive(event) && (
                    <Bell className="w-4 h-4 text-[#39ff14] animate-pulse" />
                  )}
                </div>
                <span 
                  className="text-[10px] px-3 py-1 border-2 font-pixel"
                  style={{ 
                    borderColor: event.roleColor,
                    color: event.roleColor,
                  }}
                >
                  {event.roleReq}
                </span>
              </motion.div>
            ))}
            {todayEvents.length === 0 && (
              <div className="p-4 text-center border-3 border-dashed border-[#2a2a4e]">
                <p className="text-sm text-[#8888aa]">[{t('noEventsToday')}]</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Schedule */}
        <div className="border-4 border-[#39ff14] bg-[#12121a] p-5 relative pixel-shadow">
          <div className="absolute top-0 left-0 w-4 h-4 bg-[#39ff14]" />
          <div className="absolute top-0 right-0 w-4 h-4 bg-[#39ff14]" />
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#39ff14]" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39ff14]" />
          
          <div className="flex items-center gap-3 mb-4 border-b-3 border-[#2a2a4e] pb-3">
            <div className="w-8 h-8 border-2 border-[#39ff14] flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 text-[#39ff14]" />
            </div>
            <h3 className="text-[10px] font-pixel neon-text-lime">{t('eventSchedule')}</h3>
          </div>
          
          <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
            <TabsList className="bg-[#0a0a0f] border-3 border-[#2a2a4e] w-full justify-start flex-wrap h-auto gap-0.5 p-1 mb-4">
              {DAYS.map((day) => {
                const isToday = day === getCurrentUTCDay()
                return (
                  <TabsTrigger 
                    key={day} 
                    value={day}
                    className="text-[10px] px-3 py-2 font-pixel data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#0a0a0f]"
                  >
                    {getDayName(day)}
                    {isToday && <span className="ml-2 w-2 h-2 bg-[#ffd700] inline-block animate-pulse" />}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3 border-3 transition-all cursor-pointer ${isEventLive(event) ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#39ff14] hover:bg-[#39ff14]/5'}`}
                onClick={() => openEventDetail(event)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {event.icon && (
                      <div className="relative">
                        <img 
                          src={event.icon} 
                          alt={event.name}
                          className="w-12 h-12 border-2 border-[#39ff14] pixel-shadow"
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {isEventLive(event) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#ff0040] rounded-full animate-pulse" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#00fff7]" />
                        <span className="text-sm font-pixel text-[#00fff7]">{formatTimeWithLabel(event.timeUTC)}</span>
                        {isEventLive(event) && (
                          <span className="px-2 py-0.5 bg-[#ff0040] text-white text-[8px] font-pixel uppercase animate-pulse">LIVE</span>
                        )}
                        {event.isSpecial && (
                          <span className="text-[#ffd700] animate-pulse">★</span>
                        )}
                        {isClient && alarmedEvents.has(event.id) && !isEventLive(event) && (
                          <Bell className="w-4 h-4 text-[#39ff14] animate-pulse" />
                        )}
                      </div>
                      <h4 className="text-base font-bold truncate mt-1">{event.name}</h4>
                      {event.xpRewards.length > 0 && (
                        <div className="text-[10px] text-[#ffd700] mt-1 font-pixel">
                          <Trophy className="w-3 h-3 inline mr-1" />
                          MAX: {getMaxXP(event).toLocaleString('en-US')} XP
                        </div>
                      )}
                    </div>
                  </div>

                  <span 
                    className="text-[10px] px-3 py-1 border-2 shrink-0 font-pixel"
                    style={{ 
                      backgroundColor: event.roleColor + '15',
                      color: event.roleColor,
                      borderColor: event.roleColor + '60'
                    }}
                  >
                    {event.roleReq}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Alarms */}
        {isClient && alarmedEvents.size > 0 && (
          <div className="border-4 border-[#ffd700] bg-[#12121a] p-5 relative pixel-shadow">
            <div className="absolute top-0 left-0 w-4 h-4 bg-[#ffd700]" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-[#ffd700]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#ffd700]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ffd700]" />
            
            <div className="flex items-center gap-3 mb-4 border-b-3 border-[#2a2a4e] pb-3">
              <div className="w-8 h-8 border-2 border-[#ffd700] flex items-center justify-center">
                <BellRing className="w-4 h-4 text-[#ffd700] animate-pulse" />
              </div>
              <h3 className="text-[10px] font-pixel neon-text-gold">{t('myAlarms')} ({alarmedEvents.size})</h3>
            </div>
            <div className="space-y-2">
              {events.filter(e => alarmedEvents.has(e.id)).map((event) => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-3 border-3 border-[#ffd700]/30 bg-[#ffd700]/5 hover:bg-[#ffd700]/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {event.icon && (
                      <img 
                        src={event.icon} 
                        alt={event.name}
                        className="w-10 h-10 border-2 border-[#ffd700]"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    <Clock className="w-4 h-4 text-[#ffd700]" />
                    <span className="text-sm text-[#ffd700] font-pixel">{formatTimeWithLabel(event.timeUTC)}</span>
                    <span className="text-base">{event.name}</span>
                    <span className="text-[10px] text-[#8888aa]">({getDayName(event.day)})</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] text-[#ff0040] hover:text-[#ff0040] hover:bg-[#ff0040]/10 border-2 border-[#ff0040]/50 font-pixel"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleEventAlarm(event.id)
                    }}
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-4 border-[#2a2a4e] bg-[#0a0a0f] relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00fff7] via-[#ff00ff] to-[#39ff14] opacity-30" />
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[#ffd700]">★</span>
            <p className="text-[10px] font-pixel text-[#8888aa]">
              {t('footer')}
            </p>
            <span className="text-[#ffd700]">★</span>
          </div>
          <p className="text-[10px] text-[#2a2a4e] mt-2 font-pixel">
            PRESS START TO CONTINUE
          </p>
        </div>
      </footer>

      <RoleSystemModal open={roleModalOpen} onOpenChange={setRoleModalOpen} />
      <EventDetailModal
        event={selectedEvent}
        open={eventDetailOpen}
        onOpenChange={setEventDetailOpen}
        hasAlarm={selectedEvent ? alarmedEvents.has(selectedEvent.id) : false}
        onToggleAlarm={() => {
          if (selectedEvent) {
            toggleEventAlarm(selectedEvent.id)
          }
        }}
      />
      <AlarmListModal
        open={alarmListOpen}
        onOpenChange={setAlarmListOpen}
        alarmedEvents={getAlarmedEventObjects()}
        onRemoveAlarm={removeAlarm}
        onClearAll={clearAllAlarms}
      />
    </div>
  )
}

export default function Home() {
  const [pressStartComplete, setPressStartComplete] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  // Use useIsomorphicLayoutEffect to avoid hydration mismatch
  useIsomorphicLayoutEffect(() => {
    setMounted(true)
  }, [])
  
  const isGamingMode = mounted && theme === 'dark'
  
  // If gaming mode and press start not complete, show PressStart
  if (isGamingMode && !pressStartComplete) {
    return (
      <LanguageProvider>
        <PressStart onComplete={() => setPressStartComplete(true)} />
      </LanguageProvider>
    )
  }
  
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
