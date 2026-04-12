import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { computeEffectiveUrgency } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import type { Case, CaseDeadline, DeadlineUrgency } from '../types'
import { format, differenceInDays, isPast, isToday, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarClock, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

const URGENCY_COLORS: Record<DeadlineUrgency, { dot: string; badge: string; badgeText: string; label: string }> = {
  urgent:  { dot: '#DC2626', badge: '#FEF2F2', badgeText: '#DC2626', label: 'Urgent' },
  monitor: { dot: '#F59E0B', badge: '#FFFBEB', badgeText: '#D97706', label: 'À surveiller' },
  stable:  { dot: '#10B981', badge: '#ECFDF5', badgeText: '#10B981', label: 'Stable' },
}

const URGENCY_RANK: Record<DeadlineUrgency, number> = { urgent: 2, monitor: 1, stable: 0 }

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
        urgency: computeEffectiveUrgency(
          (c.deadline_urgency || 'stable') as DeadlineUrgency,
          c.deadline
        ),
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
      urgency: computeEffectiveUrgency(
        (d.urgency || 'stable') as DeadlineUrgency,
        d.deadline,
        d.monitor_days ?? null,
        d.urgent_days ?? null
      ),
      isMain: false,
    }))

    if (candidates.length === 0) return null
    return candidates.sort((a, b) => {
      const rankDiff = URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]
      if (rankDiff !== 0) return rankDiff
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })[0]
  }, [])

  const getAllActive = useCallback((c: Case, dlMap: Record<string, CaseDeadline[]>): NearestDeadline[] => {
    const now = new Date()
    const candidates: NearestDeadline[] = []

    if (c.deadline) {
      candidates.push({
        id: null,
        name: c.deadline_name || 'Délai principal',
        deadline: c.deadline,
        urgency: computeEffectiveUrgency(
          (c.deadline_urgency || 'stable') as DeadlineUrgency,
          c.deadline
        ),
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
      urgency: computeEffectiveUrgency(
        (d.urgency || 'stable') as DeadlineUrgency,
        d.deadline,
        d.monitor_days ?? null,
        d.urgent_days ?? null
      ),
      isMain: false,
    }))

    return candidates.sort((a, b) => {
      const rankDiff = URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]
      if (rankDiff !== 0) return rankDiff
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  }, [])

  const completeDeadline = async (deadlineId: string, caseId: string) => {
    await supabase.from('case_deadlines').update({ completed: true }).eq('id', deadlineId)
    setDeadlinesByCase(prev => ({
      ...prev,
      [caseId]: (prev[caseId] || []).map(d => d.id === deadlineId ? { ...d, completed: true } : d),
    }))
    toast.success('Échéance marquée comme faite')
  }

  const completeMainDeadline = async (caseId: string) => {
    await supabase.from('cases').update({ deadline: null, deadline_name: null, deadline_urgency: null }).eq('id', caseId)
    setCases(prev => prev.map(c => c.id === caseId ? { ...c, deadline: null, deadline_name: null, deadline_urgency: null } : c))
    toast.success('Délai principal marqué comme fait')
  }

  const today = new Date()
  const in7 = addDays(today, 7)

  const enriched = cases
    .map(c => ({
      c,
      nearest: getNearestActive(c, deadlinesByCase),
      allDeadlines: getAllActive(c, deadlinesByCase),
    }))
    .filter(({ nearest }) => nearest !== null) as Array<{ c: Case; nearest: NearestDeadline; allDeadlines: NearestDeadline[] }>

  const urgentCases  = enriched.filter(({ nearest }) => nearest.urgency === 'urgent')
  const monitorCases = enriched.filter(({ nearest }) => nearest.urgency === 'monitor')
  const stableCases  = enriched.filter(({ nearest }) => nearest.urgency === 'stable')

  const weekCases = enriched.filter(({ nearest }) => {
    const d = new Date(nearest.deadline)
    return d >= today && d <= in7
  })

  const deadlineLabel = (deadlineStr: string) => {
    const d = new Date(deadlineStr)
    const diff = differenceInDays(d, today)
    if (isPast(d) && !isToday(d)) return { text: `En retard de ${Math.abs(diff)}j`, color: '#DC2626' }
    if (isToday(d)) return { text: "Aujourd'hui", color: '#D97706' }
    if (diff === 1) return { text: 'Demain', color: '#D97706' }
    if (diff <= 7) return { text: `Dans ${diff}j`, color: '#475569' }
    return { text: format(d, 'd MMM', { locale: fr }), color: '#94A3B8' }
  }

  const CaseRow = ({ c, nearest, allDeadlines, sectionUrgency }: {
    c: Case
    nearest: NearestDeadline
    allDeadlines: NearestDeadline[]
    sectionUrgency: DeadlineUrgency | null
  }) => {
    const uc = URGENCY_COLORS[nearest.urgency]
    // Filter to only the deadlines relevant to this section (null = show all, e.g. "Cette semaine")
    const visibleDeadlines = sectionUrgency
      ? allDeadlines.filter(dl => dl.urgency === sectionUrgency)
      : allDeadlines

    return (
      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        {/* Card header — case name + link */}
        <Link
          to={`/dossier/${c.id}`}
          className="flex items-center justify-between px-4 py-3 transition-colors"
          style={{ background: '#FAFAFA' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#FAFAFA' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: uc.dot, flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-[13px] font-medium truncate" style={{ color: '#0F172A' }}>{c.name}</p>
              <p className="text-[12px]" style={{ color: '#94A3B8' }}>{c.client_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {visibleDeadlines.length > 1 && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: '#F1F5F9', color: '#64748B' }}>
                {visibleDeadlines.length} échéances
              </span>
            )}
            <ArrowRight size={14} style={{ color: '#CBD5E1' }} />
          </div>
        </Link>

        {/* Deadline rows — only those matching sectionUrgency */}
        <div style={{ borderTop: '1px solid #F1F5F9' }}>
          {visibleDeadlines.map((dl, idx) => {
            const dlUC = URGENCY_COLORS[dl.urgency]
            const dlLabel = deadlineLabel(dl.deadline)
            return (
              <div
                key={dl.id || `main-${idx}`}
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: idx < visibleDeadlines.length - 1 ? '1px solid #F8FAFC' : 'none' }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: dlUC.dot, flexShrink: 0 }} />
                  <span className="text-[12px] truncate" style={{ color: '#475569' }}>{dl.name}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0" style={{ background: dlUC.badge, color: dlUC.badgeText }}>
                    {dlUC.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-[11px] font-medium" style={{ color: dlLabel.color }}>{dlLabel.text}</span>
                  <button
                    onClick={e => { e.preventDefault(); dl.isMain ? completeMainDeadline(c.id) : completeDeadline(dl.id!, c.id) }}
                    className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md transition-all"
                    style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                    title="Marquer comme fait"
                  >
                    <Check size={10} /> Fait
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const Section = ({
    title,
    items,
    color,
    sectionUrgency,
  }: {
    title: string
    items: Array<{ c: Case; nearest: NearestDeadline; allDeadlines: NearestDeadline[] }>
    color: string
    sectionUrgency: DeadlineUrgency
  }) => {
    if (items.length === 0) return null
    return (
      <div>
        <p className="section-label mb-3" style={{ color }}>{title}</p>
        <div className="space-y-2">
          {items.map(({ c, nearest, allDeadlines }) => (
            <CaseRow key={c.id} c={c} nearest={nearest} allDeadlines={allDeadlines} sectionUrgency={sectionUrgency} />
          ))}
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
        ) : (
          <>
            {enriched.length === 0 ? (
              <div className="card p-10 text-center mb-10">
                <p className="text-[14px] font-medium mb-1" style={{ color: '#0F172A' }}>Aucun dossier actif</p>
                <p className="text-[13px]" style={{ color: '#94A3B8' }}>
                  Créez votre premier dossier pour voir vos délais ici
                </p>
              </div>
            ) : (
              <div className="space-y-8 mb-12">
                <Section title="🔴 Urgent" items={urgentCases} color="#DC2626" sectionUrgency="urgent" />
                <Section title="🟡 À surveiller" items={monitorCases} color="#D97706" sectionUrgency="monitor" />
                <Section title="🟢 Stable" items={stableCases} color="#10B981" sectionUrgency="stable" />
              </div>
            )}

            {weekCases.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div style={{ height: 1, flex: 1, background: '#E2E8F0' }} />
                  <p className="text-[12px] font-medium px-3" style={{ color: '#94A3B8' }}>📅 Cette semaine</p>
                  <div style={{ height: 1, flex: 1, background: '#E2E8F0' }} />
                </div>
                <div className="space-y-2">
                  {weekCases.map(({ c, nearest, allDeadlines }) => (
                    <CaseRow key={`week-${c.id}`} c={c} nearest={nearest} allDeadlines={allDeadlines} sectionUrgency={null} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
