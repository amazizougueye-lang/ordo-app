import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import type { Case, CaseDeadline, DeadlineUrgency } from '../types'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarClock, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

const URGENCY_COLORS: Record<DeadlineUrgency, { dot: string; badge: string; badgeText: string; label: string }> = {
  urgent:  { dot: '#DC2626', badge: '#FEF2F2', badgeText: '#DC2626', label: 'Urgent' },
  monitor: { dot: '#F59E0B', badge: '#FFFBEB', badgeText: '#D97706', label: 'À surveiller' },
  stable:  { dot: '#10B981', badge: '#ECFDF5', badgeText: '#10B981', label: 'Stable' },
}

type NearestDeadline = {
  id: string | null
  name: string
  deadline: string
  urgency: DeadlineUrgency
  isMain: boolean
}

export default function Today() {
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [deadlinesByCase, setDeadlinesByCase] = useState<Record<string, CaseDeadline[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('cases').select('*').eq('user_id', user.id).eq('archived', false),
      supabase.from('case_deadlines').select('*').eq('user_id', user.id).order('deadline', { ascending: true }),
    ]).then(([{ data: casesData }, { data: deadlinesData }]) => {
      setCases((casesData as Case[]) || [])
      const map: Record<string, CaseDeadline[]> = {}
      ;(deadlinesData as CaseDeadline[] || []).forEach(d => {
        if (!map[d.case_id]) map[d.case_id] = []
        map[d.case_id].push(d)
      })
      setDeadlinesByCase(map)
      setLoading(false)
    })
  }, [user])

  const getNearestActive = useCallback((c: Case, dlMap: Record<string, CaseDeadline[]>): NearestDeadline | null => {
    const now = new Date()
    const candidates: NearestDeadline[] = []

    if (c.deadline) {
      candidates.push({
        id: null,
        name: c.deadline_name || 'Délai principal',
        deadline: c.deadline,
        urgency: (c.deadline_urgency || 'stable') as DeadlineUrgency,
        isMain: true,
      })
    }

    const extras = (dlMap[c.id] || []).filter(
      d => !d.completed && (!d.snoozed_until || new Date(d.snoozed_until) <= now)
    )
    extras.forEach(d => candidates.push({
      id: d.id,
      name: d.name,
      deadline: d.deadline,
      urgency: (d.urgency || 'stable') as DeadlineUrgency,
      isMain: false,
    }))

    if (candidates.length === 0) return null
    return candidates.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0]
  }, [])

  const completeDeadline = async (deadlineId: string, caseId: string) => {
    await supabase.from('case_deadlines').update({ completed: true }).eq('id', deadlineId)
    setDeadlinesByCase(prev => ({
      ...prev,
      [caseId]: (prev[caseId] || []).map(d => d.id === deadlineId ? { ...d, completed: true } : d),
    }))
    toast.success('Échéance marquée comme faite')
  }

  const today = new Date()

  // Enrich cases with nearest active deadline
  const enriched = cases
    .map(c => ({ c, nearest: getNearestActive(c, deadlinesByCase) }))
    .filter(({ nearest }) => nearest !== null) as Array<{ c: Case; nearest: NearestDeadline }>

  const urgentCases  = enriched.filter(({ nearest }) => nearest.urgency === 'urgent')
  const monitorCases = enriched.filter(({ nearest }) => nearest.urgency === 'monitor')
  const stableCases  = enriched.filter(({ nearest }) => nearest.urgency === 'stable')

  const deadlineLabel = (deadlineStr: string) => {
    const d = new Date(deadlineStr)
    const diff = differenceInDays(d, today)
    if (isPast(d) && !isToday(d)) return { text: `En retard de ${Math.abs(diff)}j`, color: '#DC2626' }
    if (isToday(d)) return { text: "Aujourd'hui", color: '#D97706' }
    if (diff === 1) return { text: 'Demain', color: '#D97706' }
    if (diff <= 7) return { text: `Dans ${diff}j`, color: '#475569' }
    return { text: format(d, 'd MMM', { locale: fr }), color: '#94A3B8' }
  }

  const CaseRow = ({ c, nearest }: { c: Case; nearest: NearestDeadline }) => {
    const uc = URGENCY_COLORS[nearest.urgency]
    const dl = deadlineLabel(nearest.deadline)

    return (
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-lg transition-colors"
        style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#FAFAFA' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF' }}
      >
        <Link to={`/dossier/${c.id}`} className="flex items-center gap-4 flex-1 min-w-0">
          {/* Urgency dot */}
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: uc.dot, flexShrink: 0 }} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: '#0F172A' }}>{c.name}</p>
            <div className="flex items-center gap-2">
              <p className="text-[12px]" style={{ color: '#94A3B8' }}>{c.client_name}</p>
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: uc.badge, color: uc.badgeText }}>
                {nearest.name}
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          <span className="text-[12px] font-medium" style={{ color: dl.color }}>{dl.text}</span>
          {!nearest.isMain && nearest.id && (
            <button
              onClick={() => completeDeadline(nearest.id!, c.id)}
              className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all"
              style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB' }}
              title="Marquer comme fait"
            >
              <Check size={11} /> Fait
            </button>
          )}
          <Link to={`/dossier/${c.id}`}>
            <ArrowRight size={14} style={{ color: '#CBD5E1' }} />
          </Link>
        </div>
      </div>
    )
  }

  const Section = ({
    title,
    items,
    color,
  }: {
    title: string
    items: Array<{ c: Case; nearest: NearestDeadline }>
    color: string
  }) => {
    if (items.length === 0) return null
    return (
      <div>
        <p className="section-label mb-3" style={{ color }}>{title}</p>
        <div className="space-y-2">
          {items.map(({ c, nearest }) => <CaseRow key={c.id} c={c} nearest={nearest} />)}
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
            {format(today, 'EEEE d MMMM yyyy', { locale: fr })}
          </p>
        </div>

        {loading ? (
          <p className="text-[13px]" style={{ color: '#94A3B8' }}>Chargement…</p>
        ) : enriched.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-[14px] font-medium mb-1" style={{ color: '#0F172A' }}>Aucun dossier actif</p>
            <p className="text-[13px]" style={{ color: '#94A3B8' }}>
              Créez votre premier dossier pour voir vos délais ici
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <Section title="🔴 Urgent" items={urgentCases} color="#DC2626" />
            <Section title="🟡 À surveiller" items={monitorCases} color="#D97706" />
            <Section title="🟢 Stable" items={stableCases} color="#10B981" />
          </div>
        )}
      </div>
    </AppLayout>
  )
}
