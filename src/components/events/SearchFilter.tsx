'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, Gamepad2, Trophy, MessageCircle, Calendar, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type EventCategory = 'all' | 'quiz' | 'game' | 'ama' | 'contest' | 'special'

interface SearchFilterProps {
  isGamingMode: boolean
  onSearch: (query: string) => void
  onCategoryChange: (category: EventCategory) => void
  searchQuery: string
  selectedCategory: EventCategory
  eventCount: number
  filteredCount: number
}

export function SearchFilter({
  isGamingMode,
  onSearch,
  onCategoryChange,
  searchQuery,
  selectedCategory,
  eventCount,
  filteredCount,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const categories: { id: EventCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: 'All', icon: <Calendar className="w-4 h-4" />, color: '#00fff7' },
    { id: 'quiz', label: 'Quiz', icon: <Trophy className="w-4 h-4" />, color: '#ff00ff' },
    { id: 'game', label: 'Games', icon: <Gamepad2 className="w-4 h-4" />, color: '#39ff14' },
    { id: 'ama', label: 'AMA', icon: <MessageCircle className="w-4 h-4" />, color: '#ffd700' },
    { id: 'contest', label: 'Contest', icon: <Zap className="w-4 h-4" />, color: '#ff6600' },
    { id: 'special', label: 'Special', icon: <Filter className="w-4 h-4" />, color: '#ff0040' },
  ]

  return (
    <div className={`p-4 ${isGamingMode ? 'border-3 border-[#2a2a4e] bg-[#12121a]' : 'border border-border bg-card rounded-xl'}`}>
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex-1 flex items-center gap-2 px-3 py-2 ${isGamingMode ? 'border-2 border-[#2a2a4e] bg-[#0a0a0f]' : 'border border-border bg-background rounded-lg'}`}>
          <Search className={`w-4 h-4 ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search events..."
            className={`flex-1 bg-transparent outline-none text-sm ${isGamingMode ? 'text-white placeholder:text-[#8888aa]' : 'text-foreground placeholder:text-muted-foreground'}`}
            aria-label="Search events"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className={`${isGamingMode ? 'text-[#ff0040] hover:text-[#ff0040]/80' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          className={`gap-2 ${isGamingMode ? `border-2 font-bold ${showFilters ? 'bg-[#ffd700] text-[#0a0a0f] border-[#ffd700]' : 'border-[#8888aa] text-[#8888aa]'}` : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </Button>
      </div>

      {/* Category Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all ${
                    isGamingMode
                      ? selectedCategory === cat.id
                        ? 'border-2'
                        : 'border-2 border-[#2a2a4e] text-[#8888aa] hover:border-[#ffd700]'
                      : selectedCategory === cat.id
                        ? 'rounded-md bg-primary text-primary-foreground'
                        : 'rounded-md border border-border text-muted-foreground hover:border-primary'
                  }`}
                  style={isGamingMode && selectedCategory === cat.id ? {
                    borderColor: cat.color,
                    color: cat.color,
                    backgroundColor: cat.color + '20'
                  } : undefined}
                  aria-pressed={selectedCategory === cat.id}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className={`text-xs ${isGamingMode ? 'text-[#8888aa]' : 'text-muted-foreground'}`}>
        {searchQuery || selectedCategory !== 'all' ? (
          <span>
            Showing <strong className={isGamingMode ? 'text-[#00fff7]' : 'text-primary'}>{filteredCount}</strong> of {eventCount} events
          </span>
        ) : (
          <span>
            <strong className={isGamingMode ? 'text-[#00fff7]' : 'text-primary'}>{eventCount}</strong> events total
          </span>
        )}
      </div>
    </div>
  )
}

// Hook for filtering events
export function useEventFilter(events: any[], query: string, category: EventCategory) {
  return useMemo(() => {
    let filtered = [...events]

    // Filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(lowerQuery) ||
        event.description?.toLowerCase().includes(lowerQuery) ||
        event.roleReq.toLowerCase().includes(lowerQuery)
      )
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(event => {
        switch (category) {
          case 'quiz':
            return event.name.toLowerCase().includes('quiz') || event.xpRewards?.length > 0
          case 'game':
            return ['smash karts', 'kirka', 'poker', 'chess', 'gartic', 'rumble', 'geoguessr'].some(g => 
              event.name.toLowerCase().includes(g)
            )
          case 'ama':
            return event.name.toLowerCase().includes('ama') || event.hasInsight
          case 'contest':
            return event.name.toLowerCase().includes('contest') || event.name.toLowerCase().includes('meme')
          case 'special':
            return event.isSpecial
          default:
            return true
        }
      })
    }

    return filtered
  }, [events, query, category])
}
