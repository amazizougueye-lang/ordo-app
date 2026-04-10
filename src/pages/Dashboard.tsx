import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { computeStatus } from '../lib/utils'
import { useUrgencySettings } from '../hooks/useUrgencySettings'
import type { Case, CaseStatus, CaseDeadline } from '../types'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Pin, Plus, ChevronDown, ChevronUp, ArrowUpRight, MessageSquare } from 'lucide-react'
import type { Note } from '../types'

type SortKey = 'deadline' | 'created_at'
type FilterStatus = CaseStatus | 'all' | 'archived'

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
    return allDeadlines.reduce((nearest, current) =>
      new Date(current.deadline).getTime() < new Date(nearest.deadline).getTime() ? current : nearest
    )
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

  const deadlineInfo = (deadline: string | null) => {
    if (!deadline) return null
    const d = new Date(deadline)
    const diff = differenceInDays(d, new Date())
    if (isPast(d) && !isToday(d)) return { label: 'En retard', sub: format(d, 'd MMM', { locale: fr }), color: '#DC2626', dot: '#DC2626' }
    if (isToday(d)) return { label: "Aujourd'hui", sub: null, color: '#D97706', dot: '#D97706' }
    if (diff <= 3) return { label: `Dans ${diff}j`, sub: format(d, 'd MMM', { locale: fr }), color: '#D97706', dot: '#D97706' }
    return { label: format(d, 'd MMM yyyy', { locale: fr }), sub: null, color: '#6B7280', dot: '#E5E7EB' }
  }

  const getStatusColor = (c: Case) => {
    const nearest = getNearestDeadline(c)
    const status = computeStatus(c.status, nearest?.deadline || null, urgentDays, monitorDays)
    if (status === 'urgent') return { bar: '#DC2626', badge: '#FEF2F2', badgeText: '#DC2626', label: 'Urgent' }
    if (status === 'monitor') return { bar: '#F59E0B', badge: '#FFFBEB', badgeText: '#D97706', label: 'À surveiller' }
    return { bar: '#E5E7EB', badge: '#F9FAFB', badgeText: '#6B7280', label: 'Stable' }
  }

  // Stats
  const active = cases.filter(c => !c.archived)
  const urgentCount = active.filter(c => {
    const n = getNearestDeadline(c)
    return computeStatus(c.status, n?.deadline || null, urgentDays, monitorDays) === 'urgent'
  }).length
  const monitorCount = active.filter(c => {
    const n = getNearestDeadline(c)
    return computeStatus(c.status, n?.deadline || null, urgentDays, monitorDays) === 'monitor'
  }).length

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-[12px] transition-colors px-2 py-1 rounded"
      style={{ color: sortKey === k ? '#0F172A' : '#9CA3AF', background: sortKey === k ? '#F3F4F6' : 'transparent' }}
      onMouseEnter={e => { if (sortKey !== k) e.currentTarget.style.color = '#374151' }}
      onMouseLeave={e => { if (sortKey !== k) e.currentTarget.style.color = '#9CA3AF' }}
    >
      {label}
      {sortKey === k ? (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ChevronDown size={11} style={{ opacity: 0.3 }} />}
    </button>
  )

  return (
    <AppLayout>
      <div style={{ background: '#F9F9F9', minHeight: '100%' }}>
        <div className="max-w-[860px] mx-auto px-12 py-12">

          {/* ── Page title ── */}
          <div className="mb-10">
            <h1 className="text-[28px] font-semibold mb-1" style={{ color: '#111827', letterSpacing: '-0.03em' }}>
              Dossiers
            </h1>
            <p className="text-[14px]" style={{ color: '#9CA3AF' }}>
              Gérez vos dossiers et délais juridiques
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Dossiers actifs', value: active.length, color: '#111827', bg: '#FFFFFF' },
              { label: 'Urgents', value: urgentCount, color: urgentCount > 0 ? '#DC2626' : '#111827', bg: urgentCount > 0 ? '#FEF2F2' : '#FFFFFF' },
              { label: 'À surveiller', value: monitorCount, color: monitorCount > 0 ? '#D97706' : '#111827', bg: monitorCount > 0 ? '#FFFBEB' : '#FFFFFF' },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-xl px-6 py-5"
                style={{ background: bg, border: '1px solid #EBEBEB', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              >
                <p className="text-[12px] font-medium mb-2" style={{ color: '#9CA3AF' }}>{label}</p>
                <p className="text-[32px] font-semibold leading-none" style={{ color, letterSpacing: '-0.03em' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Controls ── */}
          <div className="flex items-center gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 max-w-[280px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#D1D5DB' }} />
              <input
                className="w-full pl-9 pr-4 text-[13px] rounded-lg outline-none transition-all"
                placeholder="Rechercher un dossier…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  height: 38,
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  color: '#111827',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#6B7280'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107,114,128,0.08)' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none' }}
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              {([
                ['all', 'Tous'],
                ['urgent', 'Urgents'],
                ['monitor', 'À surveiller'],
                ['stable', 'Stables'],
                ['archived', 'Archivés'],
              ] as [FilterStatus, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className="text-[12px] font-medium px-3 rounded-lg transition-all duration-100"
                  style={{
                    height: 32,
                    background: filter === s ? '#111827' : '#FFFFFF',
                    color: filter === s ? '#FFFFFF' : '#9CA3AF',
                    border: `1px solid ${filter === s ? '#111827' : '#E5E7EB'}`,
                  }}
                  onMouseEnter={e => { if (filter !== s) { e.currentTarget.style.borderColor = '#9CA3AF'; e.currentTarget.style.color = '#374151' } }}
                  onMouseLeave={e => { if (filter !== s) { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#9CA3AF' } }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort — right */}
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[11px] mr-1" style={{ color: '#D1D5DB' }}>Trier</span>
              <SortBtn k="deadline" label="Délai" />
              <SortBtn k="created_at" label="Date" />
            </div>

            {/* New case button */}
            <Link
              to="/upload"
              className="flex items-center gap-1.5 text-[13px] font-medium rounded-lg transition-all duration-150"
              style={{ height: 38, paddingLeft: 16, paddingRight: 16, background: '#111827', color: '#FFFFFF' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1F2937'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(17,24,39,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Nouveau
            </Link>
          </div>

          {/* ── Case list ── */}
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-[13px]" style={{ color: '#D1D5DB' }}>Chargement…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center rounded-xl" style={{ border: '1.5px dashed #E5E7EB' }}>
              <p className="text-[15px] font-medium mb-2" style={{ color: '#111827' }}>
                {cases.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}
              </p>
              <p className="text-[13px] mb-6" style={{ color: '#9CA3AF' }}>
                {cases.length === 0 ? 'Uploadez un PDF pour créer votre premier dossier' : 'Modifiez votre recherche ou vos filtres'}
              </p>
              {cases.length === 0 && (
                <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ background: '#111827' }}>
                  <Plus size={13} /> Nouveau dossier
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #EBEBEB', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {filtered.map((c, idx) => {
                const nearest = getNearestDeadline(c)
                const dl = deadlineInfo(nearest?.deadline || null)
                const sc = getStatusColor(c)

                return (
                  <Link
                    key={c.id}
                    to={`/dossier/${c.id}`}
                    className="group flex items-center relative transition-colors duration-100"
                    style={{
                      borderTop: idx === 0 ? 'none' : '1px solid #F3F4F6',
                      background: 'transparent',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFA' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Semantic color bar */}
                    <div style={{ width: 3, alignSelf: 'stretch', background: sc.bar, flexShrink: 0 }} />

                    <div className="flex items-center justify-between w-full px-6 py-5">

                      {/* Left block */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Pin */}
                        <button
                          onClick={e => togglePin(c, e)}
                          className="shrink-0 transition-opacity"
                          style={{ opacity: c.pinned ? 1 : 0, color: '#D1D5DB' }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#6B7280' }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = c.pinned ? '1' : '0'; e.currentTarget.style.color = '#D1D5DB' }}
                          title={c.pinned ? 'Désépingler' : 'Épingler'}
                        >
                          <Pin size={12} fill={c.pinned ? '#6B7280' : 'none'} />
                        </button>

                        {/* Info */}
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold mb-0.5 truncate" style={{ color: '#111827', letterSpacing: '-0.01em' }}>
                            {c.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[12px]" style={{ color: '#9CA3AF' }}>{c.client_name}</p>
                            {c.case_type && (
                              <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                                {c.case_type}
                              </span>
                            )}
                          </div>
                          {notesMap[c.id] && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <MessageSquare size={10} style={{ color: '#F59E0B', flexShrink: 0 }} />
                              <p className="text-[11px] truncate" style={{ color: '#92400E', maxWidth: 320 }}>
                                {notesMap[c.id].content}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right block */}
                      <div className="flex items-center gap-6 shrink-0">
                        {/* Status badge */}
                        <span
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                          style={{ background: sc.badge, color: sc.badgeText }}
                        >
                          {sc.label}
                        </span>

                        {/* Deadline */}
                        {dl ? (
                          <div className="text-right" style={{ minWidth: 96 }}>
                            <p className="text-[13px] font-semibold" style={{ color: dl.color }}>
                              {dl.label}
                            </p>
                            {dl.sub && (
                              <p className="text-[11px]" style={{ color: '#D1D5DB' }}>{dl.sub}</p>
                            )}
                          </div>
                        ) : (
                          <div style={{ minWidth: 96 }} />
                        )}

                        {/* Arrow */}
                        <ArrowUpRight
                          size={14}
                          className="transition-all duration-150 opacity-0 group-hover:opacity-100"
                          style={{ color: '#9CA3AF' }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
