import { X, Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function PDFViewer({
  url,
  fileName,
  onClose,
  onDownload,
}: {
  url: string
  fileName: string
  onClose: () => void
  onDownload: () => void
}) {
  const [loading, setLoading] = useState(true)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="min-w-0">
            <p className="text-[14px] font-medium truncate" style={{ color: '#0F172A' }}>
              {fileName}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onDownload}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Télécharger"
            >
              <Download size={18} style={{ color: '#475569' }} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Fermer"
            >
              <X size={18} style={{ color: '#475569' }} />
            </button>
          </div>
        </div>

        {/* PDF Container */}
        <div className="flex-1 overflow-auto bg-gray-100 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <Loader2 size={24} className="animate-spin" style={{ color: '#94A3B8' }} />
            </div>
          )}
          <iframe
            src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  )
}
