import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { toast } from 'sonner'
import { Upload as UploadIcon, FileText, X, Loader2, ChevronDown, Mail, Calendar } from 'lucide-react'
import type { Case, DeadlineUrgency } from '../types'
import { parseEmlFile } from '../lib/emailParser'
import { parseIcsFile } from '../lib/icsParser'
import { DOC_HIERARCHY, formatDocType, type DocCategory } from '../lib/docTypes'

const URGENCY_COLORS: Record<DeadlineUrgency, { bg: string; text: string; dot: string; label: string }> = {
  urgent:  { bg: '#FEF2F2', text: '#DC2626', dot: '#DC2626', label: 'Urgent' },
  monitor: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B', label: 'À surveiller' },
  stable:  { bg: '#ECFDF5', text: '#10B981', dot: '#10B981', label: 'Stable' },
}

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const caseId = searchParams.get('case_id')
  const fileRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const outlookRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [existingCase, setExistingCase] = useState<Case | null>(null)
  const [loadingCase, setLoadingCase] = useState(!!caseId)
  const [mode, setMode] = useState<'pdf' | 'email' | 'outlook'>('pdf')

  // Case fields (new case only)
  const [caseName, setCaseName] = useState('')
  const [clientName, setClientName] = useState('')
  const [caseType, setCaseType] = useState('civil')
  const [caseTypeCustom, setCaseTypeCustom] = useState('')

  // Document type (hierarchical)
  const [docCategory, setDocCategory] = useState<DocCategory | null>(null)
  const [docSubtype, setDocSubtype] = useState<string>('')

  // Main deadline (new case only)
  const [deadlineName, setDeadlineName] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')
  const [deadlineUrgency, setDeadlineUrgency] = useState<DeadlineUrgency>('stable')

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

  useEffect(() => {
    if (!caseId || !user) {
      setLoadingCase(false)
      return
    }
    supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingCase(data as Case)
          setCaseName(data.name)
          setClientName(data.client_name)
        } else {
          toast.error('Dossier introuvable')
        }
        setLoadingCase(false)
      })
  }, [caseId, user])

  const handleFile = (f: File) => {
    if (mode === 'pdf') {
      if (f.type !== 'application/pdf') {
        toast.error('Seuls les fichiers PDF sont acceptés')
        return
      }
      setFile(f)
      if (!caseName) {
        setCaseName(f.name.replace('.pdf', '').replace(/[-_]/g, ' '))
      }
    } else if (mode === 'email') {
      if (!f.name.endsWith('.eml')) {
        toast.error('Seuls les fichiers .eml sont acceptés')
        return
      }
      handleEmailFile(f)
    } else if (mode === 'outlook') {
      if (!f.name.endsWith('.ics')) {
        toast.error('Seuls les fichiers .ics sont acceptés')
        return
      }
      handleOutlookFile(f)
    }
  }

  const handleEmailFile = async (f: File) => {
    try {
      const parsed = await parseEmlFile(f)
      setCaseName(parsed.subject)
      setClientName(parsed.clientName)
      setFile(f)
      toast.success('Email analysé - Remplissez les détails')
    } catch (err) {
      toast.error("Erreur lors de la lecture de l'email")
      console.error(err)
    }
  }

  const handleOutlookFile = async (f: File) => {
    try {
      const parsed = await parseIcsFile(f)
      setCaseName(parsed.summary)
      if (parsed.description) {
        setClientName(parsed.description.split('\n')[0])
      }
      setFile(f)
      toast.success('Événement Outlook analysé - Remplissez les détails')
    } catch (err) {
      toast.error('Erreur lors de la lecture du fichier Outlook')
      console.error(err)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return
    if (!caseName.trim() || !clientName.trim()) {
      toast.error('Remplissez le nom du dossier et du client')
      return
    }

    setProcessing(true)
    try {
      // 1. Upload file to Supabase Storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      // 2. Determine case ID
      let caseIdToUse: string
      if (existingCase) {
        await supabase.from('cases').update({
          name: caseName.trim(),
          client_name: clientName.trim(),
        }).eq('id', existingCase.id)
        caseIdToUse = existingCase.id
      } else {
        const finalType = caseType === 'autre' ? (caseTypeCustom.trim() || 'autre') : caseType
        const caseInsert: Record<string, unknown> = {
          user_id: user.id,
          name: caseName.trim(),
          client_name: clientName.trim(),
          pinned: false,
          case_type: finalType,
        }
        if (deadlineDate) {
          caseInsert.deadline = deadlineDate
          caseInsert.deadline_name = deadlineName.trim() || null
          caseInsert.deadline_urgency = deadlineUrgency
        }
        const { data: newCase, error: caseError } = await supabase
          .from('cases')
          .insert(caseInsert)
          .select()
          .single()
        if (caseError) throw caseError
        caseIdToUse = newCase.id
      }

      // 3. Compute doc_type value
      const docType = docCategory && docSubtype
        ? formatDocType(docCategory, docSubtype)
        : docCategory
        ? docCategory
        : null

      // 4. Create document record
      const docInsert: Record<string, unknown> = {
        case_id: caseIdToUse,
        user_id: user.id,
        name: file.name,
        storage_path: filePath,
      }
      if (docType) docInsert.doc_type = docType

      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert(docInsert)
        .select()
        .single()
      if (docError) throw docError

      // 5. Generate signed URL
      const { data: signedData } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)
      const pdfUrl = signedData?.signedUrl ?? null

      // 6. Trigger n8n AI extraction (fire & forget)
      const webhookUrl = import.meta.env.VITE_N8N_UPLOAD_WEBHOOK
      if (webhookUrl && newDoc) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseIdToUse,
            doc_id: newDoc.id,
            storage_path: filePath,
            pdf_url: pdfUrl,
            user_id: user.id,
          }),
        }).catch(() => {})
      }

      toast.success(existingCase ? "Document ajouté — l'IA analyse" : "Dossier créé — l'IA analyse")
      navigate(`/dossier/${caseIdToUse}`)
    } catch (err) {
      console.error(err)
      toast.error('Erreur')
    }
    setProcessing(false)
  }

  if (loadingCase) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full" style={{ color: '#94A3B8' }}>
          Chargement…
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1
          className="text-[22px] font-semibold mb-8"
          style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
        >
          {existingCase ? 'Ajouter un document' : 'Nouveau dossier'}
        </h1>

        {!existingCase && (
          <div className="flex gap-2 mb-6">
            {(['pdf', 'email', 'outlook'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setFile(null) }}
                className="flex-1 px-3 py-2 rounded text-[13px] font-medium transition-colors"
                style={{
                  background: mode === m ? '#1E293B' : '#FFFFFF',
                  color: mode === m ? '#FFFFFF' : '#475569',
                  border: `1px solid ${mode === m ? '#1E293B' : '#E2E8F0'}`,
                }}
              >
                {m === 'pdf' && <><UploadIcon size={14} className="inline mr-1.5" />PDF</>}
                {m === 'email' && <><Mail size={14} className="inline mr-1.5" />Email</>}
                {m === 'outlook' && <><Calendar size={14} className="inline mr-1.5" />Outlook</>}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          <div>
            <p className="section-label mb-3">
              {mode === 'pdf' ? 'Document PDF' : mode === 'email' ? 'Fichier Email (.eml)' : 'Événement Outlook (.ics)'}
            </p>
            <div
              className="rounded-lg p-8 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragging ? '#3B82F6' : file ? '#16A34A' : '#E2E8F0'}`,
                background: dragging ? '#EFF6FF' : file ? '#F0FDF4' : '#FAFAFA',
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && (mode === 'pdf' ? fileRef.current?.click() : mode === 'email' ? emailRef.current?.click() : outlookRef.current?.click())}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText size={18} style={{ color: '#16A34A' }} />
                  <span className="text-[13px] font-medium" style={{ color: '#16A34A' }}>{file.name}</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null) }} style={{ color: '#94A3B8' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  {mode === 'pdf' && <><UploadIcon size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} /><p className="text-[13px] font-medium" style={{ color: '#475569' }}>Glissez un PDF ici</p></>}
                  {mode === 'email' && <><Mail size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} /><p className="text-[13px] font-medium" style={{ color: '#475569' }}>Glissez un email .eml ici</p></>}
                  {mode === 'outlook' && <><Calendar size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} /><p className="text-[13px] font-medium" style={{ color: '#475569' }}>Glissez un événement Outlook (.ics) ici</p></>}
                  <p className="text-[12px] mt-1" style={{ color: '#94A3B8' }}>ou cliquez pour choisir un fichier</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <input ref={emailRef} type="file" accept=".eml" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              <input ref={outlookRef} type="file" accept=".ics" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
            </div>
          </div>

          {/* Case info (new case only) */}
          {!existingCase && (
            <div className="card p-5 space-y-4">
              <p className="section-label">Informations du dossier</p>
              <div>
                <label className="field-label">Nom du dossier</label>
                <input className="input-field" placeholder="Ex: Litige locatif — Tremblay" value={caseName} onChange={e => setCaseName(e.target.value)} required />
              </div>
              <div>
                <label className="field-label">Client</label>
                <input className="input-field" placeholder="Ex: Jean Tremblay" value={clientName} onChange={e => setClientName(e.target.value)} required />
              </div>
              <div>
                <label className="field-label">Type de dossier</label>
                <div className="relative">
                  <select className="input-field appearance-none pr-8" value={caseType} onChange={e => setCaseType(e.target.value)}>
                    {CASE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                </div>
                {caseType === 'autre' && (
                  <input className="input-field mt-2" placeholder="Précisez le type de dossier…" value={caseTypeCustom} onChange={e => setCaseTypeCustom(e.target.value)} />
                )}
              </div>
            </div>
          )}

          {/* Document type (hierarchical) */}
          <div className="card p-5 space-y-4">
            <p className="section-label">
              Type de document <span style={{ color: '#CBD5E1', fontWeight: 400 }}>(optionnel)</span>
            </p>
            <div>
              <p className="field-label mb-2">Catégorie</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(DOC_HIERARCHY) as [DocCategory, typeof DOC_HIERARCHY[DocCategory]][]).map(([cat, info]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => { setDocCategory(cat); setDocSubtype('') }}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all"
                    style={{
                      background: docCategory === cat ? info.color + '20' : '#F9FAFB',
                      color: docCategory === cat ? info.color : '#6B7280',
                      border: `1px solid ${docCategory === cat ? info.color + '60' : '#E5E7EB'}`,
                    }}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>
            {docCategory && (
              <div>
                <p className="field-label mb-2">Type précis</p>
                <div className="flex flex-wrap gap-2">
                  {DOC_HIERARCHY[docCategory].subs.map(sub => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setDocSubtype(sub)}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md transition-all"
                      style={{
                        background: docSubtype === sub ? DOC_HIERARCHY[docCategory].color + '18' : '#F9FAFB',
                        color: docSubtype === sub ? DOC_HIERARCHY[docCategory].color : '#6B7280',
                        border: `1px solid ${docSubtype === sub ? DOC_HIERARCHY[docCategory].color + '40' : '#E5E7EB'}`,
                      }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main deadline (new case only) */}
          {!existingCase && (
            <div className="card p-5 space-y-4">
              <p className="section-label">
                Délai principal <span style={{ color: '#CBD5E1', fontWeight: 400 }}>(optionnel)</span>
              </p>
              <div>
                <label className="field-label">Nom du délai</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Audience, Jugement, Signification…"
                  value={deadlineName}
                  onChange={e => setDeadlineName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)}
                />
              </div>
              {deadlineDate && (
                <div>
                  <label className="field-label mb-2">Urgence</label>
                  <div className="flex gap-1.5 mt-1">
                    {(['stable', 'monitor', 'urgent'] as DeadlineUrgency[]).map(u => {
                      const col = URGENCY_COLORS[u]
                      return (
                        <button
                          key={u}
                          type="button"
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
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || processing}
            className="btn-primary w-full gap-2"
            style={{ height: 44 }}
          >
            {processing
              ? <><Loader2 size={14} className="animate-spin" /> Création en cours…</>
              : existingCase ? 'Ajouter le document' : 'Créer le dossier'
            }
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
