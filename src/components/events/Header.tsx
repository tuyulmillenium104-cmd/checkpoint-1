'use client'

import { motion } from 'framer-motion'
import { Clock, Users, MessageCircle, Twitter, ExternalLink, Globe, BellRing } from 'lucide-react'
import { ThemeToggle, LanguageToggle } from './HeaderControls'
import { PixelDecoration } from './PixelDecoration'

interface HeaderProps {
  isGamingMode: boolean
  currentTime: string
  language: 'id' | 'en'
  announcementText: string
  alarmEnabled: boolean
  alarmedEventsCount: number
  onOpenAlarmList: () => void
  demoMode: boolean
  adminMode: boolean
  onToggleDemo: () => void
  onToggleAdmin: () => void
  onOpenAdminPanel: () => void
}

export function Header({
  isGamingMode,
  currentTime,
  language,
  announcementText,
  alarmEnabled,
  alarmedEventsCount,
  onOpenAlarmList,
  demoMode,
  adminMode,
  onToggleDemo,
  onToggleAdmin,
  onOpenAdminPanel,
}: HeaderProps) {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'app.title': 'GenLayer Event Alarm',
    }
    return translations[key] || key
  }

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-sm relative ${isGamingMode ? 'border-b-4 border-[#00fff7] bg-[#0a0a0f]/95' : 'border-b border-border bg-background/95'}`}>
      {isGamingMode && (
        <>
          <PixelDecoration className="top-2 left-4" />
          <PixelDecoration className="top-2 right-4" />
        </>
      )}
      
      <div className="max-w-5xl mx-auto px-4 py-3">
        {/* Main Header Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex items-center justify-center relative ${isGamingMode ? 'border-3 border-[#00fff7] bg-[#12121a] pixel-shadow' : 'rounded-lg bg-muted border border-border'}`}>
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
              <h1 className={`text-xl font-bold ${isGamingMode ? 'text-[#00fff7] neon-text-cyan font-pixel' : 'text-foreground'}`}>
                {t('app.title')}
              </h1>
              {isGamingMode && (
                <p className="text-xs text-[#ff00ff] font-pixel-body animate-pulse">EVENT ALARM SYSTEM</p>
              )}
            </div>
          </div>

          {/* Center: Clock */}
          <div className={`hidden md:flex items-center gap-2 px-4 py-2 ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#12121a] pixel-glow' : 'bg-muted rounded-lg'}`}>
            <Clock className={`w-4 h-4 ${isGamingMode ? 'text-[#00fff7] pulse-neon' : 'text-primary'}`} />
            <span className={`text-lg font-bold ${isGamingMode ? 'text-[#00fff7]' : 'text-foreground font-mono'}`}>{currentTime}</span>
            <span className={`text-sm font-semibold ${isGamingMode ? 'text-[#ff00ff]' : 'text-muted-foreground'}`}>{language === 'id' ? 'WIB' : 'UTC'}</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Alarm Badge */}
            {alarmEnabled && (
              <button
                onClick={onOpenAlarmList}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-bold transition-colors ${isGamingMode ? 'border-3 border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10 hover:bg-[#39ff14]/30' : 'border border-primary text-primary bg-primary/10 rounded-md hover:bg-primary/20'}`}
                aria-label={`View ${alarmedEventsCount} alarms`}
              >
                <BellRing className="w-4 h-4 animate-pulse" />
                {alarmedEventsCount}
              </button>
            )}
            
            {/* Language */}
            <LanguageToggle isGamingMode={isGamingMode} />
            
            {/* Theme */}
            <ThemeToggle />
          </div>
        </div>

        {/* Divider */}
        <div className={`my-2 h-px ${isGamingMode ? 'bg-gradient-to-r from-transparent via-[#00fff7] to-transparent' : 'bg-border'}`} />

        {/* Second Row: Running Text (left) + Social Links (right) */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: Running Text / Announcement */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className={`animate-marquee whitespace-nowrap ${isGamingMode ? 'text-[#ffd700]' : 'text-muted-foreground'}`}>
              <span className="text-sm font-medium">{announcementText}</span>
              <span className="mx-8">•</span>
              <span className="text-sm font-medium">{announcementText}</span>
              <span className="mx-8">•</span>
            </div>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <SocialLink href="https://bloom-rover-b76.notion.site/How-You-Can-Contribute-To-GenLayer-1d75ecdf5d8b809e95c0dcc03585d04c" icon={<Users className="w-3.5 h-3.5" />} label="Role" isGamingMode={isGamingMode} color="#ffd700" />
            <Separator isGamingMode={isGamingMode} />
            <SocialLink href="https://discord.gg/NVuX2YyxGw" icon={<MessageCircle className="w-3.5 h-3.5" />} label="Discord" isGamingMode={isGamingMode} color="#5865F2" />
            <SocialLink href="https://x.com/GenLayer" icon={<Twitter className="w-3.5 h-3.5" />} label="X" isGamingMode={isGamingMode} color="#1DA1F2" />
            <SocialLink href="https://genlayer.com" icon={<ExternalLink className="w-3.5 h-3.5" />} label="Web" isGamingMode={isGamingMode} color="#00fff7" />
            <SocialLink href="https://portal.genlayer.foundation/" icon={<Globe className="w-3.5 h-3.5" />} label="Portal" isGamingMode={isGamingMode} color="#39ff14" />
          </div>
        </div>
      </div>

      {/* Admin Controls - Small corner position */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <button
          className={`h-7 text-[10px] px-2 rounded transition-colors ${demoMode ? 'text-red-400 bg-red-400/10' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}
          onClick={onToggleDemo}
          aria-label="Toggle demo mode"
        >
          {demoMode ? '🔴 DEMO' : 'DEMO'}
        </button>
        <button
          className={`h-7 text-[10px] px-2 rounded transition-colors ${adminMode ? 'text-green-400 bg-green-400/10' : 'text-muted-foreground opacity-50 hover:opacity-100'}`}
          onClick={onToggleAdmin}
          aria-label="Toggle admin mode"
        >
          {adminMode ? '🟢 ADMIN' : 'ADMIN'}
        </button>
        {adminMode && (
          <button
            className="h-7 text-[10px] px-2 rounded text-amber-400 bg-amber-400/10 transition-colors"
            onClick={onOpenAdminPanel}
            aria-label="Open admin panel"
          >
            MANAGE
          </button>
        )}
      </div>
    </header>
  )
}

function SocialLink({ 
  href, 
  icon, 
  label, 
  isGamingMode, 
  color 
}: { 
  href: string
  icon: React.ReactNode
  label: string
  isGamingMode: boolean
  color: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-all ${isGamingMode ? `text-[${color}] hover:bg-[${color}]/10` : 'text-foreground hover:bg-muted rounded'}`}
      style={isGamingMode ? { color } : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Visit ${label}`}
    >
      {icon}
      {label}
    </motion.a>
  )
}

function Separator({ isGamingMode }: { isGamingMode: boolean }) {
  return <span className={`${isGamingMode ? 'text-[#2a2a4e]' : 'text-border'}`}>|</span>
}
