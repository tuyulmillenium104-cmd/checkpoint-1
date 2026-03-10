'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type Language = 'id' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  formatTime: (timeUTC: string) => string
  formatTimeWithLabel: (timeUTC: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'app.title': 'GenLayer Event Alarm',
    'app.subtitle': '',
    'roles': 'Roles',
    'alarm.on': 'ON',
    'alarm.off': 'OFF',
    
    // Next Event
    'nextEvent': 'Next Event',
    'alarmActive': 'Alarm Active',
    'setAlarm': 'Set Alarm',
    'alarmSet': 'Alarm Set',
    'removeAlarm': 'Remove',
    'joinEvent': 'Join Event',
    
    // Alarm List
    'alarmList': 'Alarm List',
    'noAlarms': 'No alarms set',
    'clearAllAlarms': 'Clear All Alarms',
    
    // Today's Events
    'todayEvents': "Today's Events",
    'noEventsToday': 'No events today',
    
    // Event Schedule
    'eventSchedule': 'Event Schedule',
    'maxXP': 'Max XP',
    'clickForDetails': 'Click for details',
    
    // My Alarms
    'myAlarms': 'My Alarms',
    
    // Event Detail
    'xpRewards': 'XP Rewards',
    'notes': 'Notes',
    'special': 'SPECIAL',
    
    // Days
    'MONDAY': 'Monday',
    'TUESDAY': 'Tuesday',
    'WEDNESDAY': 'Wednesday',
    'THURSDAY': 'Thursday',
    'FRIDAY': 'Friday',
    'SATURDAY': 'Saturday',
    'SUNDAY': 'Sunday',
    
    // Time
    'days': 'Days',
    'hours': 'Hours',
    'min': 'Min',
    'sec': 'Sec',
    
    // Footer
    'footer': 'GenLayer Events',
    
    // Notification
    'notification.set': 'Alarm set! You will be notified 5 minutes before the event.',
    'notification.removed': 'Alarm removed',
    'notification.startsIn': 'starts in',
    'minute': 'minute',
    'minutes': 'minutes',
    
    // Role System
    'roleSystem': 'GenLayer Role System',
    'roleHierarchy': 'Role Hierarchy',
    'requirements': 'Requirements',
    'perks': 'Perks',
    'functionalRoles': 'Functional Roles',
    'xpPoapSources': 'XP & POAP Sources',
    'monthlyContributor': 'Monthly Contributor Highlights',
    'importantNotes': 'Important Notes',
    'importantLinks': 'Important Links',
    'qualifyingRoles': 'Qualifying Roles',
    'orHigher': 'or higher',
    'roleInfo': 'Role Info',
    'rank': 'Rank',
    'clickRolesForInfo': 'Click role for more info',
    'monthlyHighlights': 'Monthly Highlights',
    'topContributors': 'Top Contributors',
  },
  id: {
    // Header
    'app.title': 'Alarm Event GenLayer',
    'app.subtitle': '',
    'roles': 'Role',
    'alarm.on': 'NYALA',
    'alarm.off': 'MATI',
    
    // Next Event
    'nextEvent': 'Event Berikutnya',
    'alarmActive': 'Alarm Aktif',
    'setAlarm': 'Setel Alarm',
    'alarmSet': 'Alarm Disetel',
    'removeAlarm': 'Hapus',
    'joinEvent': 'Gabung Event',
    
    // Alarm List
    'alarmList': 'Daftar Alarm',
    'noAlarms': 'Belum ada alarm',
    'clearAllAlarms': 'Hapus Semua Alarm',
    
    // Today's Events
    'todayEvents': 'Event Hari Ini',
    'noEventsToday': 'Tidak ada event hari ini',
    
    // Event Schedule
    'eventSchedule': 'Jadwal Event',
    'maxXP': 'Max XP',
    'clickForDetails': 'Klik untuk detail',
    
    // My Alarms
    'myAlarms': 'Alarm Saya',
    
    // Event Detail
    'xpRewards': 'Hadiah XP',
    'notes': 'Catatan',
    'special': 'SPESIAL',
    
    // Days
    'MONDAY': 'Senin',
    'TUESDAY': 'Selasa',
    'WEDNESDAY': 'Rabu',
    'THURSDAY': 'Kamis',
    'FRIDAY': 'Jumat',
    'SATURDAY': 'Sabtu',
    'SUNDAY': 'Minggu',
    
    // Time
    'days': 'Hari',
    'hours': 'Jam',
    'min': 'Men',
    'sec': 'Det',
    
    // Footer
    'footer': 'Event GenLayer',
    
    // Notification
    'notification.set': 'Alarm disetel! Anda akan diberitahu 5 menit sebelum event.',
    'notification.removed': 'Alarm dihapus',
    'notification.startsIn': 'dimulai dalam',
    'minute': 'menit',
    'minutes': 'menit',
    
    // Role System
    'roleSystem': 'Sistem Role GenLayer',
    'roleHierarchy': 'Hierarki Role',
    'requirements': 'Syarat',
    'perks': 'Keuntungan',
    'functionalRoles': 'Role Fungsional',
    'xpPoapSources': 'Sumber XP & POAP',
    'monthlyContributor': 'Highlight Kontributor Bulanan',
    'importantNotes': 'Catatan Penting',
    'importantLinks': 'Link Penting',
    'qualifyingRoles': 'Role yang Memenuhi Syarat',
    'orHigher': 'atau lebih tinggi',
    'roleInfo': 'Info Role',
    'rank': 'Peringkat',
    'clickRolesForInfo': 'Klik role untuk info lebih lanjut',
    'monthlyHighlights': 'Highlight Bulanan',
    'topContributors': 'Kontributor Teratas',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('id') // Default Indonesian

  const t = useCallback((key: string): string => {
    return translations[language][key] || key
  }, [language])

  // Convert UTC time to local time based on language
  // Indonesian: Convert UTC to WIB (UTC+7) with 24-hour format
  // English: Show UTC time with 12-hour AM/PM format
  const formatTime = useCallback((timeUTC: string): string => {
    const [hours, minutes] = timeUTC.split(':').map(Number)
    
    if (language === 'id') {
      // Convert UTC to WIB (UTC+7) - Use 24-hour format
      let wibHours = hours + 7
      if (wibHours >= 24) wibHours -= 24
      
      // 24-hour format: HH:MM
      return `${String(wibHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    } else {
      // English: Keep UTC in 12-hour AM/PM format
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours)
      
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
    }
  }, [language])

  // Format time with timezone label
  const formatTimeWithLabel = useCallback((timeUTC: string): string => {
    const formattedTime = formatTime(timeUTC)
    return language === 'id' ? `${formattedTime} WIB` : `${formattedTime} UTC`
  }, [language, formatTime])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatTime, formatTimeWithLabel }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Get current day name in selected language
export function useDayName() {
  const { language, t } = useLanguage()
  
  const getDayName = (day: string): string => {
    if (language === 'id') {
      const dayMap: Record<string, string> = {
        'MONDAY': 'Senin',
        'TUESDAY': 'Selasa',
        'WEDNESDAY': 'Rabu',
        'THURSDAY': 'Kamis',
        'FRIDAY': 'Jumat',
        'SATURDAY': 'Sabtu',
        'SUNDAY': 'Minggu'
      }
      return dayMap[day] || day
    }
    return day.charAt(0) + day.slice(1).toLowerCase()
  }
  
  return getDayName
}
