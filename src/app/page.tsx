'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { 
  Clock, Trophy, Bell, Users, Zap,
  Calendar, Sun, Moon,
  Star, Award, BellRing, Check, Globe,
  Gamepad2, Sword, Shield, Flame,
  Settings, Trash2, Edit, Plus, Save, X,
  Download, Upload, RotateCcw, BarChart3,
  AlertTriangle, Info, Lock, Unlock, Key
} from 'lucide-react'
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
  type Event, type Role, type FunctionalRole
} from '@/lib/events-data'
import { LanguageProvider, useLanguage, useDayName } from '@/lib/language-context'
import { PressStart } from '@/components/PressStart'
import { RoleBadgeTooltip } from '@/components/role-badge-tooltip'

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

// Current UTC time hook - returns time and date string
function useCurrentTime() {
  const { language } = useLanguage()
  const [time, setTime] = useState('')
  const [dateString, setDateString] = useState('')
  
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
        setDateString(now.toLocaleDateString('id-ID', { 
          timeZone: 'Asia/Jakarta',
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
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
        setDateString(now.toLocaleDateString('en-US', { 
          timeZone: 'UTC',
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }))
      }
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [language])

  return { time, dateString }
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

// Loading Spinner Component
function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  return (
    <div className={`${sizeClasses[size]} ${className} animate-spin`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  )
}

// Skeleton Loader Component
function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#2a2a4e] ${className}`} />
  )
}

// Event Card Skeleton
function EventCardSkeleton() {
  return (
    <div className="p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f]">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-14 h-14" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  )
}

// Stats Card Skeleton
function StatsCardSkeleton() {
  return (
    <div className="p-4 border-3 border-[#2a2a4e] bg-[#12121a] text-center">
      <Skeleton className="w-6 h-6 mx-auto mb-2" />
      <Skeleton className="h-8 w-16 mx-auto mb-1" />
      <Skeleton className="h-3 w-20 mx-auto" />
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
    // Toggle between Gaming Mode (dark) and Biasa Mode (light - white)
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const isGamingMode = mounted && theme === 'dark'

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
        <Sun className="w-5 h-5 text-foreground" />
      )}
    </Button>
  )
}

function LanguageToggle({ isGamingMode }: { isGamingMode: boolean }) {
  const { language, setLanguage } = useLanguage()

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`gap-1.5 text-xs ${isGamingMode ? 'border-3 border-[#ff00ff] bg-[#12121a] hover:bg-[#ff00ff]/20 font-bold' : ''}`}
      onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
    >
      <Globe className={`w-4 h-4 ${isGamingMode ? 'text-[#ff00ff]' : 'text-primary'}`} />
      <span className={`font-bold ${isGamingMode ? 'text-[#ff00ff]' : 'text-primary'}`}>{language === 'id' ? 'ID' : 'EN'}</span>
    </Button>
  )
}

function RoleSystemModal({ open, onOpenChange, customRoles, customFunctionalRoles }: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  customRoles: Role[]
  customFunctionalRoles: FunctionalRole[]
}) {
  const { t } = useLanguage()
  const getDayName = useDayName()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-[#ffd700]">
            <div className="w-8 h-8 border-2 border-[#ffd700] bg-[#12121a] flex items-center justify-center">
              <Award className="w-5 h-5 text-[#ffd700]" />
            </div>
            {t('roleSystem')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Role Hierarchy */}
          <section>
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#ff00ff]">
              <Sword className="w-4 h-4" />
              {t('roleHierarchy')}
            </h3>
            <div className="space-y-2">
              {customRoles.map((role, index) => (
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
                      <h4 className="text-sm font-bold" style={{ color: role.color, textShadow: `0 0 10px ${role.color}, 0 0 20px ${role.color}40` }}>
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
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#00fff7]">
              <Shield className="w-4 h-4" />
              {t('functionalRoles')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {customFunctionalRoles.map((role) => (
                <div key={role.name} className="p-2 border-3 border-[#2a2a4e] bg-[#12121a] hover:border-[#00fff7] transition-colors">
                  <h4 className="text-sm font-bold text-[#00fff7]">{role.name}</h4>
                  <p className="text-sm text-[#b8b8c8]">{role.requirements}</p>
                </div>
              ))}
            </div>
          </section>

          {/* XP & POAP Sources */}
          <section>
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#ffd700]">
              <Trophy className="w-4 h-4" />
              {t('xpPoapSources')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {xpPoapSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-2 border-3 border-[#2a2a4e] bg-[#12121a]">
                  <span className="text-sm text-[#b8b8c8]">{source.source}</span>
                  <div className="flex gap-1">
                    {source.xp && <span className="text-xs px-2 py-0.5 border-2 border-[#39ff14] text-[#39ff14] font-bold">XP</span>}
                    {source.poap && <span className="text-xs px-2 py-0.5 border-2 border-[#ff00ff] text-[#ff00ff] font-bold">POAP</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Monthly Contributor Highlights */}
          <section>
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#00fff7]">
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
                    <span className="text-sm font-bold text-[#ff00ff]">{highlight.category}</span>
                    <span className="text-xs font-bold text-[#ffd700]">
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
            <h3 className="text-base font-bold mb-3 text-[#ffff00] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ffff00]" />
              {t('importantNotes')}
            </h3>
            <div className="p-3 border-3 border-[#ffd700] bg-[#12121a]">
              <ul className="space-y-1">
                {importantNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-[#ffd700] font-bold">&gt;</span>
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
              <span className="text-lg font-bold text-[#00fff7]">{event.name}</span>
              {event.isSpecial && (
                <div className="mt-1">
                  <span className="text-xs px-2 py-0.5 border-2 border-[#ffd700] text-[#ffd700] font-bold bg-[#ffd700]/10">
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
              <span className="text-base font-bold text-[#00fff7]">{formatTimeWithLabel(event.timeUTC)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff00ff]" />
              <span className="text-[#ff00ff]">{getDayName(event.day)}</span>
            </div>
          </div>

          {/* Role Requirement */}
          <div className="flex items-center gap-2 p-3 border-3 border-[#2a2a4e] bg-[#0a0a0f]">
            <Users className="w-5 h-5 text-[#8888aa]" />
            <RoleBadgeTooltip roleName={event.roleReq} roleColor={event.roleColor} t={t}>
              <span 
                className="text-sm font-bold px-3 py-1 border-3 cursor-pointer"
                style={{ 
                  borderColor: event.roleColor,
                  color: event.roleColor,
                  backgroundColor: event.roleColor + '20'
                }}
              >
                {event.roleReq}
              </span>
            </RoleBadgeTooltip>
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
                <span className="text-sm px-3 py-1.5 border-3 border-[#ff00ff] text-[#ff00ff] font-bold bg-[#ff00ff]/10">
                  <Star className="w-4 h-4 inline mr-1" /> POAP
                </span>
              )}
              {event.hasInsight && (
                <span className="text-sm px-3 py-1.5 border-3 border-[#00fff7] text-[#00fff7] font-bold bg-[#00fff7]/10">
                  <Zap className="w-4 h-4 inline mr-1" /> Insight
                </span>
              )}
            </div>
          )}

          {/* XP Rewards */}
          {event.xpRewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-[#ffd700]/10 border-3 border-[#ffd700]">
                <h4 className="text-base font-bold flex items-center gap-2 text-[#ffd700]">
                  <Trophy className="w-5 h-5" />
                  {t('xpRewards')}
                </h4>
                <span className="text-base font-bold text-[#ffd700]">
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
              className="flex-1 border-3 border-[#00fff7] bg-[#00fff7] text-[#0a0a0f] hover:bg-[#39ff14] hover:border-[#39ff14] font-bold text-sm"
              onClick={() => {
                window.open(event.link || 'https://discord.gg/genlayer', '_blank')
              }}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              {t('joinEvent')}
            </Button>
            
            <Button
              variant="outline"
              className={`border-3 font-bold text-sm ${hasAlarm ? 'border-[#39ff14] bg-[#39ff14]/20 text-[#39ff14]' : 'border-[#ff00ff] text-[#ff00ff] bg-transparent'}`}
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
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-[#ffd700]">
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
                    <h4 className="text-sm font-bold text-[#00fff7] truncate">{event.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-[#8888aa] mt-1">
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
              className="w-full border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 font-bold text-sm"
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

// Confirmation Dialog Component
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: 'danger' | 'warning' | 'info'
  isGamingMode?: boolean
}

function ConfirmDialog({ 
  open, 
  onOpenChange, 
  title, 
  message, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'danger',
  isGamingMode = true
}: ConfirmDialogProps) {
  const variantColors = {
    danger: { border: '#ff0040', bg: '#ff0040', text: '#ff0040' },
    warning: { border: '#ffd700', bg: '#ffd700', text: '#ffd700' },
    info: { border: '#00fff7', bg: '#00fff7', text: '#00fff7' }
  }
  const colors = variantColors[variant]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex flex-col items-center text-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isGamingMode ? 'border-3' : 'border-2'}`} style={{ borderColor: colors.border }}>
            {variant === 'danger' && <AlertTriangle className="w-8 h-8" style={{ color: colors.text }} />}
            {variant === 'warning' && <Info className="w-8 h-8" style={{ color: colors.text }} />}
            {variant === 'info' && <Info className="w-8 h-8" style={{ color: colors.text }} />}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${isGamingMode ? 'text-white' : 'text-foreground'}`}>{title}</h3>
          <p className={`text-sm mb-6 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>{message}</p>
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              className="flex-1 font-bold"
              style={{ backgroundColor: colors.bg, color: variant === 'info' ? '#0a0a0f' : 'white' }}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
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
        
        <h2 className="text-xl font-bold text-[#39ff14] mb-2">🔔 ALARM!</h2>
        <p className="text-sm text-[#b8b8c8] whitespace-pre-line mb-6">{message}</p>
        
        <Button
          className="bg-[#39ff14] text-[#0a0a0f] font-bold hover:bg-[#39ff14]/80"
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
                <span className="text-sm text-[#72767d]">•</span>
                <span className="text-sm text-[#72767d]">Just now</span>
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
        <div className="px-3 pb-2 text-sm text-[#72767d]">
          Click to open
        </div>
      </div>
    </motion.div>
  )
}

function NotificationBanner({ message, onClose }: { message: string; onClose: () => void }) {
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
      <span className="text-sm font-bold text-[#39ff14]">{message}</span>
      <button onClick={onClose} className="ml-2 text-[#8888aa] hover:text-[#ff0040] text-xl font-bold">
        ×
      </button>
    </motion.div>
  )
}

// Password Protection Modal
function PasswordModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Default password is 'admin123' - stored in localStorage for customization
  const correctPassword = typeof window !== 'undefined' 
    ? localStorage.getItem('genlayer-admin-password') || 'admin123'
    : 'admin123'

  const handleSubmit = () => {
    if (password === correctPassword) {
      setError('')
      setPassword('')
      onSuccess()
    } else {
      setError('Incorrect password!')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-[#ffd700]">
            <div className="w-8 h-8 border-2 border-[#ffd700] bg-[#12121a] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#ffd700]" />
            </div>
            Admin Access
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-[#8888aa]">Enter admin password to access the admin panel.</p>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-3 text-sm focus:border-[#ffd700] outline-none pr-10"
              placeholder="Enter password..."
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-white"
            >
              {showPassword ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-sm text-[#ff0040]">{error}</p>}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-2 border-[#8888aa] text-[#8888aa]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#ffd700] text-[#0a0a0f] font-bold" onClick={handleSubmit}>
              <Key className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          </div>
          <p className="text-xs text-[#666688] text-center">Default password: admin123</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Admin Panel Modal with Tabs
function AdminPanelModal({ 
  open, 
  onOpenChange,
  events: allEvents,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  customRoles,
  onAddRole,
  onEditRole,
  onDeleteRole,
  customFunctionalRoles,
  onAddFunctionalRole,
  onEditFunctionalRole,
  onDeleteFunctionalRole,
  onExportData,
  onImportData,
  onResetToDefault
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  events: Event[]
  onAddEvent: (event: Event) => void
  onEditEvent: (event: Event) => void
  onDeleteEvent: (eventId: string) => void
  customRoles: Role[]
  onAddRole: (role: Role) => void
  onEditRole: (role: Role) => void
  onDeleteRole: (roleName: string) => void
  customFunctionalRoles: FunctionalRole[]
  onAddFunctionalRole: (role: FunctionalRole) => void
  onEditFunctionalRole: (role: FunctionalRole) => void
  onDeleteFunctionalRole: (roleName: string) => void
  onExportData: () => void
  onImportData: (data: { events: Event[], roles: Role[], functionalRoles: FunctionalRole[] }) => void
  onResetToDefault: () => void
}) {
  const { t } = useLanguage()
  const getDayName = useDayName()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'roles' | 'functional'>('dashboard')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [editingFunctionalRole, setEditingFunctionalRole] = useState<FunctionalRole | null>(null)
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL')
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: 'danger' | 'warning' | 'info'
  }>({ open: false, title: '', message: '', onConfirm: () => {}, variant: 'danger' })
  
  const showConfirmDialog = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' = 'danger') => {
    setConfirmDialog({ open: true, title, message, onConfirm, variant })
  }
  
  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form state for events
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    day: 'MONDAY',
    timeUTC: '14:00',
    time: '2:00 PM',
    description: '',
    roleReq: 'Molecule+',
    roleColor: '#eab308',
    duration: 60,
    link: '',
    hasPOAP: false,
    hasInsight: false,
    isSpecial: false,
    icon: '',
  })

  // Form state for roles
  const [roleFormData, setRoleFormData] = useState<Partial<Role>>({
    name: '',
    emoji: '🟡',
    requirements: '',
    perks: '',
    color: '#eab308',
  })

  // Form state for functional roles
  const [funcRoleFormData, setFuncRoleFormData] = useState<Partial<FunctionalRole>>({
    name: '',
    requirements: '',
    perks: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      day: 'MONDAY',
      timeUTC: '14:00',
      time: '2:00 PM',
      description: '',
      roleReq: 'Molecule+',
      roleColor: '#eab308',
      duration: 60,
      link: '',
      hasPOAP: false,
      hasInsight: false,
      isSpecial: false,
      icon: '',
    })
    setRoleFormData({
      name: '',
      emoji: '🟡',
      requirements: '',
      perks: '',
      color: '#eab308',
    })
    setFuncRoleFormData({
      name: '',
      requirements: '',
      perks: '',
    })
    setIsAddingNew(false)
    setEditingEvent(null)
    setEditingRole(null)
    setEditingFunctionalRole(null)
  }

  // Handle file import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.events && data.roles && data.functionalRoles) {
          showConfirmDialog(
            'Import Data',
            `This will replace all current data with ${data.events.length} events, ${data.roles.length} roles, and ${data.functionalRoles.length} functional roles. Continue?`,
            () => {
              onImportData(data)
              resetForm()
            },
            'warning'
          )
        } else {
          alert('Invalid file format. Expected { events, roles, functionalRoles }')
        }
      } catch (err) {
        alert('Failed to parse JSON file')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Calculate statistics for dashboard
  const stats = {
    totalEvents: allEvents.length,
    customEvents: allEvents.filter(e => e.id.startsWith('custom-')).length,
    eventsWithPOAP: allEvents.filter(e => e.hasPOAP).length,
    eventsWithInsight: allEvents.filter(e => e.hasInsight).length,
    specialEvents: allEvents.filter(e => e.isSpecial).length,
    eventsByDay: DAYS.map(day => ({
      day,
      count: allEvents.filter(e => e.day === day).length
    })),
    totalRoles: customRoles.length,
    totalFunctionalRoles: customFunctionalRoles.length,
  }

  const handleEventSubmit = () => {
    if (!formData.name || !formData.day || !formData.timeUTC) return
    
    const newEvent: Event = {
      id: editingEvent?.id || `custom-${Date.now()}`,
      name: formData.name || '',
      day: formData.day || 'MONDAY',
      timeUTC: formData.timeUTC || '14:00',
      time: formData.time || formData.timeUTC || '2:00 PM',
      description: formData.description,
      roleReq: formData.roleReq || 'Molecule+',
      roleColor: formData.roleColor || '#eab308',
      duration: formData.duration || 60,
      link: formData.link,
      hasPOAP: formData.hasPOAP,
      hasInsight: formData.hasInsight,
      isSpecial: formData.isSpecial,
      icon: formData.icon,
      xpRewards: [],
    }

    if (editingEvent) {
      onEditEvent(newEvent)
    } else {
      onAddEvent(newEvent)
    }
    resetForm()
  }

  const handleRoleSubmit = () => {
    if (!roleFormData.name) return
    
    const newRole: Role = {
      name: roleFormData.name || '',
      emoji: roleFormData.emoji || '🟡',
      requirements: roleFormData.requirements || '',
      perks: roleFormData.perks || '',
      color: roleFormData.color || '#eab308',
    }

    if (editingRole) {
      onEditRole(newRole)
    } else {
      onAddRole(newRole)
    }
    resetForm()
  }

  const handleFunctionalRoleSubmit = () => {
    if (!funcRoleFormData.name) return
    
    const newRole: FunctionalRole = {
      name: funcRoleFormData.name || '',
      requirements: funcRoleFormData.requirements || '',
      perks: funcRoleFormData.perks || '',
    }

    if (editingFunctionalRole) {
      onEditFunctionalRole(newRole)
    } else {
      onAddFunctionalRole(newRole)
    }
    resetForm()
  }

  const startEditEvent = (event: Event) => {
    setFormData({
      name: event.name,
      day: event.day,
      timeUTC: event.timeUTC,
      time: event.time,
      description: event.description,
      roleReq: event.roleReq,
      roleColor: event.roleColor,
      duration: event.duration,
      link: event.link,
      hasPOAP: event.hasPOAP,
      hasInsight: event.hasInsight,
      isSpecial: event.isSpecial,
      icon: event.icon,
    })
    setEditingEvent(event)
    setIsAddingNew(true)
    setActiveTab('events')
  }

  const startEditRole = (role: Role) => {
    setRoleFormData({
      name: role.name,
      emoji: role.emoji,
      requirements: role.requirements,
      perks: role.perks,
      color: role.color,
    })
    setEditingRole(role)
    setIsAddingNew(true)
    setActiveTab('roles')
  }

  const startEditFunctionalRole = (role: FunctionalRole) => {
    setFuncRoleFormData({
      name: role.name,
      requirements: role.requirements,
      perks: role.perks,
    })
    setEditingFunctionalRole(role)
    setIsAddingNew(true)
    setActiveTab('functional')
  }

  const filteredEvents = selectedDayFilter === 'ALL' 
    ? allEvents 
    : allEvents.filter(e => e.day === selectedDayFilter)

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); resetForm() }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-bold text-[#ffd700]">
            <div className="w-8 h-8 border-2 border-[#ffd700] bg-[#12121a] flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#ffd700]" />
            </div>
            ⚙️ Admin Panel
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b-2 border-[#2a2a4e] pb-2 flex-wrap">
          <Button
            size="sm"
            className={`gap-2 font-bold text-xs ${activeTab === 'dashboard' ? 'bg-[#ffd700] text-[#0a0a0f]' : 'bg-transparent text-[#8888aa] hover:text-[#ffd700]'}`}
            onClick={() => { setActiveTab('dashboard'); resetForm(); }}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Button>
          <Button
            size="sm"
            className={`gap-2 font-bold text-xs ${activeTab === 'events' ? 'bg-[#00fff7] text-[#0a0a0f]' : 'bg-transparent text-[#8888aa] hover:text-[#00fff7]'}`}
            onClick={() => { setActiveTab('events'); resetForm(); }}
          >
            <Calendar className="w-4 h-4" />
            Events
          </Button>
          <Button
            size="sm"
            className={`gap-2 font-bold text-xs ${activeTab === 'roles' ? 'bg-[#ff00ff] text-white' : 'bg-transparent text-[#8888aa] hover:text-[#ff00ff]'}`}
            onClick={() => { setActiveTab('roles'); resetForm(); }}
          >
            <Award className="w-4 h-4" />
            Roles
          </Button>
          <Button
            size="sm"
            className={`gap-2 font-bold text-xs ${activeTab === 'functional' ? 'bg-[#39ff14] text-[#0a0a0f]' : 'bg-transparent text-[#8888aa] hover:text-[#39ff14]'}`}
            onClick={() => { setActiveTab('functional'); resetForm(); }}
          >
            <Shield className="w-4 h-4" />
            Functional
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {/* ========== DASHBOARD TAB ========== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 border-3 border-[#00fff7] bg-[#12121a] text-center">
                  <Calendar className="w-6 h-6 text-[#00fff7] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#00fff7]">{stats.totalEvents}</div>
                  <div className="text-xs text-[#8888aa]">Total Events</div>
                </div>
                <div className="p-4 border-3 border-[#ff00ff] bg-[#12121a] text-center">
                  <Award className="w-6 h-6 text-[#ff00ff] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#ff00ff]">{stats.totalRoles}</div>
                  <div className="text-xs text-[#8888aa]">Roles</div>
                </div>
                <div className="p-4 border-3 border-[#39ff14] bg-[#12121a] text-center">
                  <Shield className="w-6 h-6 text-[#39ff14] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#39ff14]">{stats.totalFunctionalRoles}</div>
                  <div className="text-xs text-[#8888aa]">Functional</div>
                </div>
                <div className="p-4 border-3 border-[#ffd700] bg-[#12121a] text-center">
                  <Star className="w-6 h-6 text-[#ffd700] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-[#ffd700]">{stats.specialEvents}</div>
                  <div className="text-xs text-[#8888aa]">Special Events</div>
                </div>
              </div>

              {/* Events by Day */}
              <div className="p-4 border-3 border-[#2a2a4e] bg-[#12121a]">
                <h3 className="text-sm font-bold text-[#00fff7] mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Events by Day
                </h3>
                <div className="grid grid-cols-7 gap-1">
                  {stats.eventsByDay.map(({ day, count }) => (
                    <div key={day} className="text-center p-2 border-2 border-[#2a2a4e] bg-[#0a0a0f]">
                      <div className="text-xs text-[#8888aa]">{day.slice(0, 3)}</div>
                      <div className="text-lg font-bold text-[#00fff7]">{count}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-3 border-[#ff00ff] bg-[#12121a]">
                  <div className="text-xs text-[#8888aa]">Events with POAP</div>
                  <div className="text-xl font-bold text-[#ff00ff]">{stats.eventsWithPOAP}</div>
                </div>
                <div className="p-3 border-3 border-[#00fff7] bg-[#12121a]">
                  <div className="text-xs text-[#8888aa]">Events with Insight</div>
                  <div className="text-xl font-bold text-[#00fff7]">{stats.eventsWithInsight}</div>
                </div>
              </div>

              {/* Export/Import/Reset Buttons */}
              <div className="p-4 border-3 border-[#ffd700] bg-[#12121a]">
                <h3 className="text-sm font-bold text-[#ffd700] mb-3">Data Management</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2 bg-[#00fff7] text-[#0a0a0f] font-bold"
                    onClick={onExportData}
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </Button>
                  <Button
                    className="gap-2 bg-[#39ff14] text-[#0a0a0f] font-bold"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Import JSON
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                  <Button
                    className="gap-2 bg-[#ff0040] text-white font-bold"
                    onClick={() => {
                      showConfirmDialog(
                        'Reset to Default',
                        'This will delete ALL custom data and reset everything to default. This action cannot be undone!',
                        onResetToDefault,
                        'danger'
                      )
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Default
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========== EVENTS TAB ========== */}
          {activeTab === 'events' && (
            <>
              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <Button
                    className={`gap-2 font-bold ${isAddingNew && activeTab === 'events' ? 'bg-[#ff0040] text-white' : 'bg-[#39ff14] text-[#0a0a0f]'}`}
                    onClick={() => {
                      if (isAddingNew) {
                        resetForm()
                      } else {
                        setIsAddingNew(true)
                      }
                    }}
                  >
                    {isAddingNew && activeTab === 'events' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAddingNew && activeTab === 'events' ? 'Cancel' : 'Add New Event'}
                  </Button>
                </div>
                
                {/* Day Filter */}
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedDayFilter === 'ALL' ? 'default' : 'outline'}
                    className={`text-xs ${selectedDayFilter === 'ALL' ? 'bg-[#00fff7] text-[#0a0a0f]' : ''}`}
                    onClick={() => setSelectedDayFilter('ALL')}
                  >
                    ALL
                  </Button>
                  {DAYS.map(day => (
                    <Button
                      key={day}
                      size="sm"
                      variant={selectedDayFilter === day ? 'default' : 'outline'}
                      className={`text-xs ${selectedDayFilter === day ? 'bg-[#ff00ff] text-white' : ''}`}
                      onClick={() => setSelectedDayFilter(day)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

          {/* Add/Edit Event Form */}
          {isAddingNew && activeTab === 'events' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border-3 border-[#ffd700] bg-[#12121a] p-4 space-y-3"
            >
              <h3 className="text-[#ffd700] font-bold flex items-center gap-2">
                {editingEvent ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8888aa]">Event Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                    placeholder="Event name..."
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8888aa]">Icon URL</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                    placeholder="/icons/event.png"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8888aa]">Day *</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#8888aa]">Time (UTC) *</label>
                  <input
                    type="time"
                    value={formData.timeUTC}
                    onChange={(e) => setFormData({...formData, timeUTC: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8888aa]">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                    placeholder="60"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8888aa]">Role Required</label>
                  <select
                    value={formData.roleReq}
                    onChange={(e) => setFormData({...formData, roleReq: e.target.value, roleColor: e.target.value === 'Neuron+' ? '#f97316' : e.target.value === 'Brain+' ? '#a855f7' : '#eab308'})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                  >
                    {customRoles.map(role => (
                      <option key={role.name} value={role.name + '+'}>{role.name}+</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-[#8888aa]">Discord/Event Link</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none"
                    placeholder="https://discord.com/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-[#8888aa]">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#00fff7] outline-none resize-none"
                    rows={2}
                    placeholder="Event description..."
                  />
                </div>
                <div className="md:col-span-2 flex gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.hasPOAP} onChange={(e) => setFormData({...formData, hasPOAP: e.target.checked})} className="w-4 h-4 accent-[#ff00ff]" />
                    <span className="text-[#ff00ff]">🎁 POAP</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.hasInsight} onChange={(e) => setFormData({...formData, hasInsight: e.target.checked})} className="w-4 h-4 accent-[#00fff7]" />
                    <span className="text-[#00fff7]">⚡ Insight</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.isSpecial} onChange={(e) => setFormData({...formData, isSpecial: e.target.checked})} className="w-4 h-4 accent-[#ffd700]" />
                    <span className="text-[#ffd700]">⭐ Special</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="border-2 border-[#8888aa] text-[#8888aa]" onClick={resetForm}>Cancel</Button>
                <Button className="bg-[#39ff14] text-[#0a0a0f] font-bold gap-2" onClick={handleEventSubmit}>
                  <Save className="w-4 h-4" />
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Events List */}
          <div className="space-y-2">
            <h3 className="text-[#00fff7] font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Events List ({filteredEvents.length})
            </h3>
            <div className="max-h-[35vh] overflow-y-auto custom-scrollbar space-y-1">
              {filteredEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-2 border-2 border-[#2a2a4e] bg-[#0a0a0f] hover:border-[#00fff7] transition-colors"
                >
                  {event.icon && (
                    <img src={event.icon} alt="" className="w-8 h-8 border border-[#2a2a4e]" style={{ imageRendering: 'pixelated' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#00fff7] truncate">{event.name}</h4>
                      {event.isSpecial && <span className="text-yellow-500">★</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8888aa]">
                      <span className="text-[#ff00ff]">{getDayName(event.day)}</span>
                      <span>•</span>
                      <span>{event.timeUTC} UTC</span>
                      <span>•</span>
                      <span style={{ color: event.roleColor }}>{event.roleReq}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {event.hasPOAP && <span title="POAP">🎁</span>}
                    {event.hasInsight && <span title="Insight">⚡</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEditEvent(event)} className="p-1.5 border-2 border-[#00fff7] text-[#00fff7] hover:bg-[#00fff7]/20 transition-colors" title="Edit">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => {
                        showConfirmDialog(
                          'Delete Event',
                          `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
                          () => onDeleteEvent(event.id),
                          'danger'
                        )
                      }} 
                      className="p-1.5 border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
            </>
          )}

          {/* ========== ROLES TAB ========== */}
          {activeTab === 'roles' && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Button
                  className={`gap-2 font-bold ${isAddingNew && activeTab === 'roles' ? 'bg-[#ff0040] text-white' : 'bg-[#ff00ff] text-white'}`}
                  onClick={() => {
                    if (isAddingNew) {
                      resetForm()
                    } else {
                      setIsAddingNew(true)
                    }
                  }}
                >
                  {isAddingNew && activeTab === 'roles' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingNew && activeTab === 'roles' ? 'Cancel' : 'Add New Role'}
                </Button>
              </div>

              {/* Add/Edit Role Form */}
              {isAddingNew && activeTab === 'roles' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-3 border-[#ff00ff] bg-[#12121a] p-4 space-y-3"
                >
                  <h3 className="text-[#ff00ff] font-bold flex items-center gap-2">
                    {editingRole ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingRole ? 'Edit Role' : 'New Role'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#8888aa]">Role Name *</label>
                      <input
                        type="text"
                        value={roleFormData.name}
                        onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#ff00ff] outline-none"
                        placeholder="Role name..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8888aa]">Emoji</label>
                      <input
                        type="text"
                        value={roleFormData.emoji}
                        onChange={(e) => setRoleFormData({...roleFormData, emoji: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#ff00ff] outline-none"
                        placeholder="🟡"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8888aa]">Color (hex)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={roleFormData.color}
                          onChange={(e) => setRoleFormData({...roleFormData, color: e.target.value})}
                          className="w-10 h-9 border-2 border-[#2a2a4e] cursor-pointer"
                        />
                        <input
                          type="text"
                          value={roleFormData.color}
                          onChange={(e) => setRoleFormData({...roleFormData, color: e.target.value})}
                          className="flex-1 bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#ff00ff] outline-none"
                          placeholder="#eab308"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#8888aa]">Requirements</label>
                      <input
                        type="text"
                        value={roleFormData.requirements}
                        onChange={(e) => setRoleFormData({...roleFormData, requirements: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#ff00ff] outline-none"
                        placeholder="Level 1..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-[#8888aa]">Perks</label>
                      <input
                        type="text"
                        value={roleFormData.perks}
                        onChange={(e) => setRoleFormData({...roleFormData, perks: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#ff00ff] outline-none"
                        placeholder="Access to channels..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="border-2 border-[#8888aa] text-[#8888aa]" onClick={resetForm}>Cancel</Button>
                    <Button className="bg-[#ff00ff] text-white font-bold gap-2" onClick={handleRoleSubmit}>
                      <Save className="w-4 h-4" />
                      {editingRole ? 'Update Role' : 'Add Role'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Roles List */}
              <div className="space-y-2">
                <h3 className="text-[#ff00ff] font-bold flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Roles Hierarchy ({customRoles.length})
                </h3>
                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar space-y-1">
                  {customRoles.map((role, index) => (
                    <motion.div
                      key={role.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 border-2 border-[#2a2a4e] bg-[#0a0a0f] hover:border-[#ff00ff] transition-colors"
                    >
                      <span className="text-2xl">{role.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate" style={{ color: role.color, textShadow: `0 0 10px ${role.color}40` }}>{role.name}</h4>
                        <p className="text-xs text-[#8888aa] truncate">{role.requirements}</p>
                        <p className="text-xs text-[#b8b8c8] truncate">✨ {role.perks}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditRole(role)} className="p-1.5 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/20 transition-colors" title="Edit">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            showConfirmDialog(
                              'Delete Role',
                              `Are you sure you want to delete role "${role.name}"? This action cannot be undone.`,
                              () => onDeleteRole(role.name),
                              'danger'
                            )
                          }} 
                          className="p-1.5 border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ========== FUNCTIONAL ROLES TAB ========== */}
          {activeTab === 'functional' && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Button
                  className={`gap-2 font-bold ${isAddingNew && activeTab === 'functional' ? 'bg-[#ff0040] text-white' : 'bg-[#39ff14] text-[#0a0a0f]'}`}
                  onClick={() => {
                    if (isAddingNew) {
                      resetForm()
                    } else {
                      setIsAddingNew(true)
                    }
                  }}
                >
                  {isAddingNew && activeTab === 'functional' ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingNew && activeTab === 'functional' ? 'Cancel' : 'Add New Functional Role'}
                </Button>
              </div>

              {/* Add/Edit Functional Role Form */}
              {isAddingNew && activeTab === 'functional' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border-3 border-[#39ff14] bg-[#12121a] p-4 space-y-3"
                >
                  <h3 className="text-[#39ff14] font-bold flex items-center gap-2">
                    {editingFunctionalRole ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingFunctionalRole ? 'Edit Functional Role' : 'New Functional Role'}
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs text-[#8888aa]">Role Name *</label>
                      <input
                        type="text"
                        value={funcRoleFormData.name}
                        onChange={(e) => setFuncRoleFormData({...funcRoleFormData, name: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#39ff14] outline-none"
                        placeholder="Role name..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8888aa]">Requirements</label>
                      <input
                        type="text"
                        value={funcRoleFormData.requirements}
                        onChange={(e) => setFuncRoleFormData({...funcRoleFormData, requirements: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#39ff14] outline-none"
                        placeholder="How to get this role..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#8888aa]">Perks</label>
                      <input
                        type="text"
                        value={funcRoleFormData.perks}
                        onChange={(e) => setFuncRoleFormData({...funcRoleFormData, perks: e.target.value})}
                        className="w-full bg-[#0a0a0f] border-2 border-[#2a2a4e] text-white p-2 text-sm focus:border-[#39ff14] outline-none"
                        placeholder="What this role gives..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" className="border-2 border-[#8888aa] text-[#8888aa]" onClick={resetForm}>Cancel</Button>
                    <Button className="bg-[#39ff14] text-[#0a0a0f] font-bold gap-2" onClick={handleFunctionalRoleSubmit}>
                      <Save className="w-4 h-4" />
                      {editingFunctionalRole ? 'Update Role' : 'Add Role'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Functional Roles List */}
              <div className="space-y-2">
                <h3 className="text-[#39ff14] font-bold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Functional Roles ({customFunctionalRoles.length})
                </h3>
                <div className="max-h-[40vh] overflow-y-auto custom-scrollbar space-y-1">
                  {customFunctionalRoles.map((role, index) => (
                    <motion.div
                      key={role.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 border-2 border-[#2a2a4e] bg-[#0a0a0f] hover:border-[#39ff14] transition-colors"
                    >
                      <Shield className="w-6 h-6 text-[#39ff14]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#39ff14] truncate">{role.name}</h4>
                        <p className="text-xs text-[#8888aa] truncate">📋 {role.requirements}</p>
                        <p className="text-xs text-[#b8b8c8] truncate">✨ {role.perks}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditFunctionalRole(role)} className="p-1.5 border-2 border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/20 transition-colors" title="Edit">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => {
                            showConfirmDialog(
                              'Delete Functional Role',
                              `Are you sure you want to delete "${role.name}"? This action cannot be undone.`,
                              () => onDeleteFunctionalRole(role.name),
                              'danger'
                            )
                          }} 
                          className="p-1.5 border-2 border-[#ff0040] text-[#ff0040] hover:bg-[#ff0040]/20 transition-colors" 
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          variant={confirmDialog.variant}
        />
      </DialogContent>
    </Dialog>
  )
}

function AppContent() {
  const { t, language, formatTimeWithLabel } = useLanguage()
  const getDayName = useDayName()
  const { theme } = useTheme()
  
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
  
  // Admin mode states
  const [adminMode, setAdminMode] = useState(false)
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [customEvents, setCustomEvents] = useState<Event[]>([])
  const customEventsLoadedRef = useRef(false)
  const [customRoles, setCustomRoles] = useState<Role[]>([...roles])
  const rolesLoadedRef = useRef(false)
  const [customFunctionalRoles, setCustomFunctionalRoles] = useState<FunctionalRole[]>([...functionalRoles])
  const functionalRolesLoadedRef = useRef(false)

  // Determine if gaming mode (dark theme) is active - only after client mount to avoid hydration mismatch
  const isGamingMode = isClient && theme === 'dark'

  const [backgroundTestCountdown, setBackgroundTestCountdown] = useState<number | null>(null)
  const [toastData, setToastData] = useState<{ title: string; message: string; icon?: string; eventId?: string } | null>(null)

  const { time: currentTime, dateString: currentDateString } = useCurrentTime()
  
  // Combine default events with custom events
  const allEvents = [...events, ...customEvents]
  
  // Get next event from all events
  const getNextEventCustom = useCallback(() => {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    // Check today's events first
    const todayEvents = allEvents.filter(e => e.day === days[currentDay]);
    for (const event of todayEvents) {
      const [hours, minutes] = event.timeUTC.split(':').map(Number);
      const eventTimeInMinutes = hours * 60 + minutes;
      if (eventTimeInMinutes > currentTimeInMinutes) {
        return event;
      }
    }

    // Check next days
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDay + i) % 7;
      const nextDayEvents = allEvents.filter(e => e.day === days[nextDayIndex]);
      if (nextDayEvents.length > 0) {
        return nextDayEvents.sort((a, b) => {
          const [hA, mA] = a.timeUTC.split(':').map(Number);
          const [hB, mB] = b.timeUTC.split(':').map(Number);
          return (hA * 60 + mA) - (hB * 60 + mB);
        })[0];
      }
    }
    return null;
  }, [allEvents]);
  
  const nextEvent = getNextEventCustom()
  const countdown = useCountdown(nextEvent?.timeUTC || '00:00', nextEvent?.day || 'MONDAY')
  const filteredEvents = allEvents.filter(e => e.day === selectedDay)
  const todayEvents = allEvents.filter(e => e.day === ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getUTCDay()])

  const alarmEnabled = alarmedEvents.size > 0
  const alarmsLoadedRef = useRef(false)

  // Set client mount state
  useIsomorphicLayoutEffect(() => {
    setIsClient(true)
  }, [])

  // Load custom events from localStorage
  useEffect(() => {
    if (isClient && !customEventsLoadedRef.current) {
      customEventsLoadedRef.current = true
      const saved = localStorage.getItem('genlayer-custom-events')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Event[]
          if (parsed.length > 0) {
            // Defer setState to avoid cascading renders warning
            setTimeout(() => {
              setCustomEvents(parsed)
            }, 0)
          }
        } catch { }
      }
    }
  }, [isClient])

  // Save custom events to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && customEventsLoadedRef.current) {
      localStorage.setItem('genlayer-custom-events', JSON.stringify(customEvents))
    }
  }, [customEvents])

  // Admin event handlers
  const handleAddEvent = useCallback((event: Event) => {
    setCustomEvents(prev => [...prev, event])
    setNotification(`✅ Event "${event.name}" added!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleEditEvent = useCallback((updatedEvent: Event) => {
    setCustomEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e))
    // Also update in main events if it's a default event
    setNotification(`✅ Event "${updatedEvent.name}" updated!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleDeleteEvent = useCallback((eventId: string) => {
    setCustomEvents(prev => prev.filter(e => e.id !== eventId))
    // Also remove from alarms if it was alarmed
    setAlarmedEvents(prev => {
      const newSet = new Set(prev)
      newSet.delete(eventId)
      return newSet
    })
    setNotification(`🗑️ Event deleted!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Load roles from localStorage
  useEffect(() => {
    if (isClient && !rolesLoadedRef.current) {
      rolesLoadedRef.current = true
      const saved = localStorage.getItem('genlayer-custom-roles')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Role[]
          if (parsed.length > 0) {
            setTimeout(() => {
              setCustomRoles(parsed)
            }, 0)
          }
        } catch { }
      }
    }
  }, [isClient])

  // Save roles to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && rolesLoadedRef.current) {
      localStorage.setItem('genlayer-custom-roles', JSON.stringify(customRoles))
    }
  }, [customRoles])

  // Load functional roles from localStorage
  useEffect(() => {
    if (isClient && !functionalRolesLoadedRef.current) {
      functionalRolesLoadedRef.current = true
      const saved = localStorage.getItem('genlayer-custom-functional-roles')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as FunctionalRole[]
          if (parsed.length > 0) {
            setTimeout(() => {
              setCustomFunctionalRoles(parsed)
            }, 0)
          }
        } catch { }
      }
    }
  }, [isClient])

  // Save functional roles to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && functionalRolesLoadedRef.current) {
      localStorage.setItem('genlayer-custom-functional-roles', JSON.stringify(customFunctionalRoles))
    }
  }, [customFunctionalRoles])

  // Role handlers
  const handleAddRole = useCallback((role: Role) => {
    setCustomRoles(prev => [...prev, role])
    setNotification(`✅ Role "${role.name}" added!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleEditRole = useCallback((updatedRole: Role) => {
    setCustomRoles(prev => prev.map(r => r.name === updatedRole.name ? updatedRole : r))
    setNotification(`✅ Role "${updatedRole.name}" updated!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleDeleteRole = useCallback((roleName: string) => {
    setCustomRoles(prev => prev.filter(r => r.name !== roleName))
    setNotification(`🗑️ Role deleted!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Functional role handlers
  const handleAddFunctionalRole = useCallback((role: FunctionalRole) => {
    setCustomFunctionalRoles(prev => [...prev, role])
    setNotification(`✅ Functional Role "${role.name}" added!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleEditFunctionalRole = useCallback((updatedRole: FunctionalRole) => {
    setCustomFunctionalRoles(prev => prev.map(r => r.name === updatedRole.name ? updatedRole : r))
    setNotification(`✅ Functional Role "${updatedRole.name}" updated!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const handleDeleteFunctionalRole = useCallback((roleName: string) => {
    setCustomFunctionalRoles(prev => prev.filter(r => r.name !== roleName))
    setNotification(`🗑️ Functional Role deleted!`)
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Export data handler
  const handleExportData = useCallback(() => {
    const data = {
      events: customEvents,
      roles: customRoles,
      functionalRoles: customFunctionalRoles,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `genlayer-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setNotification('✅ Data exported successfully!')
    setTimeout(() => setNotification(null), 3000)
  }, [customEvents, customRoles, customFunctionalRoles])

  // Import data handler
  const handleImportData = useCallback((data: { events: Event[], roles: Role[], functionalRoles: FunctionalRole[] }) => {
    setCustomEvents(data.events || [])
    setCustomRoles(data.roles || [...roles])
    setCustomFunctionalRoles(data.functionalRoles || [...functionalRoles])
    setNotification('✅ Data imported successfully!')
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // Reset to default handler
  const handleResetToDefault = useCallback(() => {
    setCustomEvents([])
    setCustomRoles([...roles])
    setCustomFunctionalRoles([...functionalRoles])
    setNotification('✅ Data reset to default!')
    setTimeout(() => setNotification(null), 3000)
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
    <div className={`min-h-screen flex flex-col relative ${isGamingMode ? 'bg-[#0a0a0f] text-[#e0e0e0] retro-grid crt' : 'bg-background text-foreground'}`}>
      {/* Animated pixel decorations - only in gaming mode */}
      {isGamingMode && (
        <>
          <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00fff7] via-[#ff00ff] to-[#39ff14] opacity-50 z-50" />
          <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#39ff14] via-[#ff00ff] to-[#00fff7] opacity-50 z-50" />
        </>
      )}

      <AnimatePresence>
        {notification && (
          <NotificationBanner message={notification} onClose={() => setNotification(null)} />
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
      <header className={`sticky top-0 z-40 backdrop-blur-sm relative ${isGamingMode ? 'border-b-4 border-[#00fff7] bg-[#0a0a0f]/95' : 'border-b border-border bg-background/95'}`}>
        {isGamingMode && (
          <>
            <PixelDecoration className="top-2 left-4" />
            <PixelDecoration className="top-2 right-4" />
          </>
        )}
        
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 flex items-center justify-center relative overflow-hidden ${isGamingMode ? 'border-3 border-[#00fff7] bg-[#12121a] pixel-shadow' : 'border border-border bg-card rounded-lg'}`}>
                <img 
                  src="/genlayer-logo.jpg" 
                  alt="GenLayer" 
                  className="w-10 h-10 object-contain"
                />
                {isGamingMode && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#39ff14] animate-pulse" />
                )}
              </div>
              <div>
                <h1 
                  className={`text-lg font-bold ${isGamingMode ? 'text-xl text-[#00fff7] font-pixel neon-text-cyan' : 'text-foreground'}`} 
                  data-text={isGamingMode ? t('app.title') : undefined}
                >
                  {t('app.title')}
                </h1>
                {isGamingMode && (
                  <p className="text-xs text-[#ff00ff] font-pixel-body mt-1 animate-pulse">EVENT ALARM SYSTEM</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Clock Display */}
              <div className={`hidden sm:flex flex-col items-center px-3 py-1 ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#12121a] pixel-glow' : 'border border-border bg-card rounded-md'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
                  <span className={`text-base font-pixel-body ${isGamingMode ? 'text-[#00fff7] font-bold' : 'text-foreground font-mono'}`}>{currentTime}</span>
                  <span className={`text-sm px-1 ${isGamingMode ? 'text-[#ff00ff] font-pixel-body font-bold' : 'text-muted-foreground'}`}>{language === 'id' ? 'WIB' : 'UTC'}</span>
                </div>
                <span className={`text-sm ${isGamingMode ? 'text-[#8888aa] font-pixel-body' : 'text-muted-foreground'}`}>
                  {currentDateString || 'Loading...'}
                </span>
              </div>

              {isClient && alarmEnabled && (
                <button
                  onClick={() => setAlarmListOpen(true)}
                  className={`flex items-center gap-1 text-xs px-3 py-2 transition-colors cursor-pointer ${isGamingMode ? 'border-3 border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10 font-bold hover:bg-[#39ff14]/30' : 'border border-primary text-primary bg-primary/10 rounded-md hover:bg-primary/20'}`}
                >
                  <BellRing className="w-4 h-4 animate-pulse" />
                  <span>{alarmedEvents.size}</span>
                </button>
              )}

              {/* Demo Mode Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-1.5 text-xs ${isGamingMode ? 'border-3 font-bold ' + (demoMode ? 'border-[#ff0040] bg-[#ff0040]/20 text-[#ff0040]' : 'border-[#8888aa] bg-[#12121a] text-[#8888aa]') : demoMode ? 'border-destructive bg-destructive/10 text-destructive' : ''}`}
                onClick={() => setDemoMode(!demoMode)}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">DEMO</span>
              </Button>

              <LanguageToggle isGamingMode={isGamingMode} />

              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-1.5 ${isGamingMode ? 'border-3 border-[#ffd700] bg-[#12121a] hover:bg-[#ffd700]/20 pixel-button' : ''}`}
                onClick={() => setRoleModalOpen(true)}
              >
                <Users className={`w-4 h-4 ${isGamingMode ? 'text-[#ffd700]' : 'text-primary'}`} />
                <span className={`hidden sm:inline text-xs ${isGamingMode ? 'font-bold text-[#ffd700]' : ''}`}>{t('roles')}</span>
              </Button>

              {/* Admin Mode Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className={`gap-1.5 text-xs ${isGamingMode 
                  ? adminMode 
                    ? 'border-3 border-[#39ff14] bg-[#39ff14]/20 text-[#39ff14] font-bold animate-pulse' 
                    : 'border-3 border-[#8888aa] bg-[#12121a] text-[#8888aa] hover:border-[#39ff14] hover:text-[#39ff14]' 
                  : adminMode 
                    ? 'border border-[#39ff14] bg-[#39ff14]/10 text-[#39ff14]' 
                    : ''}`}
                onClick={() => setAdminMode(!adminMode)}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{adminMode ? 'ADMIN ON' : 'ADMIN'}</span>
              </Button>
              
              {/* Admin Panel Button - Only show when admin mode is on */}
              {adminMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`gap-1.5 text-xs ${isGamingMode 
                    ? 'border-3 border-[#ffd700] bg-[#ffd700]/20 text-[#ffd700] font-bold' 
                    : 'border border-[#ffd700] bg-[#ffd700]/10 text-[#ffd700]'}`}
                  onClick={() => setPasswordModalOpen(true)}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">MANAGE</span>
                </Button>
              )}
              
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Clock */}
          <div className={`flex sm:hidden flex-col items-start mt-2 px-2 py-1 w-fit ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#12121a] pixel-glow' : 'border border-border bg-card rounded-md'}`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
              <span className={`text-base font-pixel-body ${isGamingMode ? 'text-[#00fff7] font-bold' : 'text-foreground font-mono'}`}>{currentTime}</span>
              <span className={`text-sm ${isGamingMode ? 'text-[#ff00ff] font-pixel-body font-bold' : 'text-muted-foreground'}`}>{language === 'id' ? 'WIB' : 'UTC'}</span>
            </div>
            <span className={`text-sm ${isGamingMode ? 'text-[#8888aa] font-pixel-body' : 'text-muted-foreground'}`}>
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
          className={`${isGamingMode ? 'bg-[#ff0040]/20 border-b-4 border-[#ff0040]' : 'bg-destructive/10 border-b border-destructive'} px-4 py-3`}
        >
          <div className="max-w-4xl mx-auto">
            {/* Sandbox Warning - Show if notifications not available */}
            {typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function' ? (
              <div className={`mb-3 p-3 ${isGamingMode ? 'bg-[#ffd700]/20 border-2 border-[#ffd700]' : 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500 rounded-lg'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">⚠️</span>
                  <span className={`text-xs ${isGamingMode ? 'font-bold text-[#ffd700]' : 'text-yellow-700 dark:text-yellow-400 font-semibold'}`}>MODE PREVIEW - NOTIFIKASI TERBATAS</span>
                </div>
                <p className={`text-xs ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'} mb-2`}>
                  Anda sedang dalam mode preview/sandbox. Notifikasi desktop tidak tersedia.
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${isGamingMode ? 'text-[#39ff14]' : 'text-green-600 dark:text-green-400'} font-bold`}>
                    👆 Klik tombol "Open in New Tab" di atas preview untuk mengaktifkan notifikasi desktop!
                  </span>
                </div>
              </div>
            ) : null}
            
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-3">
                <Zap className={`w-5 h-5 animate-pulse ${isGamingMode ? 'text-[#ff0040]' : 'text-destructive'}`} />
                <span className={`text-sm ${isGamingMode ? 'font-bold text-[#ff0040]' : 'text-destructive font-semibold'}`}>🧪 DEMO MODE AKTIF</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Demo Mode Info */}
                <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                  Test notifikasi di sini sebelum event mulai
                </span>
              </div>
            </div>
            
            {/* Test Buttons */}
            <div className={`p-3 ${isGamingMode ? 'bg-[#0a0a0f] border-2 border-[#ff0040]/50' : 'bg-card border border-border rounded-lg'} mb-3`}>
              <div className={`text-xs mb-2 ${isGamingMode ? 'text-[#ffd700] font-bold' : 'text-primary font-semibold'}`}>🎮 TEST ALARM:</div>
              <div className="flex flex-wrap gap-2">
                {/* Instant Test - Toast Only */}
                <Button
                  size="sm"
                  className={`text-xs px-3 py-2 font-bold ${isGamingMode ? 'bg-[#39ff14] text-[#0a0a0f] hover:bg-[#39ff14]/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
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
                <span className={`text-xs self-center ml-2 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>Background Test:</span>
                {[5, 10, 15, 30].map((seconds) => (
                  <Button
                    key={seconds}
                    size="sm"
                    disabled={backgroundTestCountdown !== null}
                    className={`text-xs px-3 py-2 font-bold ${
                      backgroundTestCountdown !== null 
                        ? isGamingMode ? 'border-2 border-[#8888aa] text-[#8888aa] cursor-not-allowed' : 'border border-muted-foreground text-muted-foreground cursor-not-allowed opacity-50'
                        : isGamingMode ? 'border-2 border-[#00fff7] text-[#00fff7] hover:bg-[#00fff7]/20' : 'border border-primary text-primary hover:bg-primary/10'
                    }`}
                    onClick={() => startBackgroundTest(seconds)}
                  >
                    ⏱️ {seconds}s
                  </Button>
                ))}
              </div>
              
              {/* Browser Notification Status */}
              <div className={`mt-3 p-3 ${isGamingMode ? 'bg-[#0a0a0f] border-2 border-[#ffd700]/50' : 'bg-background border border-border rounded-lg'}`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isGamingMode ? 'font-bold text-[#ffd700]' : 'text-primary font-semibold'}`}>📢 NOTIFIKASI DESKTOP:</span>
                    {typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function' ? (
                      <span className={`text-xs px-2 py-0.5 ${isGamingMode ? 'border-2' : 'border rounded'} ${
                        Notification.permission === 'granted' 
                          ? isGamingMode ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10' : 'border-green-500 text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                          : Notification.permission === 'denied'
                          ? isGamingMode ? 'border-[#ff0040] text-[#ff0040] bg-[#ff0040]/10' : 'border-red-500 text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                          : isGamingMode ? 'border-[#ffd700] text-[#ffd700] bg-[#ffd700]/10' : 'border-yellow-500 text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {Notification.permission === 'granted' ? '✓ AKTIF' : Notification.permission === 'denied' ? '✗ DIBLOKIR' : '? BELUM AKTIF'}
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 ${isGamingMode ? 'border-2 border-[#8888aa] text-[#8888aa]' : 'border border-muted-foreground text-muted-foreground rounded'}`}>
                        ⚠ TIDAK TERSEDIA
                      </span>
                    )}
                  </div>
                  {typeof Notification !== 'undefined' && typeof Notification.requestPermission === 'function' && Notification.permission !== 'granted' && (
                    <Button
                      size="sm"
                      className={`text-xs px-3 py-1 font-bold ${isGamingMode ? 'bg-[#ffd700] text-[#0a0a0f] hover:bg-[#ffd700]/80' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
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
                <div className={`text-xs mt-2 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                  {typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function' ? (
                    <span className={isGamingMode ? 'text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400'}>
                      ⚠️ Browser Notification tidak tersedia di mode preview/sandbox.
                      <strong className={isGamingMode ? 'text-[#39ff14]' : 'text-green-600 dark:text-green-400'}> Buka di tab baru</strong> untuk mengaktifkan notifikasi desktop.
                    </span>
                  ) : Notification.permission === 'granted' 
                    ? '✅ Notifikasi desktop aktif. Alarm akan muncul meski Anda di tab lain!'
                    : Notification.permission === 'denied'
                    ? '❌ Notifikasi diblokir. Buka Settings browser → Site Settings → Notifications → Allow'
                    : '⚠️ Klik tombol di atas untuk mengaktifkan notifikasi desktop'}
                </div>
                <div className={`text-xs mt-1 ${isGamingMode ? 'text-[#39ff14]' : 'text-green-600 dark:text-green-400'}`}>
                  💡 <strong>Catatan:</strong> Toast notification (pojok kanan bawah) selalu berfungsi meski di sandbox!
                </div>
              </div>
              
              {/* Countdown Display */}
              {backgroundTestCountdown !== null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-3 p-3 text-center ${isGamingMode ? 'bg-[#00fff7]/10 border-2 border-[#00fff7]' : 'bg-primary/10 border border-primary rounded-lg'}`}
                >
                  <div className={`text-xs mb-1 ${isGamingMode ? 'text-[#00fff7] font-bold' : 'text-primary font-semibold'}`}>⏰ ALARM DALAM:</div>
                  <div className={`text-3xl font-mono font-bold ${isGamingMode ? 'text-[#00fff7] text-[#00fff7]' : 'text-primary'}`}>
                    {backgroundTestCountdown}
                  </div>
                  <div className={`text-xs mt-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                    💡 Pindah tab/minimize browser sekarang!
                  </div>
                </motion.div>
              )}
            </div>
            
            {/* Tips */}
            <div className={`text-xs p-2 ${isGamingMode ? 'text-[#b8b8c8] bg-[#0a0a0f]/50 border-2 border-[#ff0040]/30' : 'text-muted-foreground bg-muted/50 border border-border rounded-lg'}`}>
              <div className={`font-bold mb-1 ${isGamingMode ? 'text-[#ffd700]' : 'text-primary'}`}>💡 CARA TEST NOTIFIKASI BACKGROUND:</div>
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
          className={`${isGamingMode ? 'bg-[#ff0040]/20 border-b-4 border-[#ff0040]' : 'bg-red-50 dark:bg-red-900/10 border-b border-red-500'} px-4 py-3`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className={`flex items-center gap-2 px-3 py-1 animate-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className={`text-xs uppercase tracking-wider ${isGamingMode ? 'font-bold text-white' : 'text-white font-semibold'}`}>LIVE NOW</span>
              </div>
              <span className={`text-sm ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'}`}>{liveEvents.length} event sedang berlangsung</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {liveEvents.map(event => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`flex items-center gap-3 p-2 cursor-pointer transition-colors ${isGamingMode ? 'border-2 border-[#ff0040] bg-[#ff0040]/10 hover:bg-[#ff0040]/20' : 'border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg'}`}
                  onClick={() => {
                    setSelectedEvent(event)
                    setEventDetailOpen(true)
                  }}
                >
                  {event.icon && (
                    <img 
                      src={event.icon} 
                      alt={event.name}
                      className={`w-10 h-10 ${isGamingMode ? 'border-2 border-[#ff0040]' : 'border border-red-300 rounded-lg'}`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs truncate ${isGamingMode ? 'font-bold text-[#ff0040]' : 'text-red-600 dark:text-red-400 font-semibold'}`}>{event.name}</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>{formatTimeWithLabel(event.timeUTC)}</span>
                  </div>
                  <Button
                    size="sm"
                    className={`text-xs px-2 py-1 border-0 ${isGamingMode ? 'bg-[#ff0040] text-white hover:bg-[#ff0040]/80' : 'bg-red-500 text-white hover:bg-red-600'}`}
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
          className={`${isGamingMode ? 'bg-[#ff0040]/20 border-b-4 border-[#ff0040]' : 'bg-red-50 dark:bg-red-900/10 border-b border-red-500'} px-4 py-3`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className={`flex items-center gap-2 px-3 py-1 animate-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className={`text-xs uppercase tracking-wider ${isGamingMode ? 'font-bold text-white' : 'text-white font-semibold'}`}>🧪 DEMO LIVE</span>
              </div>
              <span className={`text-sm ${isGamingMode ? 'text-[#b8b8c8]' : 'text-muted-foreground'}`}>Event yang dipilih sedang berlangsung</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className={`text-xs px-4 py-2 ${isGamingMode ? 'border-2 border-[#ff0040] text-[#ff0040] bg-transparent hover:bg-[#ff0040]/20' : 'border border-red-500 text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                onClick={() => {
                  setSelectedEvent(manualLiveEvent)
                  setEventDetailOpen(true)
                }}
              >
                {manualLiveEvent.name}
              </Button>
              <Button
                size="sm"
                className={`text-xs px-3 py-2 ${isGamingMode ? 'bg-[#ff0040] text-white hover:bg-[#ff0040]/80' : 'bg-red-500 text-white hover:bg-red-600'}`}
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
            className={`p-5 relative overflow-hidden ${isGamingMode ? 'border-4 border-[#00fff7] bg-[#12121a] pixel-shadow' : 'border border-primary bg-card rounded-xl shadow-sm'}`}
          >
            {/* Corner decorations - only in gaming mode */}
            {isGamingMode && (
              <>
                <div className="absolute top-0 left-0 w-4 h-4 bg-[#00fff7]" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#00fff7]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#00fff7]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#00fff7]" />
                
                {/* Inner corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-r-2 border-b-2 border-[#00fff7]/30" />
                <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-[#00fff7]/30" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-r-2 border-t-2 border-[#00fff7]/30" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-l-2 border-t-2 border-[#00fff7]/30" />
              </>
            )}

            <div className="flex items-center gap-2 mb-4">
              {isEventLive(nextEvent) ? (
                <>
                  <div className={`flex items-center gap-2 px-3 py-1 animate-pulse ${isGamingMode ? 'bg-[#ff0040]' : 'bg-red-500 rounded-full'}`}>
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className={`text-xs uppercase tracking-wider font-bold ${isGamingMode ? 'text-white font-pixel-body' : 'text-white font-semibold'}`}>● LIVE</span>
                  </div>
                  <span className={`text-sm font-pixel-body font-bold ${isGamingMode ? 'text-[#ff0040]' : 'text-red-500 font-semibold'}`}>Event sedang berlangsung!</span>
                </>
              ) : (
                <>
                  <Zap className={`w-5 h-5 ${isGamingMode ? 'text-[#ffff00] pulse-neon' : 'text-yellow-500'}`} />
                  <span className={`text-xs uppercase tracking-wider font-pixel-body font-bold ${isGamingMode ? 'text-[#ffff00] neon-text-yellow' : 'text-yellow-600 dark:text-yellow-400 font-semibold'}`}>
                    {t('nextEvent')}
                  </span>
                </>
              )}
              {isClient && alarmedEvents.has(nextEvent.id) && (
                <span className={`ml-auto text-xs px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'border-2 border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10' : 'border border-green-500 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 rounded-full'}`}>
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
                      className={`w-16 h-16 ${isGamingMode ? 'border-3 border-[#00fff7] pixel-shadow' : 'border border-border rounded-lg'}`}
                      style={{ imageRendering: 'pixelated' }}
                    />
                    {isGamingMode && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39ff14] animate-pulse" />
                    )}
                  </div>
                )}
                <div>
                  <h2 className={`text-base font-bold mb-2 ${isGamingMode ? 'text-xl text-[#00fff7] font-pixel-body neon-text-cyan' : 'text-foreground'}`}>{nextEvent.name}</h2>
                  <div className={`flex items-center gap-4 text-base flex-wrap ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                    <span className="flex items-center gap-2">
                      <Clock className={`w-5 h-5 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
                      <span className={`font-pixel-body font-bold ${isGamingMode ? 'text-[#00fff7]' : 'text-foreground'}`}>{formatTimeWithLabel(nextEvent.timeUTC)}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className={`w-5 h-5 ${isGamingMode ? 'text-[#ff00ff] pulse-neon' : 'text-primary'}`} />
                      <span className={`font-pixel-body font-bold ${isGamingMode ? 'text-[#ff00ff]' : 'text-foreground'}`}>{getDayName(nextEvent.day)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadgeTooltip roleName={nextEvent.roleReq} roleColor={nextEvent.roleColor} t={t}>
                  <span 
                    className={`text-sm px-4 py-2 cursor-pointer ${isGamingMode ? 'font-bold border-3' : 'rounded-lg border font-medium'}`}
                    style={{ 
                      borderColor: nextEvent.roleColor,
                      color: nextEvent.roleColor,
                      backgroundColor: nextEvent.roleColor + '20'
                    }}
                  >
                    {nextEvent.roleReq}
                  </span>
                </RoleBadgeTooltip>
              </div>
            </div>

            {/* Countdown */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { value: countdown.days, label: t('days'), color: isGamingMode ? '#00fff7' : undefined },
                { value: countdown.hours, label: t('hours'), color: isGamingMode ? '#ff00ff' : undefined },
                { value: countdown.minutes, label: t('min'), color: isGamingMode ? '#39ff14' : undefined },
                { value: countdown.seconds, label: t('sec'), color: isGamingMode ? '#ffd700' : undefined },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-3 text-center relative overflow-hidden ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#0a0a0f] pixel-glow' : 'border border-border bg-background rounded-lg'}`}
                >
                  {isGamingMode && item.color && (
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: item.color }} />
                  )}
                  <div className={`text-2xl font-mono font-bold ${isGamingMode ? 'text-3xl font-pixel text-white' : 'text-primary'}`} style={isGamingMode && item.color ? { color: item.color } : undefined}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className={`text-sm mt-1 font-pixel-body font-bold ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>{item.label}</div>
                </motion.div>
              ))}
            </div>

            {/* XP Rewards */}
            {nextEvent.xpRewards.length > 0 && (
              <div className="mt-5 space-y-2">
                <div className={`flex items-center justify-between p-2 ${isGamingMode ? 'border-3 border-[#ffd700] bg-[#ffd700]/10' : 'border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'}`}>
                  <h4 className={`text-xs flex items-center gap-2 ${isGamingMode ? 'font-bold text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400 font-semibold'}`}>
                    <Trophy className="w-4 h-4" />
                    <span>{t('xpRewards')}</span>
                  </h4>
                  <span className={`text-xs ${isGamingMode ? 'font-bold text-[#ffd700] text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400 font-semibold'}`}>
                    MAX: {getMaxXP(nextEvent).toLocaleString('en-US')} XP
                  </span>
                </div>
                <div className={`p-2 max-h-32 overflow-y-auto custom-scrollbar ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#0a0a0f]' : 'border border-border bg-background rounded-lg'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                    {nextEvent.xpRewards.map((reward, idx) => (
                      <div key={idx} className={`flex items-center justify-between text-sm p-1 ${isGamingMode ? 'hover:bg-[#39ff14]/10' : 'hover:bg-muted/50 rounded'}`}>
                        <span className={isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}>{reward.position}</span>
                        <span className={`font-bold ${isGamingMode ? 'text-[#39ff14]' : 'text-green-600 dark:text-green-400'}`}>
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
                className={`flex-1 text-xs ${isGamingMode ? 'border-3 border-[#00fff7] bg-[#00fff7] text-[#0a0a0f] hover:bg-[#39ff14] hover:border-[#39ff14] font-bold pixel-button' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
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
                className={`text-xs ${isGamingMode ? 'border-3 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff]/20 font-bold pixel-button bg-transparent' : ''}`}
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
        <div className={`p-5 relative ${isGamingMode ? 'border-4 border-[#ff00ff] bg-[#12121a] pixel-shadow' : 'border border-border bg-card rounded-xl shadow-sm'}`}>
          {isGamingMode && (
            <>
              <div className="absolute top-0 left-0 w-4 h-4 bg-[#ff00ff]" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#ff00ff]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#ff00ff]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ff00ff]" />
            </>
          )}
          
          <div className={`flex items-center gap-3 mb-4 pb-3 ${isGamingMode ? 'border-b-3 border-[#2a2a4e]' : 'border-b border-border'}`}>
            <div className={`w-10 h-10 flex items-center justify-center ${isGamingMode ? 'border-2 border-[#ff00ff] pixel-glow' : 'border border-border rounded-lg bg-muted'}`}>
              <Calendar className={`w-5 h-5 ${isGamingMode ? 'text-[#ff00ff] pulse-neon' : 'text-primary'}`} />
            </div>
            <h3 className={`text-sm font-semibold ${isGamingMode ? 'text-xl text-[#ff00ff] font-pixel neon-text-magenta' : 'text-foreground'}`}>{t('todayEvents')}</h3>
            <span className={`px-2 py-1 ${isGamingMode ? 'text-lg text-[#ff00ff] border-2 border-[#ff00ff] bg-[#ff00ff]/20 font-pixel-body font-bold' : 'text-sm bg-muted rounded-md px-2 py-1'}`}>{todayEvents.length}</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {todayEvents.slice(0, 5).map((event, index) => (
              <motion.div 
                key={event.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 transition-all cursor-pointer ${isGamingMode 
                  ? `border-3 ${isEventLive(event) ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#ff00ff] hover:bg-[#ff00ff]/5'}` 
                  : `${isEventLive(event) ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' : 'border border-border hover:border-primary hover:bg-muted/50'} rounded-lg`}`}
                onClick={() => openEventDetail(event)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {event.icon && (
                      <img 
                        src={event.icon} 
                        alt={event.name}
                        className={`w-10 h-10 ${isGamingMode ? 'border-2 border-[#ff00ff] pixel-shadow' : 'border border-border rounded'}`}
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isGamingMode ? 'text-xl text-[#00fff7] font-pixel-body neon-text-cyan' : 'text-sm text-foreground'}`}>{event.name}</span>
                        {isEventLive(event) && (
                          <span className={`px-2 py-1 text-white text-xs uppercase animate-pulse font-bold ${isGamingMode ? 'bg-[#ff0040] border-2 border-[#ff0040]' : 'bg-red-500 rounded-full font-semibold'}`}>● LIVE</span>
                        )}
                        {isClient && alarmedEvents.has(event.id) && !isEventLive(event) && (
                          <Bell className={`w-4 h-4 animate-pulse ${isGamingMode ? 'text-[#39ff14] flash' : 'text-green-500'}`} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-4 h-4 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`} />
                        <span className={`${isGamingMode ? 'text-lg text-[#00fff7] font-pixel-body font-bold' : 'text-xs text-primary'}`}>{formatTimeWithLabel(event.timeUTC)}</span>
                      </div>
                    </div>
                  </div>
                  <RoleBadgeTooltip roleName={event.roleReq} roleColor={event.roleColor} t={t}>
                    <span 
                      className={`text-sm px-3 py-1 cursor-pointer font-pixel-body ${isGamingMode ? 'border-2 font-bold' : 'border rounded'}`}
                      style={{ 
                        borderColor: event.roleColor,
                        color: event.roleColor,
                      }}
                    >
                      {event.roleReq}
                    </span>
                  </RoleBadgeTooltip>
                </div>
                {/* Rewards */}
                <div className="flex flex-wrap gap-2">
                  {event.hasPOAP && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#ff00ff]/20 text-[#ff00ff] border-2 border-[#ff00ff] pixel-glow' : 'text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md font-medium'}`}>
                      🎁 POAP
                    </span>
                  )}
                  {event.hasInsight && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#00fff7]/20 text-[#00fff7] border-2 border-[#00fff7] pixel-glow' : 'text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-md font-medium'}`}>
                      ⚡ Insight
                    </span>
                  )}
                  {event.xpRewards.length > 0 && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#39ff14]/20 text-[#39ff14] border-2 border-[#39ff14] pixel-glow' : 'text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md font-medium'}`}>
                      🏆 Max {getMaxXP(event).toLocaleString()} XP
                    </span>
                  )}
                  {event.rewards && event.rewards.length > 0 && !event.hasPOAP && !event.hasInsight && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#ffd700]/20 text-[#ffd700] border-2 border-[#ffd700] pixel-glow' : 'text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md font-medium'}`}>
                      {event.rewards.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
            {todayEvents.length === 0 && (
              <div className={`p-4 text-center ${isGamingMode ? 'border-3 border-dashed border-[#2a2a4e]' : 'border border-dashed border-border rounded-lg'}`}>
                <p className={`text-sm ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>[{t('noEventsToday')}]</p>
              </div>
            )}
          </div>
        </div>

        {/* Event Schedule */}
        <div className={`p-5 relative ${isGamingMode ? 'border-4 border-[#39ff14] bg-[#12121a] pixel-shadow' : 'border border-border bg-card rounded-xl shadow-sm'}`}>
          {isGamingMode && (
            <>
              <div className="absolute top-0 left-0 w-4 h-4 bg-[#39ff14]" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#39ff14]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#39ff14]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39ff14]" />
            </>
          )}
          
          <div className={`flex items-center gap-3 mb-4 pb-3 ${isGamingMode ? 'border-b-3 border-[#2a2a4e]' : 'border-b border-border'}`}>
            <div className={`w-10 h-10 flex items-center justify-center ${isGamingMode ? 'border-2 border-[#39ff14] pixel-glow' : 'border border-border rounded-lg bg-muted'}`}>
              <Gamepad2 className={`w-5 h-5 ${isGamingMode ? 'text-[#39ff14] pulse-neon' : 'text-primary'}`} />
            </div>
            <h3 className={`text-sm font-semibold ${isGamingMode ? 'text-xl text-[#39ff14] font-pixel neon-text-lime' : 'text-foreground'}`}>{t('eventSchedule')}</h3>
          </div>
          
          <Tabs value={selectedDay} onValueChange={setSelectedDay} className="w-full">
            <TabsList className={`w-full justify-start flex-wrap h-auto gap-0.5 p-1 mb-4 ${isGamingMode ? 'bg-[#0a0a0f] border-3 border-[#2a2a4e]' : 'bg-muted'}`}>
              {DAYS.map((day) => {
                const isToday = day === getCurrentUTCDay()
                return (
                  <TabsTrigger 
                    key={day} 
                    value={day}
                    className={`text-xs px-3 py-2 ${isGamingMode ? 'font-bold data-[state=active]:bg-[#39ff14] data-[state=active]:text-[#0a0a0f]' : ''}`}
                  >
                    {getDayName(day)}
                    {isToday && <span className={`ml-2 w-2 h-2 inline-block animate-pulse ${isGamingMode ? 'bg-[#ffd700]' : 'bg-primary rounded-full'}`} />}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3 transition-all cursor-pointer ${isGamingMode 
                  ? `border-3 ${isEventLive(event) ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#39ff14] hover:bg-[#39ff14]/5'}`
                  : `${isEventLive(event) ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' : 'border border-border hover:border-primary hover:bg-muted/50'} rounded-lg`}`}
                onClick={() => openEventDetail(event)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {event.icon && (
                      <div className="relative">
                        <img 
                          src={event.icon} 
                          alt={event.name}
                          className={`w-14 h-14 ${isGamingMode ? 'border-2 border-[#39ff14] pixel-shadow' : 'border border-border rounded-lg'}`}
                          style={{ imageRendering: 'pixelated' }}
                        />
                        {isEventLive(event) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0040] animate-pulse" />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Clock className={`w-5 h-5 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
                        <span className={`text-base font-pixel-body font-bold ${isGamingMode ? 'text-xl text-[#00fff7]' : 'text-primary'}`}>{formatTimeWithLabel(event.timeUTC)}</span>
                        {isEventLive(event) && (
                          <span className={`px-2 py-1 text-white text-xs uppercase animate-pulse font-bold ${isGamingMode ? 'bg-[#ff0040] border-2 border-[#ff0040]' : 'bg-red-500 rounded-full font-semibold'}`}>● LIVE</span>
                        )}
                        {event.isSpecial && (
                          <span className={`${isGamingMode ? 'text-[#ffd700] font-pixel-body font-bold sparkle' : 'text-yellow-500'} animate-pulse`}>★ SPECIAL</span>
                        )}
                        {isClient && alarmedEvents.has(event.id) && !isEventLive(event) && (
                          <Bell className={`w-4 h-4 animate-pulse ${isGamingMode ? 'text-[#39ff14] flash' : 'text-green-500'}`} />
                        )}
                      </div>
                      <h4 className={`text-base font-bold truncate mt-1 ${isGamingMode ? 'text-lg text-[#e0e0e0] font-pixel-body' : ''}`}>{event.name}</h4>
                    </div>
                  </div>

                  <RoleBadgeTooltip roleName={event.roleReq} roleColor={event.roleColor} t={t}>
                    <span 
                      className={`text-sm px-3 py-1 shrink-0 cursor-pointer font-pixel-body font-bold ${isGamingMode ? 'border-2' : 'border rounded-lg'}`}
                      style={{ 
                        backgroundColor: event.roleColor + '15',
                        color: event.roleColor,
                        borderColor: event.roleColor + '60'
                      }}
                    >
                      {event.roleReq}
                    </span>
                  </RoleBadgeTooltip>
                </div>
                
                {/* Rewards */}
                <div className="flex flex-wrap gap-2">
                  {event.hasPOAP && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#ff00ff]/20 text-[#ff00ff] border-2 border-[#ff00ff] pixel-glow' : 'text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md font-medium'}`}>
                      🎁 POAP
                    </span>
                  )}
                  {event.hasInsight && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#00fff7]/20 text-[#00fff7] border-2 border-[#00fff7] pixel-glow' : 'text-sm bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-md font-medium'}`}>
                      ⚡ Insight
                    </span>
                  )}
                  {event.xpRewards.length > 0 && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#39ff14]/20 text-[#39ff14] border-2 border-[#39ff14] pixel-glow' : 'text-sm bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md font-medium'}`}>
                      🏆 Max {getMaxXP(event).toLocaleString()} XP
                    </span>
                  )}
                  {event.rewards && event.rewards.length > 0 && !event.hasPOAP && !event.hasInsight && (
                    <span className={`px-3 py-1 font-pixel-body font-bold ${isGamingMode ? 'text-base bg-[#ffd700]/20 text-[#ffd700] border-2 border-[#ffd700] pixel-glow' : 'text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md font-medium'}`}>
                      {event.rewards.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* My Alarms */}
        {isClient && alarmedEvents.size > 0 && (
          <div className={`p-5 relative ${isGamingMode ? 'border-4 border-[#ffd700] bg-[#12121a] pixel-shadow' : 'border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-sm'}`}>
            {isGamingMode && (
              <>
                <div className="absolute top-0 left-0 w-4 h-4 bg-[#ffd700]" />
                <div className="absolute top-0 right-0 w-4 h-4 bg-[#ffd700]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-[#ffd700]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#ffd700]" />
              </>
            )}
            
            <div className={`flex items-center gap-3 mb-4 pb-3 ${isGamingMode ? 'border-b-3 border-[#2a2a4e]' : 'border-b border-yellow-500/30'}`}>
              <div className={`w-10 h-10 flex items-center justify-center ${isGamingMode ? 'border-2 border-[#ffd700] pixel-glow' : 'border border-yellow-500 rounded-lg bg-yellow-100 dark:bg-yellow-900/30'}`}>
                <BellRing className={`w-5 h-5 animate-pulse ${isGamingMode ? 'text-[#ffd700] pulse-neon' : 'text-yellow-600 dark:text-yellow-400'}`} />
              </div>
              <h3 className={`text-sm font-semibold ${isGamingMode ? 'text-xl text-[#ffd700] font-pixel neon-text-gold' : 'text-yellow-700 dark:text-yellow-300'}`}>{t('myAlarms')}</h3>
              <span className={`px-2 py-1 ${isGamingMode ? 'text-lg text-[#ffd700] border-2 border-[#ffd700] bg-[#ffd700]/20 font-pixel-body font-bold' : 'text-sm bg-yellow-100 dark:bg-yellow-900/30 rounded-md px-2 py-1'}`}>{alarmedEvents.size}</span>
            </div>
            <div className="space-y-2">
              {events.filter(e => alarmedEvents.has(e.id)).map((event) => (
                <div 
                  key={event.id}
                  className={`flex items-center justify-between p-3 transition-colors ${isGamingMode ? 'border-3 border-[#ffd700]/30 bg-[#ffd700]/5 hover:bg-[#ffd700]/10' : 'border border-yellow-500/30 bg-yellow-100/50 dark:bg-yellow-900/10 hover:bg-yellow-200/50 dark:hover:bg-yellow-900/20 rounded-lg'}`}
                >
                  <div className="flex items-center gap-3">
                    {event.icon && (
                      <img 
                        src={event.icon} 
                        alt={event.name}
                        className={`w-12 h-12 ${isGamingMode ? 'border-2 border-[#ffd700] pixel-shadow' : 'border border-yellow-500 rounded-lg'}`}
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    <Clock className={`w-5 h-5 ${isGamingMode ? 'text-[#ffd700] pulse-neon' : 'text-yellow-600 dark:text-yellow-400'}`} />
                    <span className={`text-base font-pixel-body font-bold ${isGamingMode ? 'text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400'}`}>{formatTimeWithLabel(event.timeUTC)}</span>
                    <span className={`text-base font-pixel-body ${isGamingMode ? 'text-[#e0e0e0]' : ''}`}>{event.name}</span>
                    <span className={`text-sm font-pixel-body ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>({getDayName(event.day)})</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`h-8 text-xs ${isGamingMode ? 'text-[#ff0040] hover:text-[#ff0040] hover:bg-[#ff0040]/10 border-2 border-[#ff0040]/50 font-bold' : 'text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-300'}`}
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
      <footer className={`mt-auto relative ${isGamingMode ? 'border-t-4 border-[#2a2a4e] bg-[#0a0a0f]' : 'border-t border-border bg-background'}`}>
        {isGamingMode && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00fff7] via-[#ff00ff] to-[#39ff14] opacity-50 animate-pulse" />
        )}
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className={`${isGamingMode ? 'text-[#ffd700] sparkle' : 'text-primary'}`}>★</span>
            <p className={`text-sm font-pixel-body ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
              {t('footer')}
            </p>
            <span className={`${isGamingMode ? 'text-[#ffd700] sparkle' : 'text-primary'}`}>★</span>
          </div>
          {isGamingMode && (
            <p className="text-base text-[#39ff14] mt-2 font-pixel neon-text-lime animate-pulse">
              PRESS START TO CONTINUE
            </p>
          )}
        </div>
      </footer>

      <RoleSystemModal open={roleModalOpen} onOpenChange={setRoleModalOpen} customRoles={customRoles} customFunctionalRoles={customFunctionalRoles} />
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
      
      {/* Password Modal for Admin Access */}
      <PasswordModal
        open={passwordModalOpen}
        onOpenChange={setPasswordModalOpen}
        onSuccess={() => {
          setPasswordModalOpen(false)
          setAdminPanelOpen(true)
        }}
      />
      
      {/* Admin Panel Modal */}
      <AdminPanelModal
        open={adminPanelOpen}
        onOpenChange={setAdminPanelOpen}
        events={allEvents}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        customRoles={customRoles}
        onAddRole={handleAddRole}
        onEditRole={handleEditRole}
        onDeleteRole={handleDeleteRole}
        customFunctionalRoles={customFunctionalRoles}
        onAddFunctionalRole={handleAddFunctionalRole}
        onEditFunctionalRole={handleEditFunctionalRole}
        onDeleteFunctionalRole={handleDeleteFunctionalRole}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetToDefault={handleResetToDefault}
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
