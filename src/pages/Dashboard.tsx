import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { computeStatus } from '../lib/utils'
import { useUrgencySettings } from '../hooks/useUrgencySettings'
import type { Case, CaseStatus, CaseDeadline } from '../types'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Search, Pin, Plus, ChevronDown, ChevronUp, ArrowRight, MessageSquare
} from 'lucide-react'
import type { Note } from '../types'

type SortKey = 'deadline' | 'created_at'
type FilterStatus = CaseStatus | 'all' | 'archived'

const filterLabels: Record<FilterStatus, string> = {
  all: 'Tous',
  urgent: 'Urgent',
  monitor: 'À surveiller',
  stable: 'Actifs',
  archived: 'Archivés',
}

export default function Dashboard() {
  const { user } = useAuth()
  const { urgentDays, monitorDays } = useUrgencySettings()
  const [cases, setCases] = useState<Case[]>([])
  const [notesMap, setNotesMap] = useState<Record<string, Note>>({})
  const [deadlinesByCase, setDeadlinesByCase] = useState<Record<string, CaseDeadline[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('deadline')
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('cases').select('*').eq('user_id', user.id),
      supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('case_deadlines').select('*').eq('user_id', user.id).order('deadline', { ascending: true }),
    ]).then(([{ data: casesData }, { data: notesData }, { data: deadlinesData }]) => {
      setCases((casesData as Case[]) || [])
      const map: Record<string, Note> = {}
      ;(notesData as Note[] || []).forEach(note => {
        if (!map[note.case_id]) map[note.case_id] = note
      })
      setNotesMap(map)
      const deadlineMap: Record<string, CaseDeadline[]> = {}
      ;(deadlinesData as CaseDeadline[] || []).forEach(dl => {
        if (!deadlineMap[dl.case_id]) deadlineMap[dl.case_id] = []
        deadlineMap[dl.case_id].push(dl)
      })
      setDeadlinesByCase(deadlineMap)
      setLoading(false)
    })
  }, [user])

  const togglePin = async (c: Case, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = !c.pinned
    await supabase.from('cases').update({ pinned: updated }).eq('id', c.id)
    setCases(prev => prev.map(x => x.id === c.id ? { ...x, pinned: updated } : x))
  }

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(true) }
  }

  const getNearestDeadline = (c: Case): { deadline: string, name: string } | null => {
    const allDeadlines = [
      ...(c.deadline ? [{ deadline: c.deadline, name: c.deadline_name || 'Principal' }] : []),
      ...(deadlinesByCase[c.id] || []).map(d => ({ deadline: d.deadline, name: d.name }))
    ]
    if (allDeadlines.length === 0) return null
    return allDeadlines.reduce((nearest, current) => {
      const currentTime = new Date(current.deadline).getTime()
      const nearestTime = new Date(nearest.deadline).getTime()
      return currentTime < nearestTime ? current : nearest
    })
  }

  const filtered = cases
    .filter(c => {
      const q = search.toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.client_name.toLowerCase().includes(q)) return false
      if (filter === 'archived') return c.archived
      if (c.archived) return false
      const nearestDeadline = getNearestDeadline(c)
      if (filter !== 'all' && computeStatus(c.status, nearestDeadline?.deadline || null, urgentDays, monitorDays) !== filter) return false
      return true
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (sortKey === 'deadline') {
        const da = getNearestDeadline(a)?.deadline ? new Date(getNearestDeadline(a)!.deadline).getTime() : Infinity
        const db = getNearestDeadline(b)?.deadline ? new Date(getNearestDeadline(b)!.deadline).getTime() : Infinity
        return sortAsc ? da - db : db - da
      }
      const da = new Date(a.created_at).getTime()
      const db = new Date(b.created_at).getTime()
      return sortAsc ? da - db : db - da
    })

  const deadlineLabel = (deadline: string | null) => {
    if (!deadline) return null
    const d = new Date(deadline)
    const diff = differenceInDays(d, new Date())
    if (isPast(d) && !isToday(d)) return { text: `En retard`, color: '#DC2626', bg: '#FEF2F2' }
    if (isToday(d)) return { text: "Aujourd'hui", color: '#D97706', bg: '#FFFBEB' }
    if (diff <= 3) return { text: `Dans ${diff}j`, color: '#D97706', bg: '#FFFBEB' }
    return { text: format(d, 'd MMM yyyy', { locale: fr }), color: '#475569', bg: 'transparent' }
  }

  const getStatusBarColor = (c: Case) => {
    const nearest = getNearestDeadline(c)
    const status = computeStatus(c.status, nearest?.deadline || null, urgentDays, monitorDays)
    if (status === 'urgent') return '#DC2626'
    if (status === 'monitor') return '#D97706'
    return '#E2E8F0'
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={11} style={{ color: '#CBD5E1' }} />
    return sortAsc
      ? <ChevronUp size={11} style={{ color: '#475569' }} />
      : <ChevronDown size={11} style={{ color: '#475569' }} />
  }

  const activeCount = cases.filter(c => !c.archived).length
  const urgentCount = cases.filter(c => {
    if (c.archived) return false
    const nearest = getNearestDeadline(c)
    return computeStatus(c.status, nearest?.deadline || null, urgentDays, monitorDays) === 'urgent'
  }).length

  return (
    <AppLayout>
      <div className="px-10 py-10 max-w-5xl mx-auto">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1
              className="text-[26px] font-semibold tracking-tight mb-1"
              style={{ color: '#0F172A', letterSpacing: '-0.025em' }}
            >
              Dossiers
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[13px]" style={{ color: '#94A3B8' }}>
                {activeCount} dossier{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''}
              </span>
              {urgentCount > 0 && (
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                >
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
                  {urgentCount} urgent{urgentCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200"
            style={{ background: '#0F172A', color: '#FFFFFF' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#1E293B'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0F172A'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <Plus size={14} strokeWidth={2} />
            Nouveau dossier
          </Link>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Search */}
          <div className="relative" style={{ width: 240 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#CBD5E1' }} />
            <input
              className="input-field pl-9 text-[13px]"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ height: 36, paddingTop: 0, paddingBottom: 0 }}
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5">
            {(['all', 'urgent', 'monitor', 'stable', 'archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                style={{
                  background: filter === s ? '#0F172A' : '#FFFFFF',
                  color: filter === s ? '#FFFFFF' : '#94A3B8',
                  border: `1px solid ${filter === s ? '#0F172A' : '#E2E8F0'}`,
                  height: 32,
                }}
                onMouseEnter={e => {
                  if (filter !== s) {
                    e.currentTarget.style.borderColor = '#CBD5E1'
                    e.currentTarget.style.color = '#475569'
                  }
                }}
                onMouseLeave={e => {
                  if (filter !== s) {
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                {filterLabels[s]}
              </button>
            ))}
          </div>

          {/* Sort — right side */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] mr-1" style={{ color: '#CBD5E1' }}>Trier par</span>
            {([['deadline', 'Délai'], ['created_at', 'Date']] as [SortKey, string][]).map(([k, label]) => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors"
                style={{
                  background: sortKey === k ? '#F1F5F9' : 'transparent',
                  color: sortKey === k ? '#0F172A' : '#94A3B8',
                  border: '1px solid transparent',
                  height: 32,
                }}
                onMouseEnter={e => {
                  if (sortKey !== k) {
                    e.currentTarget.style.background = '#F8FAFC'
                    e.currentTarget.style.color = '#475569'
                  }
                }}
                onMouseLeave={e => {
                  if (sortKey !== k) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                {label}
                <SortIcon k={k} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Cases ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px]" style={{ color: '#CBD5E1' }}>Chargement…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-xl"
            style={{ border: '1.5px dashed #E2E8F0' }}
          >
            <p className="text-[15px] font-medium mb-2" style={{ color: '#0F172A' }}>
              {cases.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}
            </p>
            <p className="text-[13px] mb-6" style={{ color: '#94A3B8' }}>
              {cases.length === 0
                ? 'Uploadez un document PDF pour créer votre premier dossier'
                : 'Modifiez votre recherche ou vos filtres'}
            </p>
            {cases.length === 0 && (
              <Link to="/upload" className="btn-primary">
                <Plus size={13} /> Nouveau dossier
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const nearestDeadlineObj = getNearestDeadline(c)
              const dl = deadlineLabel(nearestDeadlineObj?.deadline || null)
              const barColor = getStatusBarColor(c)
              const nearest = getNearestDeadline(c)
              const status = computeStatus(c.status, nearest?.deadline || null, urgentDays, monitorDays)

              return (
                <Link
                  key={c.id}
                  to={`/dossier/${c.id}`}
                  className="group flex items-center relative rounded-xl overflow-hidden transition-all duration-200"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #F1F5F9',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#E2E8F0'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#F1F5F9'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Left status bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0"
                    style={{ width: 3, background: barColor, borderRadius: '0' }}
                  />

                  <div className="flex items-center justify-between w-full pl-6 pr-5 py-4">
                    {/* Left: pin + info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={e => togglePin(c, e)}
                        className="shrink-0 transition-all duration-200"
                        style={{ opacity: c.pinned ? 1 : 0, color: '#0F172A' }}
                        title={c.pinned ? 'Désépingler' : 'Épingler'}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      >
                        <Pin size={12} fill={c.pinned ? '#0F172A' : 'none'} />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-semibold truncate" style={{ color: '#0F172A' }}>
                            {c.name}
                          </p>
                          {c.pinned && (
                            <Pin size={10} fill="#94A3B8" style={{ color: '#94A3B8', flexShrink: 0 }} />
                          )}
                        </div>
                        <p className="text-[12px]" style={{ color: '#94A3B8' }}>
                          {c.client_name}
                          {c.case_type && (
                            <span className="ml-2 capitalize" style={{ color: '#CBD5E1' }}>· {c.case_type}</span>
                          )}
                        </p>
                        {notesMap[c.id] && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <MessageSquare size={10} style={{ color: '#D97706', flexShrink: 0 }} />
                            <p className="text-[11px] truncate max-w-sm" style={{ color: '#92400E' }}>
                              {notesMap[c.id].content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: status + deadline + arrow */}
                    <div className="flex items-center gap-5 shrink-0">
                      <StatusBadge status={status} />

                      {dl ? (
                        <div className="text-right" style={{ minWidth: 88 }}>
                          {nearestDeadlineObj?.name && nearestDeadlineObj.name !== 'Principal' && (
                            <p className="text-[10px] mb-0.5 truncate max-w-[120px]" style={{ color: '#CBD5E1' }}>
                              {nearestDeadlineObj.name}
                            </p>
                          )}
                          <span
                            className="text-[12px] font-medium px-2 py-0.5 rounded"
                            style={{
                              color: dl.color,
                              background: dl.bg,
                            }}
                          >
                            {dl.text}
                          </span>
                        </div>
                      ) : (
                        <div style={{ minWidth: 88 }} />
                      )}

                      <ArrowRight
                        size={13}
                        style={{ color: '#E2E8F0' }}
                        className="group-hover:translate-x-0.5 group-hover:text-[#94A3B8] transition-all duration-200"
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
