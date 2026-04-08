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
      supabase
        .from('cases')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_deadlines')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true }),
    ]).then(([{ data: casesData }, { data: notesData }, { data: deadlinesData }]) => {
      setCases((casesData as Case[]) || [])
      // Map dernière note par dossier
      const map: Record<string, Note> = {}
      ;(notesData as Note[] || []).forEach(note => {
        if (!map[note.case_id]) map[note.case_id] = note
      })
      setNotesMap(map)
      // Map deadlines by case
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

  const getNearestDeadline = (c: Case): string | null => {
    const allDeadlines = [
      ...(c.deadline ? [c.deadline] : []),
      ...(deadlinesByCase[c.id] || []).map(d => d.deadline)
    ]
    if (allDeadlines.length === 0) return null
    return allDeadlines.reduce((nearest, current) => {
      const currentTime = new Date(current).getTime()
      const nearestTime = new Date(nearest).getTime()
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
      if (filter !== 'all' && computeStatus(c.status, nearestDeadline, urgentDays, monitorDays) !== filter) return false
      return true
    })
    .sort((a, b) => {
      // Pinned always first
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1

      if (sortKey === 'deadline') {
        const da = getNearestDeadline(a) ? new Date(getNearestDeadline(a)!).getTime() : Infinity
        const db = getNearestDeadline(b) ? new Date(getNearestDeadline(b)!).getTime() : Infinity
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
    if (isPast(d) && !isToday(d)) return { text: `En retard (${format(d, 'd MMM', { locale: fr })})`, color: '#DC2626' }
    if (isToday(d)) return { text: "Aujourd'hui", color: '#D97706' }
    if (diff <= 3) return { text: `Dans ${diff}j`, color: '#D97706' }
    return { text: format(d, 'd MMM yyyy', { locale: fr }), color: '#475569' }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={12} style={{ color: '#CBD5E1' }} />
    return sortAsc
      ? <ChevronUp size={12} style={{ color: '#1E293B' }} />
      : <ChevronDown size={12} style={{ color: '#1E293B' }} />
  }

  return (
    <AppLayout>
      <div className="px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-[22px] font-semibold"
              style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
            >
              Dossiers
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#94A3B8' }}>
              {cases.length} dossier{cases.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/upload" className="btn-primary gap-2">
            <Plus size={14} />
            Nouveau dossier
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#94A3B8' }}
            />
            <input
              className="input-field pl-9"
              placeholder="Rechercher un dossier…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            {(['all', 'urgent', 'monitor', 'stable', 'archived'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
                style={{
                  background: filter === s ? '#1E293B' : '#FFFFFF',
                  color: filter === s ? '#FFFFFF' : '#475569',
                  border: `1px solid ${filter === s ? '#1E293B' : '#E2E8F0'}`,
                }}
              >
                {s === 'all' ? 'Tous' : s === 'urgent' ? 'Urgent' : s === 'monitor' ? 'Surveiller' : s === 'archived' ? 'Archivés' : 'Actif'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => toggleSort('deadline')}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-[12px] transition-colors"
              style={{
                background: sortKey === 'deadline' ? '#F1F5F9' : 'transparent',
                color: '#475569',
                border: '1px solid transparent',
              }}
            >
              Délai <SortIcon k="deadline" />
            </button>
            <button
              onClick={() => toggleSort('created_at')}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-[12px] transition-colors"
              style={{
                background: sortKey === 'created_at' ? '#F1F5F9' : 'transparent',
                color: '#475569',
                border: '1px solid transparent',
              }}
            >
              Date <SortIcon k="created_at" />
            </button>
          </div>
        </div>

        {/* Cases list */}
        {loading ? (
          <p className="text-[13px]" style={{ color: '#94A3B8' }}>Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-[14px] font-medium mb-2" style={{ color: '#0F172A' }}>
              {cases.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}
            </p>
            <p className="text-[13px] mb-5" style={{ color: '#94A3B8' }}>
              {cases.length === 0
                ? 'Uploadez un document PDF pour créer votre premier dossier'
                : 'Modifiez votre recherche ou vos filtres'}
            </p>
            {cases.length === 0 && (
              <Link to="/upload" className="btn-primary">
                <Plus size={14} /> Nouveau dossier
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => {
              const nearestDeadline = getNearestDeadline(c)
              const dl = deadlineLabel(nearestDeadline)
              return (
                <Link
                  key={c.id}
                  to={`/dossier/${c.id}`}
                  className="flex items-center justify-between px-5 py-4 rounded-lg transition-all group"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Pin */}
                    <button
                      onClick={e => togglePin(c, e)}
                      className="shrink-0 transition-opacity"
                      style={{ opacity: c.pinned ? 1 : 0.2, color: '#1E293B' }}
                      title={c.pinned ? 'Désépingler' : 'Épingler'}
                    >
                      <Pin size={13} fill={c.pinned ? '#1E293B' : 'none'} />
                    </button>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[13px] font-medium truncate"
                        style={{ color: '#0F172A' }}
                      >
                        {c.name}
                      </p>
                      <p className="text-[12px]" style={{ color: '#94A3B8' }}>
                        {c.client_name}
                      </p>
                      {notesMap[c.id] && (
                        <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-gray-100">
                          <MessageSquare size={11} className="shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                          <p className="text-[11px] line-clamp-1" style={{ color: '#92400E' }}>
                            {notesMap[c.id].content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0">
                    <StatusBadge status={computeStatus(c.status, c.deadline, urgentDays, monitorDays)} />
                    {dl && (
                      <span className="text-[12px] font-medium w-32 text-right" style={{ color: dl.color }}>
                        {dl.text}
                      </span>
                    )}
                    <ArrowRight
                      size={14}
                      style={{ color: '#CBD5E1' }}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
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
