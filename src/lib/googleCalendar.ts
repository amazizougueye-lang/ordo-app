import { supabase } from './supabase'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

/* ─── GIS Script Loader ─── */
let gisLoaded = false
function loadGIS(): Promise<void> {
  if (gisLoaded) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => { gisLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

/* ─── OAuth consent flow ─── */
export async function connectGoogleCalendar(): Promise<{ email: string }> {
  await loadGIS()

  return new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: CALENDAR_SCOPE,
      access_type: 'offline',
      prompt: 'consent',
      callback: async (response: any) => {
        if (response.error) return reject(new Error(response.error))

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return reject(new Error('Not authenticated'))

        const res = await fetch('/api/google/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ code: response.code }),
        })

        const data = await res.json()
        if (!res.ok) return reject(new Error(data.error || 'Auth failed'))
        resolve({ email: data.email })
      },
    })
    client.requestCode()
  })
}

/* ─── Disconnect ─── */
export async function disconnectGoogleCalendar(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  await fetch('/api/google/disconnect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  })
}

/* ─── Calendar API calls via serverless ─── */
async function callCalendarAPI(body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  const res = await fetch('/api/google/calendar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (data.skipped) return null
  if (!res.ok) throw new Error(data.message || data.error || 'Calendar sync failed')
  return data
}

/* ─── Build Google Calendar event from Ordo deadline ─── */
function buildEvent(caseName: string, clientName: string, deadlineName: string, deadlineDate: string) {
  // End date = start + 1 day (Google all-day convention)
  const start = deadlineDate.slice(0, 10)
  const endDate = new Date(start)
  endDate.setDate(endDate.getDate() + 1)
  const end = endDate.toISOString().slice(0, 10)

  return {
    summary: `[Ordo] ${caseName} — ${deadlineName}`,
    description: `Client: ${clientName}\nDossier: ${caseName}\nDelai: ${deadlineName}\n\nGere par Ordo`,
    start: { date: start },
    end: { date: end },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 1440 }, // 1 day before
        { method: 'popup', minutes: 60 },   // 1 hour before
      ],
    },
  }
}

/* ─── Public sync functions ─── */
export async function syncDeadlineToGoogle(
  caseName: string,
  clientName: string,
  deadlineName: string,
  deadlineDate: string,
  existingEventId?: string | null,
): Promise<string | null> {
  try {
    const event = buildEvent(caseName, clientName, deadlineName, deadlineDate)
    const result = existingEventId
      ? await callCalendarAPI({ action: 'update', eventId: existingEventId, event })
      : await callCalendarAPI({ action: 'create', event })
    return result?.eventId || null
  } catch {
    return null
  }
}

export async function deleteGoogleEvent(eventId: string): Promise<void> {
  try {
    await callCalendarAPI({ action: 'delete', eventId })
  } catch {
    // Silent fail — event may already be deleted
  }
}
