import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { useGoogleCalendarSync } from '../hooks/useGoogleCalendarSync'
import { connectGoogleCalendar, disconnectGoogleCalendar } from '../lib/googleCalendar'
import { toast } from 'sonner'
import { Loader2, CheckCircle, Calendar } from 'lucide-react'

export default function Profil() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [urgentDays, setUrgentDays] = useState('1')
  const [monitorDays, setMonitorDays] = useState('7')
  const [saving, setSaving] = useState(false)
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const gcal = useGoogleCalendarSync()

  // Load saved settings from database on mount
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('daily_reminder_enabled, urgent_days, monitor_days')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        console.log('Load profile data:', { data, error })
        if (error) {
          console.error('Load error:', error)
        }
        if (data) {
          console.log('Setting values:', {
            reminderEnabled: data.daily_reminder_enabled ?? true,
            urgentDays: String(data.urgent_days ?? 1),
            monitorDays: String(data.monitor_days ?? 7),
          })
          setReminderEnabled(data.daily_reminder_enabled ?? true)
          setUrgentDays(String(data.urgent_days ?? 1))
          setMonitorDays(String(data.monitor_days ?? 7))
        } else {
          console.log('No profile data found for user:', user.id)
        }
      })
  }, [user])

  const handleSave = async () => {
    if (!user) return
    const urgent = Math.max(0, parseInt(urgentDays) || 1)
    const monitor = Math.max(urgent + 1, parseInt(monitorDays) || 7)
    setSaving(true)
    console.log('Saving:', { id: user.id, urgent_days: urgent, monitor_days: monitor })
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          daily_reminder_enabled: reminderEnabled,
          urgent_days: urgent,
          monitor_days: monitor,
        },
        { onConflict: 'id' }
      )
      .select()
    console.log('Save response:', { data, error })
    if (error) {
      console.error('Save error:', error)
      toast.error(`Erreur: ${error.message}`)
    } else {
      toast.success('Profil enregistré')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1
          className="text-[22px] font-semibold mb-8"
          style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
        >
          Profil
        </h1>

        {/* Email */}
        <div className="card p-5 mb-4">
          <p className="section-label mb-3">Compte</p>
          <p className="text-[13px]" style={{ color: '#475569' }}>{user?.email}</p>
        </div>

        {/* Urgency thresholds */}
        <div className="card p-5 mb-4">
          <p className="section-label mb-4">Seuils d'urgence (jours)</p>
          <div className="space-y-4">
            <div>
              <label className="field-label">Urgent si délai ≤</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={urgentDays}
                onChange={e => setUrgentDays(e.target.value)}
                placeholder="1"
              />
              <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>Jours avant la deadline</p>
            </div>
            <div>
              <label className="field-label">À surveiller si délai ≤</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={monitorDays}
                onChange={e => setMonitorDays(e.target.value)}
                placeholder="7"
              />
              <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>Jours avant la deadline (doit être &gt; Urgent)</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
                : <><CheckCircle size={14} /> Enregistrer</>
              }
            </button>
          </div>
        </div>

        {/* Daily reminder */}
        <div className="card p-5 mb-4">
          <p className="section-label mb-4">Rappel quotidien</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>Email de rappel</p>
                <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                  Résumé quotidien de vos dossiers urgents
                </p>
              </div>
              <button
                onClick={() => setReminderEnabled(v => !v)}
                className="relative w-10 h-6 rounded-full transition-colors"
                style={{ background: reminderEnabled ? '#1E293B' : '#E2E8F0' }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                  style={{ left: reminderEnabled ? 22 : 4 }}
                />
              </button>
            </div>


            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
                : <><CheckCircle size={14} /> Enregistrer rappel</>
              }
            </button>
          </div>
        </div>

        {/* Google Calendar */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} style={{ color: '#94A3B8' }} />
            <p className="section-label">Google Calendar</p>
          </div>

          {gcal.loading ? (
            <div className="flex items-center gap-2 text-[13px]" style={{ color: '#94A3B8' }}>
              <Loader2 size={14} className="animate-spin" /> Chargement…
            </div>
          ) : gcal.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>Connecté</p>
                  <p className="text-[12px] mt-0.5" style={{ color: '#94A3B8' }}>
                    {gcal.googleEmail}
                  </p>
                </div>
                <button
                  onClick={() => gcal.toggleSync(!gcal.syncEnabled)}
                  className="relative w-10 h-6 rounded-full transition-colors"
                  style={{ background: gcal.syncEnabled ? '#1E293B' : '#E2E8F0' }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                    style={{ left: gcal.syncEnabled ? 22 : 4 }}
                  />
                </button>
              </div>
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                {gcal.syncEnabled
                  ? 'Les échéances seront automatiquement synchronisées dans votre Google Calendar'
                  : 'La synchronisation est désactivée'}
              </p>
              <button
                onClick={async () => {
                  try {
                    await disconnectGoogleCalendar()
                    gcal.refresh()
                    toast.success('Google Calendar déconnecté')
                  } catch {
                    toast.error('Erreur de déconnexion')
                  }
                }}
                className="text-[12px] underline"
                style={{ color: '#DC2626' }}
              >
                Déconnecter Google Calendar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[13px]" style={{ color: '#475569' }}>
                Connectez votre Google Calendar pour synchroniser automatiquement vos échéances.
              </p>
              <button
                onClick={async () => {
                  setConnectingGoogle(true)
                  try {
                    const { email } = await connectGoogleCalendar()
                    gcal.refresh()
                    toast.success(`Connecté à ${email}`)
                  } catch (err: any) {
                    if (err.message !== 'popup_closed_by_user') {
                      toast.error('Erreur de connexion Google')
                    }
                  }
                  setConnectingGoogle(false)
                }}
                disabled={connectingGoogle}
                className="btn-primary flex items-center gap-2"
              >
                {connectingGoogle
                  ? <><Loader2 size={14} className="animate-spin" /> Connexion…</>
                  : <><Calendar size={14} /> Connecter Google Calendar</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="btn-secondary w-full"
          style={{ color: '#DC2626', borderColor: '#FECACA' }}
        >
          Se déconnecter
        </button>
      </div>
    </AppLayout>
  )
}
