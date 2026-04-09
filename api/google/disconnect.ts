import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' })

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  // Get token to revoke
  const { data: tokens } = await supabase
    .from('google_tokens')
    .select('access_token')
    .eq('user_id', user.id)
    .single()

  if (tokens?.access_token) {
    // Revoke Google access (best effort)
    await fetch(`https://oauth2.googleapis.com/revoke?token=${tokens.access_token}`, {
      method: 'POST',
    }).catch(() => {})
  }

  // Delete from DB
  await supabase.from('google_tokens').delete().eq('user_id', user.id)

  // Clear google_event_id from user's cases and deadlines
  await supabase.from('cases').update({ google_event_id: null }).eq('user_id', user.id)
  await supabase.from('case_deadlines').update({ google_event_id: null }).eq('user_id', user.id)

  return res.json({ success: true })
}
