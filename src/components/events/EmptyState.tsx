'use client'

import { motion } from 'framer-motion'
import { Calendar, Search, Bell, Trophy } from 'lucide-react'

interface EmptyStateProps {
  type: 'no-events' | 'no-search' | 'no-alarms' | 'no-filter'
  isGamingMode: boolean
  searchQuery?: string
  onClearSearch?: () => void
}

export function EmptyState({ type, isGamingMode, searchQuery, onClearSearch }: EmptyStateProps) {
  const content = {
    'no-events': {
      icon: <Calendar className="w-16 h-16" />,
      title: 'No Events Today',
      description: 'There are no events scheduled for this day. Check other days!',
      action: null,
    },
    'no-search': {
      icon: <Search className="w-16 h-16" />,
      title: 'No Results Found',
      description: searchQuery 
        ? `No events match "${searchQuery}". Try a different search term.`
        : 'No events match your search criteria.',
      action: onClearSearch ? 'Clear Search' : null,
    },
    'no-alarms': {
      icon: <Bell className="w-16 h-16" />,
      title: 'No Alarms Set',
      description: 'Click the alarm icon on any event to set a reminder!',
      action: null,
    },
    'no-filter': {
      icon: <Trophy className="w-16 h-16" />,
      title: 'No Events in Category',
      description: 'Try selecting a different category or clear filters.',
      action: null,
    },
  }

  const { icon, title, description, action } = content[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${isGamingMode ? 'border-3 border-dashed border-[#2a2a4e]' : 'border border-dashed border-border rounded-xl'}`}
    >
      <div className={`mb-4 ${isGamingMode ? 'text-[#8888aa] opacity-50' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isGamingMode ? 'text-[#00fff7] font-pixel' : 'text-foreground'}`}>
        {title}
      </h3>
      <p className={`text-sm max-w-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
        {description}
      </p>
      {action && onClearSearch && (
        <button
          onClick={onClearSearch}
          className={`mt-4 px-4 py-2 text-sm font-bold ${isGamingMode ? 'border-2 border-[#ffd700] text-[#ffd700] hover:bg-[#ffd700]/10' : 'border border-primary text-primary rounded-lg hover:bg-primary/10'}`}
        >
          {action}
        </button>
      )}
    </motion.div>
  )
}
