import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { AppLayout } from '../components/AppLayout'
import { toast } from 'sonner'
import { Upload as UploadIcon, FileText, X, Loader2, ChevronDown } from 'lucide-react'
import type { CaseStatus } from '../types'

export default function Upload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)

  // Case fields
  const [caseName, setCaseName] = useState('')
  const [clientName, setClientName] = useState('')
  const [status, setStatus] = useState<CaseStatus>('stable')

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') {
      toast.error('Seuls les fichiers PDF sont acceptés')
      return
    }
    setFile(f)
    // Auto-fill case name from filename
    if (!caseName) {
      setCaseName(f.name.replace('.pdf', '').replace(/[-_]/g, ' '))
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

      // 2. Create case
      const { data: newCase, error: caseError } = await supabase
        .from('cases')
        .insert({
          user_id: user.id,
          name: caseName.trim(),
          client_name: clientName.trim(),
          status,
          pinned: false,
        })
        .select()
        .single()
      if (caseError) throw caseError

      // 3. Create document record — AI extraction via n8n webhook (async)
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          case_id: newCase.id,
          user_id: user.id,
          name: file.name,
          storage_path: filePath,
        })
        .select()
        .single()
      if (docError) throw docError

      // 4. Trigger n8n AI extraction (fire & forget)
      const webhookUrl = import.meta.env.VITE_N8N_UPLOAD_WEBHOOK
      if (webhookUrl && newDoc) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: newCase.id,
            doc_id: newDoc.id,
            storage_path: filePath,
            user_id: user.id,
          }),
        }).catch(() => {}) // fire & forget
      }

      toast.success('Dossier créé — l\'IA analyse le document')
      navigate(`/dossier/${newCase.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la création du dossier')
    }
    setProcessing(false)
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-6 py-8">
        <h1
          className="text-[22px] font-semibold mb-8"
          style={{ color: '#0F172A', letterSpacing: '-0.02em' }}
        >
          Nouveau dossier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          <div>
            <p className="section-label mb-3">Document PDF</p>
            <div
              className="rounded-lg p-8 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${dragging ? '#3B82F6' : file ? '#16A34A' : '#E2E8F0'}`,
                background: dragging ? '#EFF6FF' : file ? '#F0FDF4' : '#FAFAFA',
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileRef.current?.click()}
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
                  <UploadIcon size={24} className="mx-auto mb-3" style={{ color: '#CBD5E1' }} />
                  <p className="text-[13px] font-medium" style={{ color: '#475569' }}>
                    Glissez un PDF ici
                  </p>
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
            </div>
          </div>

          {/* Case info */}
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
