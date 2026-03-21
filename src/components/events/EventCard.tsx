'use client'

import { motion } from 'framer-motion'
import { Clock, Bell, Trophy } from 'lucide-react'
import { RoleBadgeTooltip } from '@/components/role-badge-tooltip'
import type { Event } from '@/lib/events-data'

interface EventCardProps {
  event: Event
  isGamingMode: boolean
  isLive: boolean
  hasAlarm: boolean
  onClick: () => void
  onToggleAlarm?: () => void
  formatTimeWithLabel: (time: string) => string
  getDayName: (day: string) => string
  t: (key: string) => string
  showRewards?: boolean
  compact?: boolean
}

export function EventCard({
  event,
  isGamingMode,
  isLive,
  hasAlarm,
  onClick,
  onToggleAlarm,
  formatTimeWithLabel,
  getDayName,
  t,
  showRewards = true,
  compact = false,
}: EventCardProps) {
  const getMaxXP = (event: Event): number => {
    return event.xpRewards.length > 0 
      ? Math.max(...event.xpRewards.map(r => r.xp))
      : 0
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-3 transition-all cursor-pointer ${isGamingMode 
          ? `border-3 ${isLive ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#ff00ff] hover:bg-[#ff00ff]/5'}` 
          : `${isLive ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' : 'border border-border hover:border-primary hover:bg-muted/50'} rounded-lg`}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`${event.name} at ${formatTimeWithLabel(event.timeUTC)}${isLive ? ' - Live now' : ''}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {event.icon && (
              <img 
                src={event.icon} 
                alt={event.name}
                className={`w-10 h-10 ${isGamingMode ? 'border-2 border-[#ff00ff] pixel-shadow' : 'border border-border rounded'}`}
                style={{ imageRendering: 'pixelated' }}
                loading="lazy"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${isGamingMode ? 'text-xl text-[#00fff7] font-pixel-body neon-text-cyan' : 'text-sm text-foreground'}`}>
                  {event.name}
                </span>
                {isLive && (
                  <span className={`px-2 py-1 text-white text-xs uppercase animate-pulse font-bold ${isGamingMode ? 'bg-[#ff0040] border-2 border-[#ff0040]' : 'bg-red-500 rounded-full font-semibold'}`}>
                    ● LIVE
                  </span>
                )}
                {hasAlarm && !isLive && (
                  <Bell className={`w-4 h-4 animate-pulse ${isGamingMode ? 'text-[#39ff14] flash' : 'text-green-500'}`} />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className={`w-4 h-4 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`} />
                <span className={`${isGamingMode ? 'text-lg text-[#00fff7] font-pixel-body font-bold' : 'text-xs text-primary'}`}>
                  {formatTimeWithLabel(event.timeUTC)}
                </span>
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
        {showRewards && (
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
        )}

        {/* XP Rewards Detail */}
        {event.xpRewards.length > 0 && showRewards && (
          <div className={`mt-3 p-2 ${isGamingMode ? 'border-2 border-[#2a2a4e] bg-[#0a0a0f]' : 'border border-border bg-muted/50 rounded-lg'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1">
              {event.xpRewards.slice(0, 6).map((reward, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className={`${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>{reward.position}</span>
                  <span className={`font-bold ${isGamingMode ? 'text-[#39ff14]' : 'text-green-600 dark:text-green-400'}`}>
                    {reward.xp > 0 ? `${reward.xp.toLocaleString()} XP` : 'XP'}
                  </span>
                </div>
              ))}
              {event.xpRewards.length > 6 && (
                <div className="col-span-2 sm:col-span-3 text-center">
                  <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                    +{event.xpRewards.length - 6} more positions
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event Rewards Detail (for events without XP but with POAP/Insight/etc) */}
        {event.xpRewards.length === 0 && (event.hasPOAP || event.hasInsight || (event.rewards && event.rewards.length > 0)) && showRewards && (
          <div className={`mt-3 p-3 ${isGamingMode ? 'border-2 border-[#ffd700] bg-[#ffd700]/10' : 'border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className={`w-4 h-4 ${isGamingMode ? 'text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400'}`} />
              <span className={`text-sm font-bold ${isGamingMode ? 'text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400'}`}>Event Rewards</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.hasPOAP && (
                <span className={`text-sm ${isGamingMode ? 'text-[#ff00ff]' : 'text-purple-600 dark:text-purple-400'}`}>
                  🎁 POAP - Proof of Attendance
                </span>
              )}
              {event.hasInsight && (
                <span className={`text-sm ${isGamingMode ? 'text-[#00fff7]' : 'text-cyan-600 dark:text-cyan-400'}`}>
                  ⚡ Insight Role
                </span>
              )}
              {event.rewards && event.rewards.filter(r => r !== 'Insight' && r !== 'POAP').map((reward, idx) => (
                <span key={idx} className={`text-sm ${isGamingMode ? 'text-[#ffd700]' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  🏆 {reward}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // Full size event card for schedule
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 transition-all cursor-pointer ${isGamingMode 
        ? `border-3 ${isLive ? 'border-[#ff0040] bg-[#ff0040]/10' : 'border-[#2a2a4e] hover:border-[#39ff14] hover:bg-[#39ff14]/5'}`
        : `${isLive ? 'border border-red-500 bg-red-50 dark:bg-red-900/20' : 'border border-border hover:border-primary hover:bg-muted/50'} rounded-lg`}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
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
                loading="lazy"
              />
              {isLive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0040] animate-pulse" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Clock className={`w-5 h-5 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
              <span className={`text-base font-pixel-body font-bold ${isGamingMode ? 'text-xl text-[#00fff7]' : 'text-primary'}`}>
                {formatTimeWithLabel(event.timeUTC)}
              </span>
              {isLive && (
                <span className={`px-2 py-1 text-white text-xs uppercase animate-pulse font-bold ${isGamingMode ? 'bg-[#ff0040] border-2 border-[#ff0040]' : 'bg-red-500 rounded-full font-semibold'}`}>
                  ● LIVE
                </span>
              )}
              {event.isSpecial && (
                <span className={`${isGamingMode ? 'text-[#ffd700] font-pixel-body font-bold sparkle' : 'text-yellow-500'} animate-pulse`}>
                  ★ SPECIAL
                </span>
              )}
              {hasAlarm && !isLive && (
                <Bell className={`w-4 h-4 animate-pulse ${isGamingMode ? 'text-[#39ff14] flash' : 'text-green-500'}`} />
              )}
            </div>
            <h4 className={`text-base font-bold truncate mt-1 ${isGamingMode ? 'text-lg text-[#e0e0e0] font-pixel-body' : ''}`}>
              {event.name}
            </h4>
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
  )
}
