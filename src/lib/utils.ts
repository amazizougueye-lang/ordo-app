import { differenceInDays, isPast, isToday } from 'date-fns'
import type { CaseStatus } from '../types'

/**
 * Calcule le statut effectif d'un dossier en tenant compte du délai.
 * Le délai prend la priorité sur le statut manuel si plus urgent.
 *
 * Règles :
 *  - Délai dépassé ou aujourd'hui → urgent
 *  - Délai dans 1 à 7 jours       → au moins surveiller
 *  - Sinon                         → statut manuel de l'avocat
 */
export function computeStatus(storedStatus: CaseStatus, deadline: string | null): CaseStatus {
  if (!deadline) return storedStatus

  const d = new Date(deadline)

  if (isPast(d) || isToday(d)) return 'urgent'

  const diff = differenceInDays(d, new Date())
  if (diff <= 7) {
    // Escalade si le délai est plus urgent que le statut manuel
    if (storedStatus === 'stable') return 'monitor'
    return storedStatus
  }

  return storedStatus
}
