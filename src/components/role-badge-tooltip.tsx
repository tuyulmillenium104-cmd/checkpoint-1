'use client'

import { useState, useRef } from 'react'
import { useTheme } from 'next-themes'
import { roles } from '@/lib/events-data'

interface RoleBadgeTooltipProps {
  roleName: string
  roleColor: string
  children: React.ReactNode
  t: (key: string) => string
}

export function RoleBadgeTooltip({ 
  roleName, 
  roleColor, 
  children, 
  t 
}: RoleBadgeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: '', bottom: '', left: '' })
  const triggerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  const isGamingMode = resolvedTheme === 'dark'

  // Parse role name (e.g., "Molecule+" -> "Molecule")
  const baseRoleName = roleName.replace('+', '')
  
  // Find role info from roles data
  const roleInfo = roles.find(r => r.name === baseRoleName)
  
  // Get qualifying roles based on role name
  const getQualifyingRoles = (name: string): string[] => {
    const roleHierarchy: Record<string, string[]> = {
      'Molecule': ['Molecule'],
      'Neuron': ['Molecule', 'Neuron'],
      'Synapse': ['Molecule', 'Neuron', 'Synapse'],
      'Brain': ['Molecule', 'Neuron', 'Synapse', 'Brain'],
      'Singularity': ['Molecule', 'Neuron', 'Synapse', 'Brain', 'Singularity'],
    }
    return roleHierarchy[name] || [name]
  }

  const qualifyingRoles = getQualifyingRoles(baseRoleName)

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
      className="relative inline-block cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div
          className={`fixed z-[10000] min-w-[220px] max-w-[300px] p-3 ${
            isGamingMode 
              ? 'bg-[#0a0a0f] border-2 border-[#00fff7] shadow-[0_0_10px_#00fff7]' 
              : 'bg-card border border-border shadow-lg rounded-lg'
          }`}
          style={{
            left: tooltipPosition.left,
            ...(tooltipPosition.top ? { top: tooltipPosition.top } : { bottom: tooltipPosition.bottom }),
          }}
        >
          {/* Header */}
          <div className={`flex items-center gap-2 mb-2 pb-2 ${isGamingMode ? 'border-b border-[#2a2a4e]' : 'border-b border-border'}`}>
            {roleInfo?.emoji && <span className="text-lg">{roleInfo.emoji}</span>}
            <span 
              className={`font-bold text-sm ${isGamingMode ? 'font-pixel' : ''}`}
              style={{ color: roleColor }}
            >
              {roleName}
            </span>
          </div>
          
          {/* Role Info */}
          {roleInfo && (
            <div className="space-y-2 mb-2">
              <div>
                <p className={`text-xs mb-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                  {t('requirements')}:
                </p>
                <p className={`text-xs ${isGamingMode ? 'text-[#b8b8c8]' : 'text-foreground'}`}>
                  {roleInfo.requirements}
                </p>
              </div>
              <div>
                <p className={`text-xs mb-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
                  {t('perks')}:
                </p>
                <p className={`text-xs ${isGamingMode ? 'text-[#b8b8c8]' : 'text-foreground'}`}>
                  {roleInfo.perks}
                </p>
              </div>
            </div>
          )}
          
          {/* Qualifying Roles */}
          <div className="mb-2">
            <p className={`text-xs mb-1 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
              {t('qualifyingRoles')}:
            </p>
            <div className="flex flex-wrap gap-1">
              {qualifyingRoles.map((role) => {
                const r = roles.find(ro => ro.name === role)
                return (
                  <span 
                    key={role}
                    className={`text-xs px-2 py-0.5 ${
                      isGamingMode 
                        ? 'bg-[#1a1a2e] text-white border border-[#2a2a4e]' 
                        : 'bg-muted text-foreground rounded'
                    }`}
                  >
                    {r?.emoji} {role}
                  </span>
                )
              })}
            </div>
            <p className={`text-xs mt-1 ${isGamingMode ? 'text-[#00fff7]' : 'text-primary'}`}>
              {t('orHigher')}
            </p>
          </div>
          
          {/* Click hint */}
          <p className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
            💡 {t('clickRolesForInfo')}
          </p>
        </div>
      )}
    </div>
  )
}
