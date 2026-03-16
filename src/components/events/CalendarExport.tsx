'use client'

import { CalendarDays, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Event } from '@/lib/events-data'

interface CalendarExportProps {
  event: Event
  isGamingMode: boolean
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(event: Event): string {
  const baseUrl = 'https://calendar.google.com/calendar/render'
  const params = new URLSearchParams()
  
  // Get the next occurrence of this event
  const eventDate = getNextOccurrence(event.day)
  const [hours, minutes] = event.timeUTC.split(':').map(Number)
  
  // Create start and end datetime (UTC)
  const startDate = new Date(eventDate)
  startDate.setUTCHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate)
  endDate.setUTCMinutes(endDate.getUTCMinutes() + (event.duration || 60))
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  params.append('action', 'TEMPLATE')
  params.append('text', event.name)
  params.append('dates', `${formatDate(startDate)}/${formatDate(endDate)}`)
  params.append('details', event.description || `GenLayer Event - ${event.name}\n\nRole Required: ${event.roleReq}`)
  params.append('location', event.link || 'https://discord.gg/genlayer')
  params.append('sf', 'true')
  params.append('output', 'xml')
  
  return `${baseUrl}?${params.toString()}`
}

// Generate iCal content
export function generateICalContent(event: Event): string {
  const eventDate = getNextOccurrence(event.day)
  const [hours, minutes] = event.timeUTC.split(':').map(Number)
  
  const startDate = new Date(eventDate)
  startDate.setUTCHours(hours, minutes, 0, 0)
  
  const endDate = new Date(startDate)
  endDate.setUTCMinutes(endDate.getUTCMinutes() + (event.duration || 60))
  
  // Format dates for iCal (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const uid = `${event.id}@genlayer.com`
  const dtstamp = formatDate(new Date())
  
  let iCal = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GenLayer//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.name}
DESCRIPTION:${event.description || `GenLayer Event - ${event.name}. Role Required: ${event.roleReq}`}
LOCATION:${event.link || 'https://discord.gg/genlayer'}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
  
  return iCal
}

// Get next occurrence of a day
function getNextOccurrence(dayName: string): Date {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const targetDay = days.indexOf(dayName)
  const today = new Date()
  const currentDay = today.getUTCDay()
  
  let daysUntil = targetDay - currentDay
  if (daysUntil <= 0) {
    daysUntil += 7
  }
  
  const nextDate = new Date(today)
  nextDate.setUTCDate(today.getUTCDate() + daysUntil)
  return nextDate
}

// Download iCal file
function downloadICal(event: Event) {
  const iCalContent = generateICalContent(event)
  const blob = new Blob([iCalContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${event.name.replace(/\s+/g, '-')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function CalendarExport({ event, isGamingMode }: CalendarExportProps) {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        className={`text-xs gap-1 ${isGamingMode ? 'border-2 border-[#4285f4] text-[#4285f4] hover:bg-[#4285f4]/10' : ''}`}
        onClick={() => window.open(generateGoogleCalendarUrl(event), '_blank')}
        aria-label="Add to Google Calendar"
      >
        <CalendarDays className="w-4 h-4" />
        <span className="hidden sm:inline">Google</span>
      </Button>
      <Button
        size="sm"
        className={`text-xs gap-1 ${isGamingMode ? 'border-2 border-[#ff6600] text-[#ff6600] hover:bg-[#ff6600]/10' : ''}`}
        onClick={() => downloadICal(event)}
        aria-label="Download iCal file"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">iCal</span>
      </Button>
    </div>
  )
}

// Quick calendar add button for event cards
export function QuickCalendarButton({ 
  event, 
  isGamingMode 
}: { 
  event: Event
  isGamingMode: boolean 
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        window.open(generateGoogleCalendarUrl(event), '_blank')
      }}
      className={`p-1.5 transition-colors ${isGamingMode ? 'text-[#8888aa] hover:text-[#4285f4]' : 'text-muted-foreground hover:text-primary'}`}
      title="Add to Google Calendar"
      aria-label="Add to Google Calendar"
    >
      <CalendarDays className="w-4 h-4" />
    </button>
  )
}
