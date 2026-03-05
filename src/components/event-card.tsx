'use client'

import { motion } from 'framer-motion'
import { Clock, Trophy, AlertCircle, Gift, Star, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Event } from '@/lib/events-data'

interface EventCardProps {
  event: Event
  isNext?: boolean
}

export function EventCard({ event, isNext = false }: EventCardProps) {
  const maxXP = event.xpRewards.length > 0 
    ? Math.max(...event.xpRewards.map(r => r.xp))
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
        isNext 
          ? 'border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/20 to-transparent shadow-emerald-500/10' 
          : event.isSpecial
            ? 'border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-transparent'
            : 'border-border/50 hover:border-primary/30'
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-bold leading-tight">
              {event.name}
            </CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              {isNext && (
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  NEXT
                </Badge>
              )}
              {event.isSpecial && (
                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                  🔥 SPECIAL
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Time */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{event.time} UTC</span>
          </div>

          {/* Role Requirement */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 shrink-0 text-muted-foreground" />
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: event.roleColor + '40',
                color: event.roleColor,
                backgroundColor: event.roleColor + '15'
              }}
            >
              {event.roleReq}
            </Badge>
          </div>

          {/* Special Rewards */}
          {(event.hasPOAP || event.hasInsight || event.rewards) && (
            <div className="flex flex-wrap gap-1.5">
              {event.hasPOAP && (
                <Badge variant="secondary" className="text-xs bg-violet-500/20 text-violet-400 hover:bg-violet-500/30">
                  <Gift className="w-3 h-3 mr-1" />
                  POAP
                </Badge>
              )}
              {event.hasInsight && (
                <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                  <Star className="w-3 h-3 mr-1" />
                  Insight
                </Badge>
              )}
              {event.rewards?.map((reward, idx) => (
                !event.hasPOAP && !event.hasInsight && (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {reward}
                  </Badge>
                )
              ))}
            </div>
          )}

          {/* XP Rewards */}
          {event.xpRewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 shrink-0 text-amber-500" />
                <span className="text-sm font-medium text-amber-500">
                  Max: {maxXP.toLocaleString()} XP
                </span>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                {event.xpRewards.slice(0, 6).map((reward, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{reward.position}</span>
                    <span className="font-medium text-emerald-400">{reward.xp.toLocaleString()} XP</span>
                  </div>
                ))}
                {event.xpRewards.length > 6 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{event.xpRewards.length - 6} more positions...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && event.notes.length > 0 && (
            <div className="space-y-1">
              {event.notes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
