import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'

export default function Profil() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [reminderTime, setReminderTime] = useState('08:00')
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        daily_reminder_time: reminderTime,
        daily_reminder_enabled: reminderEnabled,
      })
    if (error) toast.error('Erreur lors de la sauvegarde')
    else toast.success('Profil enregistré')
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

            {reminderEnabled && (
              <div>
                <label className="field-label">Heure d'envoi</label>
                <input
                  type="time"
                  className="input-field"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  style={{ width: 'auto' }}
                />
              </div>
            )}

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
