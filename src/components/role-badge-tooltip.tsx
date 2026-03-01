'use client'

import { useState, useRef } from 'react'
import { useTheme } from 'next-themes'

interface RoleBadgeTooltipProps {
  roleName: string
  roleColor: string
  roleEmoji?: string
  children: React.ReactNode
  t: (key: string) => string
}

export function RoleBadgeTooltip({ 
  roleName, 
  roleColor, 
  roleEmoji, 
  children, 
  t 
}: RoleBadgeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: '', bottom: '', left: '' })
  const triggerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const isGamingMode = theme === 'dark'

  // Get qualifying roles based on role name
  const getQualifyingRoles = (name: string): string[] => {
    const roleHierarchy: Record<string, string[]> = {
      'Novice': [],
      'Scout': ['Novice'],
      'Explorer': ['Novice', 'Scout'],
      'Pioneer': ['Novice', 'Scout', 'Explorer'],
      'Trailblazer': ['Novice', 'Scout', 'Explorer', 'Pioneer'],
      'Champion': ['Novice', 'Scout', 'Explorer', 'Pioneer', 'Trailblazer'],
      'Guardian': ['Novice', 'Scout', 'Explorer', 'Pioneer', 'Trailblazer', 'Champion'],
      'Legend': ['Novice', 'Scout', 'Explorer', 'Pioneer', 'Trailblazer', 'Champion', 'Guardian'],
      'Titan': ['Novice', 'Scout', 'Explorer', 'Pioneer', 'Trailblazer', 'Champion', 'Guardian', 'Legend'],
    }
    return roleHierarchy[name] || []
  }

  const qualifyingRoles = getQualifyingRoles(roleName)

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Show above if element is in lower half of viewport
      const shouldShowAbove = rect.bottom > viewportHeight / 2
      
      setTooltipPosition({
        left: `${rect.left}px`,
        top: shouldShowAbove ? '' : `${rect.bottom + 8}px`,
        bottom: shouldShowAbove ? `calc(100vh - ${rect.top}px + 8px)` : ''
      })
    }
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          className={`fixed z-[10000] min-w-[200px] max-w-[280px] p-3 ${
            isGamingMode 
              ? 'bg-[#0a0a0f] border-2 border-[#00fff7] shadow-[0_0_10px_#00fff7]' 
              : 'bg-card border border-border shadow-lg'
          }`}
          style={{
            left: tooltipPosition.left,
            ...(tooltipPosition.top ? { top: tooltipPosition.top } : { bottom: tooltipPosition.bottom }),
          }}
        >
          {/* Header */}
          <div className={`flex items-center gap-2 mb-2 pb-2 ${isGamingMode ? 'border-b border-[#2a2a4e]' : 'border-b border-border'}`}>
            {roleEmoji && <span className="text-lg">{roleEmoji}</span>}
            <span 
              className={`font-bold text-sm ${isGamingMode ? 'font-pixel' : ''}`}
              style={{ color: roleColor }}
            >
              {roleName}
            </span>
          </div>
          
          {/* Qualifying Roles */}
          {qualifyingRoles.length > 0 && (
            <div className="mb-2">
              <p className={`text-xs mb-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                {t('qualifyingRoles')}:
              </p>
              <div className="flex flex-wrap gap-1">
                {qualifyingRoles.map((role) => (
                  <span 
                    key={role}
                    className={`text-xs px-2 py-0.5 ${
                      isGamingMode 
                        ? 'bg-[#1a1a2e] text-white border border-[#2a2a4e]' 
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {role}
                  </span>
                ))}
              </div>
              <p className={`text-xs mt-1 ${isGamingMode ? 'text-[#00fff7]' : 'text-primary'}`}>
                {t('orHigher')}
              </p>
            </div>
          )}
          
          {/* Click hint */}
          <p className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
            💡 {t('clickRolesForInfo')}
          </p>
        </div>
      )}
    </div>
  )
}
