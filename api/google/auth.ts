import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { code, redirectUri } = req.body
  if (!code) return res.status(400).json({ error: 'Missing code' })

  // Exchange authorization code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri || 'postmessage',
      grant_type: 'authorization_code',
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error) return res.status(400).json({ error: tokenData.error_description || tokenData.error })

  // Get Google email
  let googleEmail = null
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const info = await infoRes.json()
    googleEmail = info.email
  } catch {}

  // Store tokens
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
  const { error } = await supabase.from('google_tokens').upsert(
    {
      user_id: user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: expiresAt,
      google_email: googleEmail,
      calendar_sync_enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return res.status(500).json({ error: 'Failed to store tokens' })
  return res.json({ success: true, email: googleEmail })
}
