import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { toast } from 'sonner'
import { Upload as UploadIcon, FileText, X, Loader2, ChevronDown, Mail, Calendar } from 'lucide-react'
import type { CaseStatus, Case } from '../types'
import { parseEmlFile } from '../lib/emailParser'
import { parseIcsFile } from '../lib/icsParser'

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

  // Case fields
  const [caseName, setCaseName] = useState('')
  const [clientName, setClientName] = useState('')
  const [status, setStatus] = useState<CaseStatus>('stable')
  const [caseType, setCaseType] = useState('civil')
  const [caseTypeCustom, setCaseTypeCustom] = useState('')

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

  // Load existing case if case_id in URL
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
          setStatus(data.status)
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
      setFile(f) // Store for later
      toast.success('Email analysé - Remplissez les détails')
    } catch (err) {
      toast.error('Erreur lors de la lecture de l\'email')
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
      setFile(f) // Store for later
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

      // 2. Determine case ID (existing or new)
      let caseIdToUse: string
      if (existingCase) {
        // Updating existing case — save changes if any
        await supabase.from('cases').update({
          name: caseName.trim(),
          client_name: clientName.trim(),
          status,
        }).eq('id', existingCase.id)
        caseIdToUse = existingCase.id
      } else {
        // Générer numéro de dossier unique (YYYY-NNN)
        const year = new Date().getFullYear()
        const { count } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        const caseNumber = `${year}-${String((count || 0) + 1).padStart(3, '0')}`
        const finalType = caseType === 'autre' ? (caseTypeCustom.trim() || 'autre') : caseType

        // Create new case
        const { data: newCase, error: caseError } = await supabase
          .from('cases')
          .insert({
            user_id: user.id,
            name: caseName.trim(),
            client_name: clientName.trim(),
            status,
            pinned: false,
            case_type: finalType,
            case_number: caseNumber,
          })
          .select()
          .single()
        if (caseError) throw caseError
        caseIdToUse = newCase.id
      }

      // 3. Create document record
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          case_id: caseIdToUse,
          user_id: user.id,
          name: file.name,
          storage_path: filePath,
        })
        .select()
        .single()
      if (docError) throw docError

      // 4. Generate signed URL (60 min)
      const { data: signedData } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600)
      const pdfUrl = signedData?.signedUrl ?? null

      // 5. Trigger n8n AI extraction (fire & forget)
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
        }).catch(() => {}) // fire & forget
      }

      toast.success(existingCase ? 'Document ajouté — l\'IA analyse' : 'Dossier créé — l\'IA analyse')
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
            <button
              type="button"
              onClick={() => { setMode('pdf'); setFile(null) }}
              className="flex-1 px-3 py-2 rounded text-[13px] font-medium transition-colors"
              style={{
                background: mode === 'pdf' ? '#1E293B' : '#FFFFFF',
                color: mode === 'pdf' ? '#FFFFFF' : '#475569',
                border: `1px solid ${mode === 'pdf' ? '#1E293B' : '#E2E8F0'}`,
              }}
            >
              <UploadIcon size={14} className="inline mr-1.5" /> PDF
            </button>
            <button
              type="button"
              onClick={() => { setMode('email'); setFile(null) }}
              className="flex-1 px-3 py-2 rounded text-[13px] font-medium transition-colors"
              style={{
                background: mode === 'email' ? '#1E293B' : '#FFFFFF',
                color: mode === 'email' ? '#FFFFFF' : '#475569',
                border: `1px solid ${mode === 'email' ? '#1E293B' : '#E2E8F0'}`,
              }}
            >
              <Mail size={14} className="inline mr-1.5" /> Email
            </button>
            <button
              type="button"
              onClick={() => { setMode('outlook'); setFile(null) }}
              className="flex-1 px-3 py-2 rounded text-[13px] font-medium transition-colors"
              style={{
                background: mode === 'outlook' ? '#1E293B' : '#FFFFFF',
                color: mode === 'outlook' ? '#FFFFFF' : '#475569',
                border: `1px solid ${mode === 'outlook' ? '#1E293B' : '#E2E8F0'}`,
              }}
            >
              <Calendar size={14} className="inline mr-1.5" /> Outlook
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          <div>
            <p className="section-label mb-3">{mode === 'pdf' ? 'Document PDF' : mode === 'email' ? 'Fichier Email (.eml)' : 'Événement Outlook (.ics)'}</p>
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
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    style={{ color: '#94A3B8' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  {mode === 'pdf' ? (
                    <>
                      <UploadIcon size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                      <p className="text-[13px] font-medium" style={{ color: '#475569' }}>
                        Glissez un PDF ici
                      </p>
                    </>
                  ) : mode === 'email' ? (
                    <>
                      <Mail size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                      <p className="text-[13px] font-medium" style={{ color: '#475569' }}>
                        Glissez un email .eml ici
                      </p>
                    </>
                  ) : (
                    <>
                      <Calendar size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                      <p className="text-[13px] font-medium" style={{ color: '#475569' }}>
                        Glissez un événement Outlook (.ics) ici
                      </p>
                    </>
                  )}
                  <p className="text-[12px] mt-1" style={{ color: '#94A3B8' }}>
                    ou cliquez pour choisir un fichier
                  </p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <input
                ref={emailRef}
                type="file"
                accept=".eml"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
              <input
                ref={outlookRef}
                type="file"
                accept=".ics"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </div>
          </div>

          {/* Case info */}
          {!existingCase && (
            <div className="card p-5 space-y-4">
              <p className="section-label">Informations du dossier</p>
              <div>
                <label className="field-label">Nom du dossier</label>
                <input
                  className="input-field"
                  placeholder="Ex: Litige locatif — Tremblay"
                  value={caseName}
                  onChange={e => setCaseName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="field-label">Client</label>
                <input
                  className="input-field"
                  placeholder="Ex: Jean Tremblay"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  required
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
                    {CASE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                </div>
                {caseType === 'autre' && (
                  <input
                    className="input-field mt-2"
                    placeholder="Précisez le type de dossier…"
                    value={caseTypeCustom}
                    onChange={e => setCaseTypeCustom(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="field-label">Statut initial</label>
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
              : 'Créer le dossier'
            }
          </button>
        </form>
      </div>
    </AppLayout>
  )
}
