// Translations for Indonesian and English

export type Language = 'en' | 'id'

export const translations = {
  en: {
    // Header
    title: 'GenLayer Event Alarm',
    date: 'February 2026',
    utc: 'UTC',
    wib: 'WIB',
    
    // Navigation
    roles: 'Roles',
    rolesTitle: 'GenLayer Role System',
    
    // Next Event
    nextEvent: 'Next Event',
    alarmActive: 'Alarm Active',
    maxXP: 'Max XP',
    clickForDetails: 'Click for details',
    
    // Today's Events
    todayEvents: "Today's Events",
    noEventsToday: 'No events today',
    
    // Event Schedule
    eventSchedule: 'Event Schedule',
    
    // My Alarms
    myAlarms: 'My Alarms',
    remove: 'Remove',
    
    // Event Detail
    xpRewards: 'XP Rewards',
    notes: 'Notes',
    setAlarm: 'Set Alarm',
    alarmSet: 'Alarm Set',
    alarmRemoved: 'Alarm removed',
    alarmSetMessage: 'Alarm set! You will be notified 5 minutes before the event.',
    startsIn: 'starts in',
    minute: 'minute',
    minutes: 'minutes',
    
    // Role System
    roleHierarchy: 'Role Hierarchy',
    functionalRoles: 'Functional Roles',
    requirements: 'Requirements',
    perks: 'Perks',
    
    // XP & POAP
    xpPoapSources: 'XP & POAP Sources',
    
    // Monthly Highlights
    monthlyHighlights: 'Monthly Contributor Highlights',
    top: 'Top',
    
    // Important
    importantNotes: 'Important Notes',
    importantLinks: 'Important Links',
    
    // Days
    days: {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday',
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday',
    },
    
    // Footer
    updated: 'Updated',
    
    // Theme
    light: 'Light',
    dark: 'Dark',
  },
  id: {
    // Header
    title: 'Alarm Event GenLayer',
    date: 'Februari 2026',
    utc: 'UTC',
    wib: 'WIB',
    
    // Navigation
    roles: 'Role',
    rolesTitle: 'Sistem Role GenLayer',
    
    // Next Event
    nextEvent: 'Event Berikutnya',
    alarmActive: 'Alarm Aktif',
    maxXP: 'Max XP',
    clickForDetails: 'Klik untuk detail',
    
    // Today's Events
    todayEvents: 'Event Hari Ini',
    noEventsToday: 'Tidak ada event hari ini',
    
    // Event Schedule
    eventSchedule: 'Jadwal Event',
    
    // My Alarms
    myAlarms: 'Alarm Saya',
    remove: 'Hapus',
    
    // Event Detail
    xpRewards: 'Hadiah XP',
    notes: 'Catatan',
    setAlarm: 'Pasang Alarm',
    alarmSet: 'Alarm Terpasang',
    alarmRemoved: 'Alarm dihapus',
    alarmSetMessage: 'Alarm terpasang! Anda akan diberitahu 5 menit sebelum event dimulai.',
    startsIn: 'dimulai dalam',
    minute: 'menit',
    minutes: 'menit',
    
    // Role System
    roleHierarchy: 'Hierarki Role',
    functionalRoles: 'Role Fungsional',
    requirements: 'Syarat',
    perks: 'Keuntungan',
    
    // XP & POAP
    xpPoapSources: 'Sumber XP & POAP',
    
    // Monthly Highlights
    monthlyHighlights: 'Highlight Kontributor Bulanan',
    top: 'Top',
    
    // Important
    importantNotes: 'Catatan Penting',
    importantLinks: 'Link Penting',
    
    // Days
    days: {
      MONDAY: 'Senin',
      TUESDAY: 'Selasa',
      WEDNESDAY: 'Rabu',
      THURSDAY: 'Kamis',
      FRIDAY: 'Jumat',
      SATURDAY: 'Sabtu',
      SUNDAY: 'Minggu',
    },
    
    // Footer
    updated: 'Diperbarui',
    
    // Theme
    light: 'Terang',
    dark: 'Gelap',
  }
}

// Convert UTC time to WIB (UTC+7)
export function utcToWib(timeUTC: string): string {
  const [hours, minutes] = timeUTC.split(':').map(Number)
  let wibHours = hours + 7
  
  if (wibHours >= 24) {
    wibHours -= 24
  }
  
  const period = wibHours >= 12 ? 'PM' : 'AM'
  let displayHours = wibHours % 12
  if (displayHours === 0) displayHours = 12
  
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}

// Get current time in WIB
export function getCurrentWIBTime(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', { 
    timeZone: 'Asia/Jakarta', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: true 
  })
}

// Get current WIB day
export function getCurrentWIBDay(): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const now = new Date()
  const wibDay = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return days[wibDay.getDay()]
}
