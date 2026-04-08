import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useUrgencySettings() {
  const { user } = useAuth()
  const [urgentDays, setUrgentDays] = useState(1)
  const [monitorDays, setMonitorDays] = useState(7)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    supabase
      .from('profiles')
      .select('urgent_days, monitor_days')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setUrgentDays(data.urgent_days ?? 1)
          setMonitorDays(data.monitor_days ?? 7)
        }
        setLoading(false)
      })
  }, [user])

  return { urgentDays, monitorDays, loading }
}
