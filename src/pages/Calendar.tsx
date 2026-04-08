import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { computeStatus } from '../lib/utils'
import { useUrgencySettings } from '../hooks/useUrgencySettings'
import type { Case, CaseDeadline } from '../types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X, MessageSquare, FileText } from 'lucide-react'

interface DeadlineWithCase extends CaseDeadline {
  case_name: string
  case_id: string
  case_status: string
}

interface PrincipalDeadline {
  case_id: string
  case_name: string
  deadline: string
  deadline_name: string | null
  status: string
}

export default function Calendar() {
  const { user } = useAuth()
  const { urgentDays, monitorDays } = useUrgencySettings()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [cases, setCases] = useState<Case[]>([])
  const [deadlines, setDeadlines] = useState<DeadlineWithCase[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [selectedCaseNotes, setSelectedCaseNotes] = useState<any[]>([])
  const [selectedCaseDocs, setSelectedCaseDocs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('cases').select('*').eq('user_id', user.id),
      supabase.from('case_deadlines').select('*').eq('user_id', user.id),
      supabase.from('notes').select('*').eq('user_id', user.id),
    ]).then(([{ data: casesData }, { data: deadlinesData }]) => {
      setCases((casesData as Case[]) || [])
      const casesMap = new Map(((casesData as Case[]) || []).map(c => [c.id, c]))
      const deadlinesList = ((deadlinesData as CaseDeadline[]) || []).map(d => ({
        ...d,
        case_name: casesMap.get(d.case_id)?.name || 'Unknown',
        case_status: casesMap.get(d.case_id)?.status || 'stable',
      }))
      setDeadlines(deadlinesList)
      setLoading(false)
    })
  }, [user])

  const handleSelectCase = async (c: Case) => {
    setSelectedCase(c)
    const [{ data: notes }, { data: docs }] = await Promise.all([
      supabase.from('notes').select('*').eq('case_id', c.id).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('case_id', c.id).order('created_at', { ascending: false }),
    ])
    setSelectedCaseNotes((notes as any[]) || [])
    setSelectedCaseDocs((docs as any[]) || [])
  }

  const getDeadlinesForDay = (day: Date): (DeadlineWithCase | PrincipalDeadline)[] => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const additionalDL = deadlines.filter(d => d.deadline === dayStr)
    const principalDL: PrincipalDeadline[] = cases
      .filter(c => c.deadline && format(new Date(c.deadline), 'yyyy-MM-dd') === dayStr && !c.archived)
      .map(c => ({
        case_id: c.id,
        case_name: c.name,
        deadline: c.deadline!,
        deadline_name: c.deadline_name,
        status: c.status,
      }))
    return [...principalDL, ...additionalDL]
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const firstDayOfWeek = getDay(startOfMonth(currentDate))
  const emptyDays = Array(firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1).fill(null)
  const allDays = [...emptyDays, ...daysInMonth]

  const getStatusColor = (status: string) => {
    if (status === 'urgent') return '#DC2626'
    if (status === 'monitor') return '#D97706'
    return '#16A34A'
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8' }}>Chargement…</div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[24px] font-semibold" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
            Calendrier
          </h1>
          <p className="text-[13px]" style={{ color: '#94A3B8' }}>
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </p>
        </div>

        {/* Calendar */}
        <div className="card p-6 mb-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="btn-ghost gap-1.5"
            >
              <ChevronLeft size={16} /> Précédent
            </button>
            <p className="text-[14px] font-medium" style={{ color: '#0F172A' }}>
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </p>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="btn-ghost gap-1.5"
            >
              Suivant <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-[12px] font-medium py-2" style={{ color: '#94A3B8' }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />
              const dayDeadlines = getDeadlinesForDay(day)
              const isCurrentDay = isToday(day)
              return (
                <div
                  key={day.toISOString()}
                  className="aspect-square rounded-lg p-2 text-[11px] overflow-hidden cursor-pointer transition-colors"
                  style={{
                    background: isCurrentDay ? '#EFF6FF' : isSameMonth(day, currentDate) ? '#FFFFFF' : '#F8FAFC',
                    border: isCurrentDay ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                  }}
                >
                  <div className="text-[12px] font-medium mb-1" style={{ color: '#0F172A' }}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5 max-h-16 overflow-y-auto">
                    {dayDeadlines.map((dl, i) => {
                      const dlName = ('deadline_name' in dl) ? (dl.deadline_name || 'Délai') : 'Délai'
                      const status = ('case_status' in dl) ? dl.case_status : dl.status
                      return (
                        <div
                          key={`${dl.case_id}-${i}`}
                          onClick={() => handleSelectCase(cases.find(c => c.id === dl.case_id)!)}
                          className="px-1.5 py-0.5 rounded text-[10px] truncate hover:opacity-90 transition-opacity"
                          style={{
                            background: getStatusColor(status),
                            color: '#FFFFFF',
                          }}
                          title={`${dlName} - ${dl.case_name}`}
                        >
                          {dlName} • {dl.case_name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Case detail modal */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
            <div className="bg-white w-full max-w-md h-[90vh] rounded-t-lg overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-[14px] font-medium" style={{ color: '#0F172A' }}>
                  {selectedCase.name}
                </h2>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                  style={{ color: '#475569' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Client & Status */}
                <div>
                  <p className="text-[13px] font-medium mb-2" style={{ color: '#0F172A' }}>
                    Client
                  </p>
                  <p className="text-[12px]" style={{ color: '#94A3B8' }}>
                    {selectedCase.client_name}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={computeStatus(selectedCase.status, selectedCase.deadline, urgentDays, monitorDays)} />
                  </div>
                </div>

                {/* Notes */}
                {selectedCaseNotes.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={14} style={{ color: '#94A3B8' }} />
                      <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>
                        Notes ({selectedCaseNotes.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedCaseNotes.map(note => (
                        <div
                          key={note.id}
                          className="px-3 py-2 rounded-lg text-[12px]"
                          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                        >
                          <p style={{ color: '#0F172A' }}>{note.content}</p>
                          <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                            {format(new Date(note.created_at), 'd MMM', { locale: fr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {selectedCaseDocs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={14} style={{ color: '#94A3B8' }} />
                      <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>
                        Documents ({selectedCaseDocs.length})
                      </p>
                    </div>
                    <div className="space-y-2">
                      {selectedCaseDocs.map(doc => (
                        <div
                          key={doc.id}
                          className="px-3 py-2 rounded-lg text-[12px] border"
                          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                        >
                          <p className="truncate font-medium" style={{ color: '#0F172A' }}>
                            {doc.name}
                          </p>
                          <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                            {format(new Date(doc.created_at), 'd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
