import { differenceInDays, isPast, isToday } from 'date-fns'
import type { CaseStatus, DeadlineUrgency } from '../types'

const URGENCY_RANK: Record<DeadlineUrgency, number> = { urgent: 2, monitor: 1, stable: 0 }

/**
 * Calcule l'urgence effective d'une échéance en tenant compte des seuils
 * auto (monitor_days, urgent_days). L'auto-escalade prend le dessus sur le
 * statut manuel mais ne peut pas le réduire.
 *
 * @param manual       - Urgence manuelle définie par l'avocat
 * @param deadline     - Date limite (ISO string)
 * @param monitorDays  - Seuil "à surveiller" en jours (optionnel)
 * @param urgentDays   - Seuil "urgent" en jours (optionnel)
 */
export function computeEffectiveUrgency(
  manual: DeadlineUrgency,
  deadline: string,
  monitorDays: number | null = null,
  urgentDays: number | null = null
): DeadlineUrgency {
  const d = new Date(deadline)
  const now = new Date()

  // Passé ou aujourd'hui → toujours urgent
  if (isPast(d) || isToday(d)) return 'urgent'

  const daysLeft = differenceInDays(d, now)

  let auto: DeadlineUrgency = 'stable'
  if (urgentDays !== null && daysLeft <= urgentDays) auto = 'urgent'
  else if (monitorDays !== null && daysLeft <= monitorDays) auto = 'monitor'

  // Escalader (jamais réduire le statut manuel)
  return URGENCY_RANK[auto] > URGENCY_RANK[manual] ? auto : manual
}

/** @deprecated Use computeEffectiveUrgency instead */
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
  if (diff <= urgentDays) return 'urgent'
  if (diff <= monitorDays) {
    if (storedStatus === 'stable') return 'monitor'
    return storedStatus
  }
  return storedStatus
}
