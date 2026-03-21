'use client'

import { useState, useCallback, useLayoutEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Gamepad2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useIsomorphicLayoutEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const isGamingMode = mounted && theme === 'dark'

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`w-10 h-10 p-0 ${isGamingMode ? 'border-3 border-[#ffd700] bg-[#12121a] hover:bg-[#ffd700]/20' : 'border border-border bg-card hover:bg-muted rounded-lg'}`}
      onClick={toggleTheme}
      title={isGamingMode ? 'Switch to Normal Mode' : 'Switch to Gaming Mode'}
      aria-label={isGamingMode ? 'Switch to normal mode' : 'Switch to gaming mode'}
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

export function LanguageToggle({ isGamingMode }: { isGamingMode: boolean }) {
  const { language, setLanguage } = useLanguage()

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`gap-1.5 text-xs ${isGamingMode ? 'border-3 border-[#ff00ff] bg-[#12121a] hover:bg-[#ff00ff]/20 font-bold' : ''}`}
      onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
      aria-label={`Switch to ${language === 'id' ? 'English' : 'Indonesian'}`}
    >
      <Globe className={`w-4 h-4 ${isGamingMode ? 'text-[#ff00ff]' : 'text-primary'}`} />
      <span className={`font-bold ${isGamingMode ? 'text-[#ff00ff]' : 'text-primary'}`}>{language === 'id' ? 'ID' : 'EN'}</span>
    </Button>
  )
}
