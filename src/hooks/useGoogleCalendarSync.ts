import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { syncDeadlineToGoogle, deleteGoogleEvent } from '../lib/googleCalendar'
import { toast } from 'sonner'

interface GoogleSyncState {
  isConnected: boolean
  syncEnabled: boolean
  googleEmail: string | null
  loading: boolean
}

export function useGoogleCalendarSync() {
  const { user } = useAuth()
  const [state, setState] = useState<GoogleSyncState>({
    isConnected: false,
    syncEnabled: false,
    googleEmail: null,
    loading: true,
  })

  const refresh = async () => {
    if (!user) { setState(s => ({ ...s, loading: false })); return }
    const { data } = await supabase
      .from('google_tokens')
      .select('google_email, calendar_sync_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    setState({
      isConnected: !!data,
      syncEnabled: data?.calendar_sync_enabled ?? false,
      googleEmail: data?.google_email ?? null,
      loading: false,
    })
  }

  useEffect(() => { refresh() }, [user])

  const toggleSync = async (enabled: boolean) => {
    if (!user) return
    await supabase
      .from('google_tokens')
      .update({ calendar_sync_enabled: enabled, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
    setState(s => ({ ...s, syncEnabled: enabled }))
  }

  const syncDeadline = async (
    caseName: string,
    clientName: string,
    deadlineName: string,
    deadlineDate: string,
    existingEventId?: string | null,
  ): Promise<string | null> => {
    if (!state.isConnected || !state.syncEnabled) return null
    try {
      return await syncDeadlineToGoogle(caseName, clientName, deadlineName, deadlineDate, existingEventId)
    } catch {
      toast.error('Erreur de synchronisation Google Calendar')
      return null
    }
  }

  const deleteEvent = async (eventId: string | null | undefined) => {
    if (!eventId || !state.isConnected || !state.syncEnabled) return
    try {
      await deleteGoogleEvent(eventId)
    } catch {
      // Silent
    }
  }

  return { ...state, refresh, toggleSync, syncDeadline, deleteEvent }
}
