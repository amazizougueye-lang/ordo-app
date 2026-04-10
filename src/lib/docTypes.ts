export type DocCategory = 'procedure' | 'correspondance' | 'preuve' | 'administratif'

export const DOC_HIERARCHY: Record<DocCategory, { label: string; color: string; subs: string[] }> = {
  procedure:      { label: 'Procédure',      color: '#8B5CF6', subs: ['Actes de procédure', 'Significations', 'Jugements'] },
  correspondance: { label: 'Correspondance', color: '#3B82F6', subs: ['Emails', 'Lettres', 'Mises en demeure'] },
  preuve:         { label: 'Preuve',         color: '#D97706', subs: ['Contrats', 'Factures', 'Photos', 'Expertises'] },
  administratif:  { label: 'Administratif',  color: '#6B7280', subs: ['Mandats', 'Procurations', 'Formulaires'] },
}

export function formatDocType(category: DocCategory, sub: string): string {
  return `${category}:${sub}`
}

export function parseDocType(raw: string | null): { category: DocCategory | null; sub: string | null } {
  if (!raw) return { category: null, sub: null }
  const idx = raw.indexOf(':')
  if (idx === -1) {
    const cat = raw as DocCategory
    return { category: DOC_HIERARCHY[cat] ? cat : null, sub: null }
  }
  const cat = raw.slice(0, idx) as DocCategory
  const sub = raw.slice(idx + 1) || null
  return { category: DOC_HIERARCHY[cat] ? cat : null, sub }
}

export function getDocTypeDisplay(raw: string | null): { label: string; color: string } | null {
  if (!raw) return null
  const { category, sub } = parseDocType(raw)
  if (!category) return null
  const info = DOC_HIERARCHY[category]
  return { label: sub || info.label, color: info.color }
}
