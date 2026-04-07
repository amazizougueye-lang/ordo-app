import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { computeStatus } from '../lib/utils'
import type { Case } from '../types'
import { format, isToday, isPast, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarClock, ArrowRight } from 'lucide-react'

export default function Today() {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('cases')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true })
      .then(({ data }) => {
        setCases((data as Case[]) || [])
        setLoading(false)
      })
  }, [user])

  const today = new Date()

  // Statut calculé automatiquement pour chaque dossier
  const withEffective = cases.map(c => ({
    ...c,
    effectiveStatus: computeStatus(c.status, c.deadline),
  }))

  const urgent = withEffective.filter(c => c.effectiveStatus === 'urgent')
  const surveiller = withEffective.filter(c => c.effectiveStatus === 'monitor')
  const others = withEffective.filter(c => c.effectiveStatus === 'stable')

  const CaseRow = ({ c }: { c: typeof withEffective[0] }) => {
    const deadline = c.deadline ? new Date(c.deadline) : null
    const diff = deadline ? differenceInDays(deadline, today) : null
    const isOverdue = deadline ? isPast(deadline) && !isToday(deadline) : false

    return (
      <Link
        to={`/dossier/${c.id}`}
        className="flex items-center justify-between px-4 py-3.5 rounded-lg transition-colors group"
        style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FAFAFA' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF' }}
      >
        <div className="flex items-center gap-4">
          <StatusBadge status={c.effectiveStatus} />
          <div>
            <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>{c.name}</p>
            <p className="text-[12px]" style={{ color: '#94A3B8' }}>{c.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {deadline && (
            <span
              className="text-[12px] font-medium"
              style={{ color: isOverdue ? '#DC2626' : isToday(deadline) ? '#D97706' : '#475569' }}
            >
              {isOverdue
                ? `En retard de ${Math.abs(diff!)}j`
                : isToday(deadline)
                ? "Aujourd'hui"
                : diff === 1
                ? 'Demain'
                : format(deadline, 'd MMM', { locale: fr })}
            </span>
          )}
          <ArrowRight size={14} style={{ color: '#CBD5E1' }} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Link>
    )
  }

  const Section = ({ title, items, color }: { title: string; items: typeof withEffective; color: string }) => {
    if (items.length === 0) return null
    return (
      <div>
        <p className="section-label mb-3" style={{ color }}>{title}</p>
        <div className="space-y-2">
          {items.map(c => <CaseRow key={c.id} c={c} />)}
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2.5 mb-1">
            <CalendarClock size={18} style={{ color: '#94A3B8' }} />
            <h1 className="text-[22px] font-semibold" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              Aujourd'hui
            </h1>
          </div>
          <p className="text-[13px] ml-7" style={{ color: '#94A3B8' }}>
            {format(today, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {loading ? (
          <p className="text-[13px]" style={{ color: '#94A3B8' }}>Chargement…</p>
        ) : cases.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-[14px] font-medium mb-1" style={{ color: '#0F172A' }}>Aucun dossier</p>
            <p className="text-[13px]" style={{ color: '#94A3B8' }}>
              Créez votre premier dossier pour voir vos délais ici
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <Section title="Urgent — aujourd'hui ou en retard" items={urgent} color="#DC2626" />
            <Section title="Cette semaine — délai dans 7 jours" items={surveiller} color="#D97706" />
            <Section title="À venir" items={others} color="#94A3B8" />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
