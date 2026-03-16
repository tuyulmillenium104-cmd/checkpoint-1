'use client'

import { motion } from 'framer-motion'
import { Calendar, Bell, Trophy, Star, Heart, Github, ExternalLink, Zap } from 'lucide-react'
import { StatsCard, SocialLink } from '@/components/ui-effects'

interface FooterProps {
  isGamingMode: boolean
  totalEvents: number
  alarmsCount: number
  specialEventsCount: number
  totalXP: number
}

export function Footer({
  isGamingMode,
  totalEvents,
  alarmsCount,
  specialEventsCount,
  totalXP,
}: FooterProps) {
  return (
    <footer className={`mt-auto relative ${isGamingMode ? 'border-t-4 border-[#2a2a4e] bg-[#0a0a0f]' : 'border-t border-border bg-background'}`}>
      {isGamingMode && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00fff7] via-[#ff00ff] to-[#39ff14] opacity-50 animate-pulse" />
      )}
      
      {/* Stats Section */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatsCard 
            icon={<Calendar className="w-6 h-6" />}
            value={totalEvents}
            label="Total Events"
            color="#00fff7"
            isGamingMode={isGamingMode}
            delay={0}
          />
          <StatsCard 
            icon={<Bell className="w-6 h-6" />}
            value={alarmsCount}
            label="Alarms Set"
            color="#39ff14"
            isGamingMode={isGamingMode}
            delay={0.1}
          />
          <StatsCard 
            icon={<Trophy className="w-6 h-6" />}
            value={specialEventsCount}
            label="Special Events"
            color="#ff00ff"
            isGamingMode={isGamingMode}
            delay={0.2}
          />
          <StatsCard 
            icon={<Star className="w-6 h-6" />}
            value={totalXP}
            label="Max XP Available"
            color="#ffd700"
            isGamingMode={isGamingMode}
            delay={0.3}
            formatValue={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString()}
          />
        </div>

        {/* Divider */}
        <div className={`my-4 h-px ${isGamingMode ? 'bg-gradient-to-r from-transparent via-[#2a2a4e] to-transparent' : 'bg-border'}`} />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Made with love */}
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
              Made with
            </span>
            <Heart className={`w-4 h-4 ${isGamingMode ? 'text-[#ff0040] animate-pulse' : 'text-red-500'}`} />
            <span className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
              for GenLayer Community
            </span>
          </div>

          {/* Center: Social Links */}
          <div className="flex items-center gap-2">
            <SocialLink 
              href="https://discord.gg/NVuX2YyxGw"
              icon={<ExternalLink className="w-4 h-4" />}
              label="Discord"
              color="#5865F2"
              isGamingMode={isGamingMode}
            />
            <SocialLink 
              href="https://x.com/GenLayer"
              icon={<ExternalLink className="w-4 h-4" />}
              label="X/Twitter"
              color="#1DA1F2"
              isGamingMode={isGamingMode}
            />
            <SocialLink 
              href="https://genlayer.com"
              icon={<ExternalLink className="w-4 h-4" />}
              label="Website"
              color="#00fff7"
              isGamingMode={isGamingMode}
            />
          </div>

          {/* Right: Version */}
          <div className="flex items-center gap-2">
            <Zap className={`w-3 h-3 ${isGamingMode ? 'text-[#ffd700]' : 'text-primary'}`} />
            <span className={`text-xs ${isGamingMode ? 'text-[#ffd700] font-bold' : 'text-muted-foreground font-medium'}`}>
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
