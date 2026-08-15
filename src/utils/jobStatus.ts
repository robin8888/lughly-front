/**
 * Cómo se llama y se pinta cada estado de un trabajo.
 *
 * Los nombres son los que usa el diseño (`isSubastas`, `isMisTrabajos`):
 * "abierta", "adjudicada", "expirada". El servidor los maneja en inglés
 * porque son valores de un enum, no texto para leer; la traducción vive
 * aquí, en un único sitio.
 */

import type { ApiJobStatus, ApiJobType } from '@/api/jobs.api'
import type { TagVariant } from '@/components/atoms/Tag'

interface StatusLook {
  label: string
  variant: TagVariant
}

const STATUS: Record<ApiJobStatus, StatusLook> = {
  DRAFT: { label: 'Borrador', variant: 'neutral' },
  OPEN: { label: 'Abierta', variant: 'accent' },
  AWARDED: { label: 'Adjudicada', variant: 'accent2' },
  IN_PROGRESS: { label: 'En curso', variant: 'available' },
  COMPLETED: { label: 'Terminada', variant: 'neutral' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
  CANCELLED: { label: 'Cancelada', variant: 'outline' },
}

export function jobStatusLook(status: ApiJobStatus): StatusLook {
  return STATUS[status]
}

const TYPE_LABEL: Record<ApiJobType, string> = {
  AUCTION: 'Subasta inversa',
  QUOTE: 'Presupuesto directo',
  INSTANT: 'Reserva instantánea',
  URGENT: 'Urgencia',
}

export function jobTypeLabel(type: ApiJobType): string {
  return TYPE_LABEL[type]
}

/**
 * Cuánto queda para que cierre la subasta, en palabras.
 *
 * Sin segundos ni cuentas atrás vivas: en una lista, un contador que corre
 * obliga a repintar cada segundo y no aporta nada. "2 días" basta para
 * decidir si hay que darse prisa.
 */
export function timeLeftLabel(endsAt: string, now: Date = new Date()): string {
  const remaining = new Date(endsAt).getTime() - now.getTime()

  if (Number.isNaN(remaining)) return ''
  if (remaining <= 0) return 'Plazo cumplido'

  const days = Math.floor(remaining / 86_400_000)
  if (days >= 1) return `Cierra en ${days} ${days === 1 ? 'día' : 'días'}`

  const hours = Math.floor(remaining / 3_600_000)
  if (hours >= 1) return `Cierra en ${hours} ${hours === 1 ? 'hora' : 'horas'}`

  return 'Cierra en menos de una hora'
}
