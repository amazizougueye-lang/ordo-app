import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { PDFViewer } from '../components/PDFViewer'
import type { Case, Document, Note, CaseDeadline, DeadlineUrgency } from '../types'
import { toast } from 'sonner'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Pin, FileText, Calendar, Trash2,
  Loader2, CheckCircle, ChevronDown, Plus, Download, Archive, ArchiveRestore,
  MessageSquare, Send, Clock, Check, BellOff, Tag, Save
} from 'lucide-react'
import { DOC_HIERARCHY, getDocTypeDisplay, formatDocType, type DocCategory } from '../lib/docTypes'

const URGENCY_COLORS: Record<DeadlineUrgency, { bg: string; text: string; label: string; dot: string }> = {
  urgent:  { bg: '#FEF2F2', text: '#DC2626', label: 'Urgent',        dot: '#DC2626' },
  monitor: { bg: '#FFFBEB', text: '#D97706', label: 'À surveiller',  dot: '#F59E0B' },
  stable:  { bg: '#ECFDF5', text: '#10B981', label: 'Stable',        dot: '#10B981' },
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [c, setCase] = useState<Case | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [deadlineName, setDeadlineName] = useState('')
  const [deadlineUrgency, setDeadlineUrgency] = useState<DeadlineUrgency>('stable')
  const [caseType, setCaseType] = useState('')
  const [caseTypeCustom, setCaseTypeCustom] = useState('')
  const [caseNumber, setCaseNumber] = useState('')

  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [caseDeadlines, setCaseDeadlines] = useState<CaseDeadline[]>([])
  const [newDeadlineName, setNewDeadlineName] = useState('')
  const [newDeadlineDate, setNewDeadlineDate] = useState('')
  const [newDeadlineUrgency, setNewDeadlineUrgency] = useState<DeadlineUrgency>('stable')
  const [newDeadlineMonitorDays, setNewDeadlineMonitorDays] = useState('7')
  const [newDeadlineUrgentDays, setNewDeadlineUrgentDays] = useState('3')
  const [savingDeadline, setSavingDeadline] = useState(false)
  const [editingDocType, setEditingDocType] = useState<string | null>(null)
  const [editingDeadlineUrgency, setEditingDeadlineUrgency] = useState<string | null>(null)

  // Résumé Gemini par document
  const [docSummaries, setDocSummaries] = useState<Record<string, string>>({})
  const [docSummaryLoading, setDocSummaryLoading] = useState<Record<string, boolean>>({})

  const CASE_TYPES = [
    { value: 'civil', label: 'Civil' },
    { value: 'penal', label: 'Pénal' },
    { value: 'familial', label: 'Familial' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'immobilier', label: 'Immobilier' },
    { value: 'travail', label: 'Travail' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'administratif', label: 'Administratif' },
    { value: 'autre', label: 'Autre…' },
  ]
  const KNOWN_TYPES = CASE_TYPES.map(t => t.value)

  useEffect(() => {
    if (!id || !user) return
    Promise.all([
      supabase.from('cases').select('*').eq('id', id).maybeSingle(),
      supabase.from('documents').select('*').eq('case_id', id).order('created_at', { ascending: false }),
      supabase.from('notes').select('*').eq('case_id', id).order('created_at', { ascending: true }),
      supabase.from('case_deadlines').select('*').eq('case_id', id).order('deadline', { ascending: true }),
    ]).then(([{ data: caseData }, { data: docsData }, { data: notesData }, { data: deadlinesData }]) => {
      if (caseData) {
        const d = caseData as Case
        setCase(d)
        setName(d.name)
        setClientName(d.client_name)
        setDeadline(d.deadline?.slice(0, 10) || '')
        setDeadlineName(d.deadline_name || '')
        setDeadlineUrgency((d.deadline_urgency as DeadlineUrgency) || 'stable')
        setCaseNumber(d.case_number || '')
        const t = d.case_type || 'civil'
        if (KNOWN_TYPES.includes(t)) { setCaseType(t) }
        else { setCaseType('autre'); setCaseTypeCustom(t) }
      }
      setDocs((docsData as Document[]) || [])
      setNotes((notesData as Note[]) || [])
      setCaseDeadlines((deadlinesData as CaseDeadline[]) || [])
      setLoading(false)
    })
  }, [id, user])

  const handleSave = async () => {
    if (!c) return
    setSaving(true)
    const finalType = caseType === 'autre' ? (caseTypeCustom.trim() || 'autre') : caseType
    const { error } = await supabase
      .from('cases')
      .update({
        name,
        client_name: clientName,
        deadline: deadline || null,
        deadline_name: deadlineName.trim() || null,
        deadline_urgency: deadline ? deadlineUrgency : null,
        case_type: finalType,
        case_number: caseNumber.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id)
    if (error) toast.error('Erreur lors de la sauvegarde')
    else {
      toast.success('Dossier mis à jour')
      setCase(prev => prev ? {
        ...prev, name, client_name: clientName, deadline: deadline || null,
        deadline_name: deadlineName, deadline_urgency: deadline ? deadlineUrgency : null,
        case_type: finalType, case_number: caseNumber.trim() || null
      } : prev)
    }
    setSaving(false)
  }

  const addNote = async () => {
    if (!c || !user || !newNote.trim()) return
    setSavingNote(true)
    const { data, error } = await supabase
      .from('notes')
      .insert({ case_id: c.id, user_id: user.id, content: newNote.trim() })
      .select().single()
    if (error) toast.error('Erreur')
    else { setNotes(prev => [...prev, data as Note]); setNewNote('') }
    setSavingNote(false)
  }

  const deleteNote = async (noteId: string) => {
    await supabase.from('notes').delete().eq('id', noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  const addDeadline = async () => {
    if (!c || !user || !newDeadlineName.trim() || !newDeadlineDate) return
    setSavingDeadline(true)
    const mDays = parseInt(newDeadlineMonitorDays) || 7
    const uDays = parseInt(newDeadlineUrgentDays) || 3
    const { data, error } = await supabase
      .from('case_deadlines')
      .insert({
        case_id: c.id,
        user_id: user.id,
        name: newDeadlineName.trim(),
        deadline: newDeadlineDate,
        urgency: newDeadlineUrgency,
        monitor_days: mDays,
        urgent_days: uDays,
        completed: false,
      })
      .select().single()
    if (error) toast.error('Erreur')
    else {
      setCaseDeadlines(prev => [...prev, data as CaseDeadline].sort((a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      ))
      setNewDeadlineName('')
      setNewDeadlineDate('')
      setNewDeadlineUrgency('stable')
      setNewDeadlineMonitorDays('7')
      setNewDeadlineUrgentDays('3')
    }
    setSavingDeadline(false)
  }

  const updateDeadlineUrgency = async (deadlineId: string, urgency: DeadlineUrgency) => {
    await supabase.from('case_deadlines').update({ urgency }).eq('id', deadlineId)
    setCaseDeadlines(prev => prev.map(d => d.id === deadlineId ? { ...d, urgency } : d))
    setEditingDeadlineUrgency(null)
  }

  const completeMainDeadline = async () => {
    if (!c) return
    await supabase.from('cases').update({ deadline: null, deadline_name: null, deadline_urgency: null }).eq('id', c.id)
    setCase(prev => prev ? { ...prev, deadline: null, deadline_name: null, deadline_urgency: null } : prev)
    setDeadline('')
    setDeadlineName('')
    setDeadlineUrgency('stable')
    toast.success('Délai principal marqué comme fait')
  }

  const completeDeadline = async (deadlineId: string) => {
    await supabase.from('case_deadlines').update({ completed: true }).eq('id', deadlineId)
    setCaseDeadlines(prev => prev.filter(d => d.id !== deadlineId))
    toast.success('Échéance marquée comme faite')
  }

  const snoozeDeadline = async (deadlineId: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    await supabase.from('case_deadlines').update({ snoozed_until: tomorrow.toISOString() }).eq('id', deadlineId)
    setCaseDeadlines(prev => prev.map(d => d.id === deadlineId ? { ...d, snoozed_until: tomorrow.toISOString() } : d))
    toast.success('Échéance reportée à demain')
  }

  const deleteDeadline = async (deadlineId: string) => {
    await supabase.from('case_deadlines').delete().eq('id', deadlineId)
    setCaseDeadlines(prev => prev.filter(d => d.id !== deadlineId))
  }

  const updateDocType = async (docId: string, type: string) => {
    await supabase.from('documents').update({ doc_type: type }).eq('id', docId)
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, doc_type: type } : d))
    setEditingDocType(null)
  }

  const getNearestDeadline = () => {
    const allDeadlines = [
      ...(c?.deadline ? [{ name: c.deadline_name || 'Principal', deadline: c.deadline }] : []),
      ...caseDeadlines.filter(d => !d.completed).map(d => ({ name: d.name, deadline: d.deadline }))
    ]
    if (allDeadlines.length === 0) return null
    return allDeadlines.reduce((nearest, current) =>
      new Date(current.deadline).getTime() < new Date(nearest.deadline).getTime() ? current : nearest
    )
  }

  const deadlineLabel = (deadlineStr: string | null) => {
    if (!deadlineStr) return null
    const d = new Date(deadlineStr)
    const diff = differenceInDays(d, new Date())
    if (isPast(d) && !isToday(d)) return { text: `En retard (${format(d, 'd MMM', { locale: fr })})`, color: '#DC2626' }
    if (isToday(d)) return { text: "Aujourd'hui", color: '#D97706' }
    if (diff <= 3) return { text: `Dans ${diff}j`, color: '#D97706' }
    return { text: format(d, 'd MMM yyyy', { locale: fr }), color: '#475569' }
  }

  const isDeadlineSnoozed = (d: CaseDeadline) =>
    d.snoozed_until ? new Date(d.snoozed_until) > new Date() : false

  const togglePin = async () => {
    if (!c) return
    const updated = !c.pinned
    await supabase.from('cases').update({ pinned: updated }).eq('id', c.id)
    setCase(prev => prev ? { ...prev, pinned: updated } : prev)
    toast.success(updated ? 'Dossier épinglé' : 'Dossier désépinglé')
  }

  const toggleArchive = async () => {
    if (!c) return
    const updated = !c.archived
    await supabase.from('cases').update({ archived: updated }).eq('id', c.id)
    setCase(prev => prev ? { ...prev, archived: updated } : prev)
    toast.success(updated ? 'Dossier archivé' : 'Dossier restauré')
    if (updated) navigate('/dashboard')
  }

  const deleteCase = async () => {
    if (!c || !confirm('Supprimer ce dossier et tous ses documents ?')) return
    await supabase.from('documents').delete().eq('case_id', c.id)
    await supabase.from('cases').delete().eq('id', c.id)
    toast.success('Dossier supprimé')
    navigate('/dashboard')
  }

  const viewDocument = async (doc: Document) => {
    if (!user || viewingDoc) return
    try {
      const { data: signedData } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.storage_path, 3600)
      if (signedData?.signedUrl) {
        setViewingDoc(doc)
        setViewingUrl(signedData.signedUrl)
      }
    } catch { toast.error('Erreur ouverture PDF') }
  }

  const downloadDocument = async (doc: Document) => {
    if (!user) return
    setDownloadingDoc(doc.id)
    try {
      const { data, error } = await supabase.storage.from('documents').download(doc.storage_path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url; a.download = doc.name
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch { toast.error('Erreur téléchargement') }
    setDownloadingDoc(null)
  }

  const saveSummary = async (docId: string) => {
    const summary = docSummaries[docId]
    if (!summary) return
    const { error } = await supabase.from('documents').update({ summary }).eq('id', docId)
    if (error) { toast.error('Erreur lors de la sauvegarde'); return }
    setDocs(prev => prev.map(d => d.id === docId ? { ...d, summary } : d))
    setDocSummaries(prev => { const n = { ...prev }; delete n[docId]; return n })
    toast.success('Résumé sauvegardé dans le dossier')
  }

  const downloadSummary = (docName: string, summary: string) => {
    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `résumé-${docName.replace(/\.[^.]+$/, '')}.txt`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8', fontSize: 13 }}>Chargement…</div>
    </AppLayout>
  )

  if (!c) return (
    <AppLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[14px] mb-4" style={{ color: '#94A3B8' }}>Dossier introuvable</p>
          <Link to="/dashboard" className="btn-primary">Retour</Link>
        </div>
      </div>
    </AppLayout>
  )

  const nearestDl = getNearestDeadline()

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="btn-ghost gap-1.5 -ml-2">
            <ArrowLeft size={14} /> Dossiers
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={togglePin} className="btn-ghost gap-1.5" title={c.pinned ? 'Désépingler' : 'Épingler'}>
              <Pin size={14} fill={c.pinned ? '#1E293B' : 'none'} />
              {c.pinned ? 'Épinglé' : 'Épingler'}
            </button>
            <button onClick={toggleArchive} className="btn-ghost gap-1.5" title={c.archived ? 'Restaurer' : 'Archiver'}>
              {c.archived ? <><ArchiveRestore size={14} /> Restaurer</> : <><Archive size={14} /> Archiver</>}
            </button>
            <button onClick={deleteCase} className="btn-ghost" style={{ color: '#DC2626' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {c.case_number && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#64748B' }}>
                  #{c.case_number}
                </span>
              )}
              {c.case_type && (
                <span className="text-[11px] px-2 py-0.5 rounded capitalize" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  {c.case_type}
                </span>
              )}
            </div>
            <h1 className="text-[24px] font-semibold mt-2" style={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
              {c.name}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#94A3B8' }}>{c.client_name}</p>
          </div>
          {nearestDl && (() => {
            const dl = deadlineLabel(nearestDl.deadline)
            return dl ? (
              <div className="text-right">
                <p className="text-[11px] mb-1" style={{ color: '#94A3B8' }}>Prochain délai</p>
                <p className="text-[13px] font-medium" style={{ color: dl.color }}>{dl.text}</p>
              </div>
            ) : null
          })()}
        </div>

        {/* Summary */}
        {c.summary && (
          <div className="rounded-lg px-5 py-4 mb-6" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <p className="section-label mb-2">Résumé IA</p>
            <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{c.summary}</p>
          </div>
        )}

        {/* Edit form */}
        <div className="card p-5 mb-6">
          <p className="section-label mb-4">Informations</p>
          <div className="space-y-4">
            <div>
              <label className="field-label">Nom du dossier</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Client</label>
              <input className="input-field" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Numéro de dossier <span style={{ color: '#CBD5E1', fontWeight: 400 }}>(optionnel)</span></label>
              <input
                className="input-field"
                placeholder="Ex: 2024-0042"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Type de dossier</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={caseType}
                  onChange={e => setCaseType(e.target.value)}
                >
                  {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
              </div>
              {caseType === 'autre' && (
                <input
                  className="input-field mt-2"
                  placeholder="Précisez le type…"
                  value={caseTypeCustom}
                  onChange={e => setCaseTypeCustom(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="field-label">Délai principal</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nom (ex: Jugement)"
                  className="input-field"
                  style={{ color: '#0F172A', minWidth: '160px', flex: 1 }}
                  value={deadlineName}
                  onChange={e => setDeadlineName(e.target.value)}
                />
                <input
                  type="date"
                  className="input-field"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                />
              </div>
              {deadline && (
                <div className="flex gap-1">
                  {(['stable', 'monitor', 'urgent'] as DeadlineUrgency[]).map(u => {
                    const col = URGENCY_COLORS[u]
                    return (
                      <button
                        key={u}
                        onClick={() => setDeadlineUrgency(u)}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                        style={{
                          background: deadlineUrgency === u ? col.bg : '#F9FAFB',
                          color: deadlineUrgency === u ? col.text : '#9CA3AF',
                          border: `1px solid ${deadlineUrgency === u ? col.dot : '#E5E7EB'}`,
                        }}
                      >
                        {col.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Enregistrement…</>
                : <><CheckCircle size={14} /> Sauvegarder</>
              }
            </button>
          </div>
        </div>

        {/* Deadlines */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color: '#94A3B8' }} />
            <p className="section-label">Délais ({caseDeadlines.filter(d => !d.completed).length + (c?.deadline ? 1 : 0)})</p>
          </div>
          <div className="space-y-2 mb-4">
            {/* Main deadline */}
            {c?.deadline && (
              <div
                className="rounded-lg"
                style={{ background: URGENCY_COLORS[(c.deadline_urgency as DeadlineUrgency) || 'stable'].bg, border: `1px solid ${URGENCY_COLORS[(c.deadline_urgency as DeadlineUrgency) || 'stable'].dot}30` }}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: URGENCY_COLORS[(c.deadline_urgency as DeadlineUrgency) || 'stable'].dot, flexShrink: 0 }} />
                    <div>
                      <p className="text-[13px] font-medium">
                        {c.deadline_name
                          ? <span style={{ color: '#0F172A' }}>{c.deadline_name}</span>
                          : <span style={{ color: '#CBD5E1', fontStyle: 'italic' }}>Délai principal</span>
                        }
                      </p>
                      <p className="text-[12px]" style={{ color: '#94A3B8' }}>{format(new Date(c.deadline), 'd MMM yyyy', { locale: fr })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const dl = deadlineLabel(c.deadline)
                      return dl ? (
                        <span className="text-[11px] font-medium" style={{ color: dl.color }}>{dl.text}</span>
                      ) : null
                    })()}
                    {/* Toggle urgency edit */}
                    <button
                      onClick={() => setEditingDeadlineUrgency(editingDeadlineUrgency === 'main' ? null : 'main')}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-all"
                      style={{ color: '#94A3B8', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.7)' }}
                      title="Modifier l'urgence"
                    >
                      Modifier
                    </button>
                    {/* Fait button */}
                    <button
                      onClick={completeMainDeadline}
                      className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all"
                      style={{ color: '#6B7280', border: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.7)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                      title="Marquer comme fait"
                    >
                      <Check size={11} /> Fait
                    </button>
                  </div>
                </div>
                {/* Urgency editor for main deadline */}
                {editingDeadlineUrgency === 'main' && (
                  <div className="px-4 pb-3 flex gap-1">
                    {(['stable', 'monitor', 'urgent'] as DeadlineUrgency[]).map(u => {
                      const col = URGENCY_COLORS[u]
                      const current = (c.deadline_urgency as DeadlineUrgency) || 'stable'
                      return (
                        <button
                          key={u}
                          onClick={async () => {
                            await supabase.from('cases').update({ deadline_urgency: u }).eq('id', c.id)
                            setCase(prev => prev ? { ...prev, deadline_urgency: u } : prev)
                            setEditingDeadlineUrgency(null)
                          }}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                          style={{
                            background: current === u ? col.bg : '#F9FAFB',
                            color: current === u ? col.text : '#9CA3AF',
                            border: `1px solid ${current === u ? col.dot : '#E5E7EB'}`,
                          }}
                        >
                          {col.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Additional deadlines */}
            {caseDeadlines.filter(d => !d.completed).map(cd => {
              const dl = deadlineLabel(cd.deadline)
              const uc = URGENCY_COLORS[(cd.urgency as DeadlineUrgency) || 'stable']
              const snoozed = isDeadlineSnoozed(cd)
              const isEditingUrgency = editingDeadlineUrgency === cd.id
              return (
                <div
                  key={cd.id}
                  className="rounded-lg"
                  style={{
                    background: snoozed ? '#F9FAFB' : uc.bg,
                    border: `1px solid ${snoozed ? '#E5E7EB' : uc.dot + '30'}`,
                    opacity: snoozed ? 0.7 : 1,
                  }}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: snoozed ? '#D1D5DB' : uc.dot, flexShrink: 0 }} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>{cd.name}</p>
                          {snoozed && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#9CA3AF' }}>
                              Reporté à demain
                            </span>
                          )}
                        </div>
                        <p className="text-[12px]" style={{ color: '#94A3B8' }}>
                          {format(new Date(cd.deadline), 'd MMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dl && !snoozed && (
                        <span className="text-[11px] font-medium" style={{ color: dl.color }}>{dl.text}</span>
                      )}
                      {/* Toggle urgency edit */}
                      <button
                        onClick={() => setEditingDeadlineUrgency(isEditingUrgency ? null : cd.id)}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-all"
                        style={{ color: '#94A3B8', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.6)' }}
                        title="Modifier l'urgence"
                      >
                        Modifier
                      </button>
                      {/* Snooze */}
                      <button
                        onClick={() => snoozeDeadline(cd.id)}
                        disabled={snoozed}
                        className="p-1.5 rounded transition-colors"
                        title="Reporter à demain"
                        style={{ color: snoozed ? '#E5E7EB' : '#D1D5DB' }}
                        onMouseEnter={e => { if (!snoozed) { e.currentTarget.style.color = '#D97706'; e.currentTarget.style.background = '#FFFBEB' } }}
                        onMouseLeave={e => { e.currentTarget.style.color = snoozed ? '#E5E7EB' : '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <BellOff size={12} />
                      </button>
                      {/* Fait */}
                      <button
                        onClick={() => completeDeadline(cd.id)}
                        className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all"
                        style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ECFDF5'; e.currentTarget.style.color = '#10B981'; e.currentTarget.style.borderColor = '#10B981' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = '#E5E7EB' }}
                      >
                        <Check size={11} /> Fait
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => deleteDeadline(cd.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: '#D1D5DB' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEF2F2' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#D1D5DB'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {/* Urgency editor for this deadline */}
                  {isEditingUrgency && (
                    <div className="px-4 pb-3 flex gap-1">
                      {(['stable', 'monitor', 'urgent'] as DeadlineUrgency[]).map(u => {
                        const col = URGENCY_COLORS[u]
                        const current = (cd.urgency as DeadlineUrgency) || 'stable'
                        return (
                          <button
                            key={u}
                            onClick={() => updateDeadlineUrgency(cd.id, u)}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                            style={{
                              background: current === u ? col.bg : '#F9FAFB',
                              color: current === u ? col.text : '#9CA3AF',
                              border: `1px solid ${current === u ? col.dot : '#E5E7EB'}`,
                            }}
                          >
                            {col.label}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add deadline form */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field"
                placeholder="Nom du délai (ex: Audience tribunal)"
                style={{ color: '#0F172A', flex: 1, minWidth: '160px' }}
                value={newDeadlineName}
                onChange={e => setNewDeadlineName(e.target.value)}
              />
              <input
                type="date"
                className="input-field"
                value={newDeadlineDate}
                onChange={e => setNewDeadlineDate(e.target.value)}
              />
            </div>
            {/* Threshold fields — descriptive labels */}
            <div className="rounded-md px-3 py-2" style={{ background: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <p className="text-[10px] font-medium mb-2" style={{ color: '#94A3B8' }}>ALERTES AUTOMATIQUES</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: '#D97706' }}>Passe en à surveiller</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    className="input-field text-[12px] text-center font-medium"
                    style={{ width: 52, padding: '3px 6px', color: '#D97706', border: '1px solid #FDE68A', background: '#FFFBEB' }}
                    value={newDeadlineMonitorDays}
                    onChange={e => setNewDeadlineMonitorDays(e.target.value)}
                  />
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>j avant</span>
                </label>
                <span style={{ color: '#E2E8F0' }}>·</span>
                <label className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: '#DC2626' }}>Passe en urgent</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    className="input-field text-[12px] text-center font-medium"
                    style={{ width: 52, padding: '3px 6px', color: '#DC2626', border: '1px solid #FECACA', background: '#FEF2F2' }}
                    value={newDeadlineUrgentDays}
                    onChange={e => setNewDeadlineUrgentDays(e.target.value)}
                  />
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>j avant</span>
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(['stable', 'monitor', 'urgent'] as DeadlineUrgency[]).map(u => {
                  const col = URGENCY_COLORS[u]
                  return (
                    <button
                      key={u}
                      onClick={() => setNewDeadlineUrgency(u)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                      style={{
                        background: newDeadlineUrgency === u ? col.bg : '#F9FAFB',
                        color: newDeadlineUrgency === u ? col.text : '#9CA3AF',
                        border: `1px solid ${newDeadlineUrgency === u ? col.dot : '#E5E7EB'}`,
                      }}
                    >
                      {col.label}
                    </button>
                  )
                })}
              </div>
              <button
                onClick={addDeadline}
                disabled={savingDeadline || !newDeadlineName.trim() || !newDeadlineDate}
                className="btn-primary gap-1.5"
                style={{ padding: '0 14px' }}
              >
                {savingDeadline ? <Loader2 size={14} className="animate-spin" /> : <><Plus size={14} /> Ajouter</>}
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} style={{ color: '#94A3B8' }} />
            <p className="section-label">Notes ({notes.length})</p>
          </div>
          <div className="space-y-2 mb-3">
            {notes.map(note => (
              <div key={note.id} className="flex items-start gap-3 px-4 py-3 rounded-lg" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <p className="flex-1 text-[13px] leading-relaxed" style={{ color: '#0F172A' }}>{note.content}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                    {format(new Date(note.created_at), 'd MMM', { locale: fr })}
                  </span>
                  <button onClick={() => deleteNote(note.id)} style={{ color: '#CBD5E1' }} className="hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Ajouter une note…"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addNote()}
            />
            <button
              onClick={addNote}
              disabled={savingNote || !newNote.trim()}
              className="btn-primary gap-1.5"
              style={{ padding: '0 14px' }}
            >
              {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-label">Documents ({docs.length})</p>
            <Link to={`/upload?case_id=${c?.id}`} className="btn-ghost gap-1.5 text-[13px]" style={{ padding: '6px 10px' }}>
              <Plus size={14} /> Ajouter doc
            </Link>
          </div>
          {docs.length === 0 ? (
            <div className="rounded-lg px-5 py-8 text-center" style={{ border: '1.5px dashed #E2E8F0' }}>
              <p className="text-[13px]" style={{ color: '#94A3B8' }}>Aucun document attaché</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => {
                return (
                  <div
                    key={doc.id}
                    className="flex items-start gap-4 px-4 py-3.5 rounded-lg cursor-pointer group transition-colors hover:bg-gray-50"
                    style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                    onClick={() => viewDocument(doc)}
                  >
                    <FileText size={16} className="shrink-0 mt-0.5" style={{ color: '#94A3B8' }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[13px] font-medium truncate" style={{ color: '#0F172A' }}>{doc.name}</p>
                        {/* Doc type tag */}
                        {editingDocType === doc.id ? (
                          <div className="relative" onClick={e => e.stopPropagation()}>
                            <select
                              className="text-[11px] px-2 py-0.5 rounded-md border outline-none"
                              style={{ background: '#F9FAFB', borderColor: '#E5E7EB', color: '#374151' }}
                              defaultValue={doc.doc_type || ''}
                              onChange={e => { if (e.target.value) updateDocType(doc.id, e.target.value) }}
                              autoFocus
                              onBlur={() => setEditingDocType(null)}
                            >
                              <option value="">— Type —</option>
                              {(Object.entries(DOC_HIERARCHY) as [DocCategory, typeof DOC_HIERARCHY[DocCategory]][]).map(([cat, info]) => (
                                <optgroup key={cat} label={info.label}>
                                  {info.subs.map(sub => (
                                    <option key={sub} value={formatDocType(cat, sub)}>{sub}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                        ) : (() => {
                          const display = getDocTypeDisplay(doc.doc_type)
                          return (
                            <button
                              onClick={e => { e.stopPropagation(); setEditingDocType(doc.id) }}
                              className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
                              style={{
                                background: display ? display.color + '18' : '#F3F4F6',
                                color: display ? display.color : '#9CA3AF',
                                border: `1px solid ${display ? display.color + '40' : '#E5E7EB'}`,
                              }}
                              title="Changer le type"
                            >
                              <Tag size={9} />
                              {display ? display.label : 'Type'}
                            </button>
                          )
                        })()}
                      </div>
                      {doc.summary && !docSummaries[doc.id] && (
                        <p className="text-[12px] mb-1 leading-relaxed" style={{ color: '#475569' }}>{doc.summary}</p>
                      )}

                      {/* Résumé Gemini généré à la demande */}
                      {docSummaryLoading[doc.id] && (
                        <div className="flex items-center gap-2 mt-1 mb-1" onClick={e => e.stopPropagation()}>
                          <Loader2 size={12} className="animate-spin" style={{ color: '#6366F1' }} />
                          <span className="text-[12px]" style={{ color: '#6366F1' }}>Analyse en cours…</span>
                        </div>
                      )}
                      {docSummaries[doc.id] && (
                        <div
                          className="mt-2 mb-2 p-3 rounded-lg text-[12px] leading-relaxed whitespace-pre-wrap"
                          style={{ background: '#F0F4FF', color: '#334155', border: '1px solid #C7D2FE' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {docSummaries[doc.id]}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => saveSummary(doc.id)}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors"
                              style={{ background: '#6366F1', color: 'white' }}
                            >
                              <Save size={10} />
                              Sauvegarder
                            </button>
                            <button
                              onClick={() => downloadSummary(doc.name, docSummaries[doc.id])}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors"
                              style={{ background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}
                            >
                              <Download size={10} />
                              Télécharger .txt
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Bouton Résumer désactivé temporairement — quota Gemini à configurer */}
                        {doc.extracted_date && (
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: '#94A3B8' }}>
                            <Calendar size={11} />
                            {format(new Date(doc.extracted_date), 'd MMM yyyy', { locale: fr })}
                          </span>
                        )}
                        <span className="text-[11px]" style={{ color: '#CBD5E1' }}>
                          Ajouté le {format(new Date(doc.created_at), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); downloadDocument(doc) }}
                      disabled={downloadingDoc === doc.id}
                      className="shrink-0 p-1 rounded transition-opacity opacity-0 group-hover:opacity-100"
                      style={{ color: '#94A3B8' }}
                      title="Télécharger"
                    >
                      {downloadingDoc === doc.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />
                      }
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* PDF Viewer Modal */}
        {viewingDoc && viewingUrl && (
          <PDFViewer
            url={viewingUrl}
            fileName={viewingDoc.name}
            onClose={() => { setViewingDoc(null); setViewingUrl(null) }}
            onDownload={() => downloadDocument(viewingDoc)}
          />
        )}
      </div>
    </AppLayout>
  )
}
