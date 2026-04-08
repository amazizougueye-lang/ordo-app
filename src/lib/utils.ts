import { differenceInDays, isPast, isToday } from 'date-fns'
import type { CaseStatus } from '../types'

/**
 * Calcule le statut effectif d'un dossier en tenant compte du délai.
 * Utilise les seuils personnalisés de l'avocat.
 *
 * @param storedStatus - Statut manuel (stable/monitor/urgent)
 * @param deadline - Date limite
 * @param urgentDays - Seuil urgent personnalisé (défaut: 1)
 * @param monitorDays - Seuil surveiller personnalisé (défaut: 7)
 */
export function computeStatus(
  storedStatus: CaseStatus,
  deadline: string | null,
  urgentDays: number = 1,
  monitorDays: number = 7
): CaseStatus {
  if (!deadline) return storedStatus

  const d = new Date(deadline)

  if (isPast(d) || isToday(d)) return 'urgent'

  const diff = differenceInDays(d, new Date())

  // Urgent si <= seuil urgent
  if (diff <= urgentDays) return 'urgent'

  // Surveiller si <= seuil monitor (mais pas urgent)
  if (diff <= monitorDays) {
    if (storedStatus === 'stable') return 'monitor'
    return storedStatus
  }

  // Sinon retour au statut manuel
  return storedStatus
}
