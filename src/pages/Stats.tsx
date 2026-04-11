import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { generatePdfContent, downloadPdf } from '../lib/pdfGenerator'
import type { Case, CaseDeadline, DeadlineUrgency } from '../types'
import { format, differenceInDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertCircle, Clock, CheckCircle, Archive, Calendar, Download } from 'lucide-react'

interface Stats {
  total: number
  urgent: number
  monitor: number
  stable: number
  archived: number
  byType: Record<string, number>
  upcomingDeadlines: Array<{ caseName: string, deadline: string, daysLeft: number, urgency: DeadlineUrgency }>
}

// Determine effective urgency from manual setting + nearest deadline
function getEffectiveUrgency(c: Case, extras: CaseDeadline[]): DeadlineUrgency {
  const candidates: { deadline: string; urgency: DeadlineUrgency }[] = []
  if (c.deadline) {
    candidates.push({ deadline: c.deadline, urgency: (c.deadline_urgency as DeadlineUrgency) || 'stable' })
  }
  const activeExtras = extras.filter(d => !d.completed && (!d.snoozed_until || new Date(d.snoozed_until) <= new Date()))
  activeExtras.forEach(d => candidates.push({ deadline: d.deadline, urgency: (d.urgency as DeadlineUrgency) || 'stable' }))
  if (candidates.length === 0) return 'stable'
  candidates.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  return candidates[0].urgency
}

export default function Stats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('cases').select('*').eq('user_id', user.id),
      supabase.from('case_deadlines').select('*').eq('user_id', user.id),
    ]).then(([{ data: casesData }, { data: deadlinesData }]) => {
      const allCases = (casesData as Case[]) || []
      const allDeadlines = (deadlinesData as CaseDeadline[]) || []

      const activeCases = allCases.filter(c => !c.archived)
      const activeDeadlines = allDeadlines.filter(d => !d.completed)

      // Map deadlines by case
      const dlMap: Record<string, CaseDeadline[]> = {}
      activeDeadlines.forEach(d => {
        if (!dlMap[d.case_id]) dlMap[d.case_id] = []
        dlMap[d.case_id].push(d)
      })

      let urgent = 0, monitor = 0, stable = 0
      activeCases.forEach(c => {
        const urgency = getEffectiveUrgency(c, dlMap[c.id] || [])
        if (urgency === 'urgent') urgent++
        else if (urgency === 'monitor') monitor++
        else stable++
      })

      // By type
      const byType: Record<string, number> = {}
      activeCases.forEach(c => {
        const type = c.case_type || 'autre'
        byType[type] = (byType[type] || 0) + 1
      })

      // Upcoming deadlines (next 30 days) — main + additional
      const now = new Date()
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const upcomingDeadlines: Stats['upcomingDeadlines'] = []

      activeCases.forEach(c => {
        if (c.deadline) {
          const deadline = new Date(c.deadline)
          if (deadline >= now && deadline <= in30Days) {
            upcomingDeadlines.push({
              caseName: c.name,
              deadline: format(deadline, 'd MMM yyyy', { locale: fr }),
              daysLeft: differenceInDays(deadline, now),
              urgency: (c.deadline_urgency as DeadlineUrgency) || 'stable',
            })
          }
        }
      })

      activeDeadlines.forEach(d => {
        const deadline = new Date(d.deadline)
        if (deadline >= now && deadline <= in30Days) {
          const c = allCases.find(x => x.id === d.case_id && !x.archived)
          if (c) {
            upcomingDeadlines.push({
              caseName: `${c.name} — ${d.name}`,
              deadline: format(deadline, 'd MMM yyyy', { locale: fr }),
              daysLeft: differenceInDays(deadline, now),
              urgency: (d.urgency as DeadlineUrgency) || 'stable',
            })
          }
        }
      })

      upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft)

      setStats({
        total: activeCases.length,
        urgent,
        monitor,
        stable,
        archived: allCases.filter(c => c.archived).length,
        byType,
        upcomingDeadlines: upcomingDeadlines.slice(0, 10),
      })
      setLoading(false)
    })
  }, [user])

  const urgencyColor = (u: DeadlineUrgency) => {
    if (u === 'urgent') return '#DC2626'
    if (u === 'monitor') return '#D97706'
    return '#10B981'
  }

  const maxCases = stats ? Math.max(...Object.values(stats.byType), 1) : 1

  const handleExportOutlook = async () => {
    if (!user) return
    const [{ data: casesData }, { data: deadlinesData }] = await Promise.all([
      supabase.from('cases').select('*').eq('user_id', user.id),
      supabase.from('case_deadlines').select('*').eq('user_id', user.id),
    ])
    const pdfContent = generatePdfContent(
      (casesData as Case[]) || [],
      (deadlinesData as CaseDeadline[]) || []
    )
    downloadPdf(pdfContent)
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8' }}>Chargement…</div>
    </AppLayout>
  )

  if (!stats) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <p style={{ color: '#94A3B8' }}>Aucune donnée</p>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[24px] font-semibold" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            Statistiques
          </h1>
          <button
            onClick={handleExportOutlook}
            className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-colors"
            style={{ background: '#3B82F6', color: '#FFFFFF' }}
            title="Exporter tous les délais en fichier .ics pour Outlook"
          >
            <Download size={14} />
            Export Outlook
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="card p-5">
            <p className="text-[11px] mb-2" style={{ color: '#94A3B8' }}>Total</p>
            <p className="text-[28px] font-semibold" style={{ color: '#0F172A' }}>{stats.total}</p>
            <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>Dossiers actifs</p>
          </div>
          <div className="card p-5" style={{ borderTop: '3px solid #DC2626' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={14} style={{ color: '#DC2626' }} />
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>Urgent</p>
            </div>
            <p className="text-[28px] font-semibold" style={{ color: '#DC2626' }}>{stats.urgent}</p>
            <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>{Math.round(stats.total ? (stats.urgent / stats.total * 100) : 0)}% du total</p>
          </div>
          <div className="card p-5" style={{ borderTop: '3px solid #D97706' }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} style={{ color: '#D97706' }} />
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>Surveiller</p>
            </div>
            <p className="text-[28px] font-semibold" style={{ color: '#D97706' }}>{stats.monitor}</p>
            <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>{Math.round(stats.total ? (stats.monitor / stats.total * 100) : 0)}% du total</p>
          </div>
          <div className="card p-5" style={{ borderTop: '3px solid #10B981' }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} style={{ color: '#10B981' }} />
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>Stable</p>
            </div>
            <p className="text-[28px] font-semibold" style={{ color: '#10B981' }}>{stats.stable}</p>
            <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>{Math.round(stats.total ? (stats.stable / stats.total * 100) : 0)}% du total</p>
          </div>
          <div className="card p-5" style={{ borderTop: '3px solid #94A3B8' }}>
            <div className="flex items-center gap-2 mb-2">
              <Archive size={14} style={{ color: '#94A3B8' }} />
              <p className="text-[11px]" style={{ color: '#94A3B8' }}>Archivés</p>
            </div>
            <p className="text-[28px] font-semibold" style={{ color: '#64748B' }}>{stats.archived}</p>
            <p className="text-[12px] mt-2" style={{ color: '#94A3B8' }}>Fermés</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#0F172A' }}>Par type</h3>
            <div className="space-y-3">
              {Object.entries(stats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] capitalize" style={{ color: '#475569' }}>{type}</p>
                    <p className="text-[12px] font-semibold" style={{ color: '#0F172A' }}>{count}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${(count / maxCases) * 100}%`, backgroundColor: '#3B82F6' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} style={{ color: '#94A3B8' }} />
              <h3 className="text-[14px] font-semibold" style={{ color: '#0F172A' }}>Prochains 30 jours</h3>
            </div>
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-[12px]" style={{ color: '#94A3B8' }}>Aucun délai prévu</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {stats.upcomingDeadlines.map((dl, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: `${urgencyColor(dl.urgency)}15`,
                      borderLeft: `3px solid ${urgencyColor(dl.urgency)}`,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium truncate" style={{ color: '#0F172A' }}>{dl.caseName}</p>
                        <p style={{ color: '#94A3B8' }}>{dl.deadline}</p>
                      </div>
                      <p className="text-[11px] ml-2 shrink-0 font-semibold" style={{ color: urgencyColor(dl.urgency) }}>
                        {dl.daysLeft === 0 ? "Aujourd'hui" : `${dl.daysLeft}j`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Distribution donut */}
        <div className="card p-6">
          <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#0F172A' }}>Distribution statuts</h3>
          <div className="flex items-center gap-8">
            <svg width="200" height="200" viewBox="0 0 200 200" className="shrink-0">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#DC2626" strokeWidth="20"
                strokeDasharray={`${stats.total ? (stats.urgent / stats.total) * 503.3 : 0} 503.3`} />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#D97706" strokeWidth="20"
                strokeDasharray={`${stats.total ? (stats.monitor / stats.total) * 503.3 : 0} 503.3`}
                strokeDashoffset={`${stats.total ? -(stats.urgent / stats.total) * 503.3 : 0}`} />
              <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="20"
                strokeDasharray={`${stats.total ? (stats.stable / stats.total) * 503.3 : 0} 503.3`}
                strokeDashoffset={`${stats.total ? -((stats.urgent + stats.monitor) / stats.total) * 503.3 : 0}`} />
              <text x="100" y="110" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#0F172A">{stats.total}</text>
            </svg>
            <div className="space-y-3">
              {[
                { label: 'Urgent', count: stats.urgent, color: '#DC2626' },
                { label: 'À surveiller', count: stats.monitor, color: '#D97706' },
                { label: 'Stable', count: stats.stable, color: '#10B981' },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ background: color }} />
                  <p className="text-[12px]" style={{ color: '#475569' }}>
                    {label}: {count} ({Math.round(stats.total ? (count / stats.total * 100) : 0)}%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
