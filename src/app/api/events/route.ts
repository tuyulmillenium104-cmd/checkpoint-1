import { NextResponse } from 'next/server'
import { 
  events, 
  roles, 
  functionalRoles, 
  xpPoapSources, 
  monthlyContributorHighlights,
  importantLinks,
  importantNotes,
  getTodayEvents,
  getNextEvent,
  getEventsByDay,
  DAYS
} from '@/lib/events-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day')
  const action = searchParams.get('action')

  // Get specific data based on action
  if (action === 'today') {
    return NextResponse.json({
      success: true,
      data: getTodayEvents()
    })
  }

  if (action === 'next') {
    return NextResponse.json({
      success: true,
      data: getNextEvent()
    })
  }

  if (action === 'roles') {
    return NextResponse.json({
      success: true,
      data: { roles, functionalRoles }
    })
  }

  if (action === 'info') {
    return NextResponse.json({
      success: true,
      data: {
        xpPoapSources,
        monthlyContributorHighlights,
        importantLinks,
        importantNotes
      }
    })
  }

  // Get events by day
  if (day) {
    const upperDay = day.toUpperCase()
    if (DAYS.includes(upperDay as typeof DAYS[number])) {
      return NextResponse.json({
        success: true,
        day: upperDay,
        data: getEventsByDay(upperDay)
      })
    }
    return NextResponse.json({
      success: false,
      error: 'Invalid day. Use: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY'
    }, { status: 400 })
  }

  // Return all data
  return NextResponse.json({
    success: true,
    data: {
      events,
      roles,
      functionalRoles,
      xpPoapSources,
      monthlyContributorHighlights,
      importantLinks,
      importantNotes
    }
  })
}
