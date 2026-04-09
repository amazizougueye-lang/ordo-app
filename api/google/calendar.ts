import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

async function refreshAccessToken(supabase: ReturnType<typeof createClient>, userId: string, refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (data.error) {
    // Refresh token revoked — clean up
    await supabase.from('google_tokens').delete().eq('user_id', userId)
    throw new Error('TOKEN_REVOKED')
  }
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  await supabase.from('google_tokens').update({
    access_token: data.access_token,
    token_expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)
  return data.access_token
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  // Get stored Google tokens
  const { data: tokens } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tokens) return res.status(400).json({ error: 'Google Calendar not connected' })
  if (!tokens.calendar_sync_enabled) return res.json({ skipped: true })

  // Refresh token if expired
  let accessToken = tokens.access_token
  if (new Date(tokens.token_expires_at) <= new Date()) {
    try {
      accessToken = await refreshAccessToken(supabase, user.id, tokens.refresh_token)
    } catch (e: any) {
      if (e.message === 'TOKEN_REVOKED') {
        return res.status(401).json({ error: 'TOKEN_REVOKED', message: 'Votre connexion Google Calendar a expire. Veuillez vous reconnecter dans Profil.' })
      }
      throw e
    }
  }

  const { action, event, eventId } = req.body

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  try {
    if (action === 'create') {
      const gRes = await fetch(CALENDAR_API, {
        method: 'POST',
        headers,
        body: JSON.stringify(event),
      })
      const data = await gRes.json()
      if (!gRes.ok) return res.status(gRes.status).json({ error: data.error?.message || 'Google API error' })
      return res.json({ eventId: data.id })
    }

    if (action === 'update' && eventId) {
      const gRes = await fetch(`${CALENDAR_API}/${eventId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(event),
      })
      const data = await gRes.json()
      if (!gRes.ok) return res.status(gRes.status).json({ error: data.error?.message || 'Google API error' })
      return res.json({ eventId: data.id })
    }

    if (action === 'delete' && eventId) {
      const gRes = await fetch(`${CALENDAR_API}/${eventId}`, {
        method: 'DELETE',
        headers,
      })
      if (gRes.status === 204 || gRes.status === 410) return res.json({ deleted: true })
      return res.status(gRes.status).json({ error: 'Failed to delete event' })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}
