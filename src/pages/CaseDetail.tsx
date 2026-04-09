import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { StatusBadge } from '../components/ui/StatusBadge'
import { PDFViewer } from '../components/PDFViewer'
import { computeStatus } from '../lib/utils'
import { useUrgencySettings } from '../hooks/useUrgencySettings'
import type { Case, Document, CaseStatus, Note, CaseDeadline } from '../types'
import { toast } from 'sonner'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowLeft, Pin, FileText, Calendar, Trash2,
  Loader2, CheckCircle, ChevronDown, Plus, Download, Archive, ArchiveRestore,
  MessageSquare, Send, Clock
} from 'lucide-react'

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { urgentDays, monitorDays } = useUrgencySettings()
  const navigate = useNavigate()
  const [c, setCase] = useState<Case | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [status, setStatus] = useState<CaseStatus>('stable')
  const [deadline, setDeadline] = useState('')
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null)
  const [viewingDoc, setViewingDoc] = useState<Document | null>(null)
  const [viewingUrl, setViewingUrl] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [caseType, setCaseType] = useState('')
  const [caseTypeCustom, setCaseTypeCustom] = useState('')
  const [caseDeadlines, setCaseDeadlines] = useState<CaseDeadline[]>([])
  const [deadlineName, setDeadlineName] = useState('')
  const [newDeadlineName, setNewDeadlineName] = useState('')
  const [newDeadlineDate, setNewDeadlineDate] = useState('')
  const [savingDeadline, setSavingDeadline] = useState(false)

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
        setStatus(d.status)
        setDeadline(d.deadline?.slice(0, 10) || '')
        setDeadlineName(d.deadline_name || '')
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
        status,
        deadline: deadline || null,
        deadline_name: deadlineName.trim() || null,
        case_type: finalType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', c.id)
    if (error) toast.error('Erreur lors de la sauvegarde')
    else { toast.success('Dossier mis à jour'); setCase(prev => prev ? { ...prev, name, client_name: clientName, status, deadline, deadline_name: deadlineName, case_type: finalType } : prev) }
    setSaving(false)
  }

  const addNote = async () => {
    if (!c || !user || !newNote.trim()) return
    setSavingNote(true)
    const { data, error } = await supabase
      .from('notes')
      .insert({ case_id: c.id, user_id: user.id, content: newNote.trim() })
      .select()
      .single()
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
    const { data, error } = await supabase
      .from('case_deadlines')
      .insert({
        case_id: c.id,
        user_id: user.id,
        name: newDeadlineName.trim(),
        deadline: newDeadlineDate,
      })
      .select()
      .single()
    if (error) toast.error('Erreur')
    else { setCaseDeadlines(prev => [...prev, data as CaseDeadline].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())); setNewDeadlineName(''); setNewDeadlineDate('') }
    setSavingDeadline(false)
  }

  const deleteDeadline = async (deadlineId: string) => {
    await supabase.from('case_deadlines').delete().eq('id', deadlineId)
    setCaseDeadlines(prev => prev.filter(d => d.id !== deadlineId))
  }

  const getNearestDeadline = () => {
    const allDeadlines = [
      ...(c?.deadline ? [{ name: c.deadline_name || 'Principal', deadline: c.deadline }] : []),
      ...caseDeadlines.map(d => ({ name: d.name, deadline: d.deadline }))
    ]
    if (allDeadlines.length === 0) return null
    return allDeadlines.reduce((nearest, current) => {
      const currentDate = new Date(current.deadline).getTime()
      const nearestDate = new Date(nearest.deadline).getTime()
      return currentDate < nearestDate ? current : nearest
    })
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
    } catch (err) {
      toast.error('Erreur ouverture PDF')
    }
  }

  const downloadDocument = async (doc: Document) => {
    if (!user) return
    setDownloadingDoc(doc.id)
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.storage_path)
      if (error) throw error
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error('Erreur téléchargement')
    }
    setDownloadingDoc(null)
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="btn-ghost gap-1.5 -ml-2">
            <ArrowLeft size={14} /> Dossiers
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePin}
              className="btn-ghost gap-1.5"
              title={c.pinned ? 'Désépingler' : 'Épingler'}
            >
              <Pin size={14} fill={c.pinned ? '#1E293B' : 'none'} />
              {c.pinned ? 'Épinglé' : 'Épingler'}
            </button>
            <button
              onClick={toggleArchive}
              className="btn-ghost gap-1.5"
              title={c.archived ? 'Restaurer' : 'Archiver'}
            >
              {c.archived
                ? <><ArchiveRestore size={14} /> Restaurer</>
                : <><Archive size={14} /> Archiver</>
              }
            </button>
            <button onClick={deleteCase} className="btn-ghost" style={{ color: '#DC2626' }}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title + Deadline Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={computeStatus(c.status, c.deadline, urgentDays, monitorDays)} />
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
            <h1
              className="text-[24px] font-semibold mt-2"
              style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
            >
              {c.name}
            </h1>
            <p className="text-[13px] mt-1" style={{ color: '#94A3B8' }}>{c.client_name}</p>
          </div>
          {(() => {
            const nearest = getNearestDeadline()
            const dl = nearest ? deadlineLabel(nearest.deadline) : null
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
          <div
            className="rounded-lg px-5 py-4 mb-6"
            style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
          >
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
              <label className="field-label">Statut</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={status}
                  onChange={e => setStatus(e.target.value as CaseStatus)}
                >
                  <option value="stable">Stable</option>
                  <option value="monitor">À surveiller</option>
                  <option value="urgent">Urgent</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
              </div>
            </div>
            <div>
              <label className="field-label">Type de dossier</label>
              <div className="relative">
                <select
                  className="input-field appearance-none pr-8"
                  value={caseType}
                  onChange={e => setCaseType(e.target.value)}
                >
                  {CASE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom (ex: Jugement)"
                  className="input-field"
                  style={{ color: '#0F172A', minWidth: '200px', flex: 1 }}
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
            <p className="section-label">Délais ({caseDeadlines.length + (c?.deadline ? 1 : 0)})</p>
          </div>
          <div className="space-y-2 mb-4">
            {c?.deadline && (
              <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <div>
                  <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>{c.deadline_name || 'Principal'}</p>
                  <p className="text-[12px]" style={{ color: '#94A3B8' }}>{format(new Date(c.deadline), 'd MMM yyyy', { locale: fr })}</p>
                </div>
                {(() => {
                  const dl = deadlineLabel(c.deadline)
                  return dl ? <span className="text-[11px] font-medium" style={{ color: dl.color }}>{dl.text}</span> : null
                })()}
              </div>
            )}
            {caseDeadlines.map(cd => {
              const dl = deadlineLabel(cd.deadline)
              return (
                <div key={cd.id} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: '#0F172A' }}>{cd.name}</p>
                    <p className="text-[12px]" style={{ color: '#94A3B8' }}>{format(new Date(cd.deadline), 'd MMM yyyy', { locale: fr })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {dl && <span className="text-[11px] font-medium" style={{ color: dl.color }}>{dl.text}</span>}
                    <button onClick={() => deleteDeadline(cd.id)} style={{ color: '#CBD5E1' }} className="hover:text-red-400 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field"
              placeholder="Nom du délai (ex: Audience tribunal)"
              style={{ color: '#0F172A', minWidth: '200px', flex: 1 }}
              value={newDeadlineName}
              onChange={e => setNewDeadlineName(e.target.value)}
            />
            <input
              type="date"
              className="input-field"
              value={newDeadlineDate}
              onChange={e => setNewDeadlineDate(e.target.value)}
            />
            <button
              onClick={addDeadline}
              disabled={savingDeadline || !newDeadlineName.trim() || !newDeadlineDate}
              className="btn-primary gap-1.5"
              style={{ padding: '0 14px' }}
            >
              {savingDeadline ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
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
              <div
                key={note.id}
                className="flex items-start gap-3 px-4 py-3 rounded-lg"
                style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
              >
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
            <Link
              to={`/upload?case_id=${c?.id}`}
              className="btn-ghost gap-1.5 text-[13px]"
              style={{ padding: '6px 10px' }}
            >
              <Plus size={14} /> Ajouter doc
            </Link>
          </div>
          {docs.length === 0 ? (
            <div
              className="rounded-lg px-5 py-8 text-center"
              style={{ border: '1.5px dashed #E2E8F0' }}
            >
              <p className="text-[13px]" style={{ color: '#94A3B8' }}>Aucun document attaché</p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 px-4 py-3.5 rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                  style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                  onClick={() => viewDocument(doc)}
                >
                  <FileText size={16} className="shrink-0 mt-0.5" style={{ color: '#94A3B8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#0F172A' }}>{doc.name}</p>
                    {doc.summary && (
                      <p className="text-[12px] mt-1 leading-relaxed" style={{ color: '#475569' }}>{doc.summary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {doc.extracted_date && (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: '#94A3B8' }}>
                          <Calendar size={11} />
                          {format(new Date(doc.extracted_date), 'd MMM yyyy', { locale: fr })}
                        </span>
                      )}
                      <span className="text-[11px]" style={{ color: '#CBD5E1' }}>
                        {format(new Date(doc.created_at), 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); downloadDocument(doc) }}
                    disabled={downloadingDoc === doc.id}
                    className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#94A3B8' }}
                    title="Télécharger"
                  >
                    {downloadingDoc === doc.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Download size={14} />
                    }
                  </button>
                </div>
              ))}
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
