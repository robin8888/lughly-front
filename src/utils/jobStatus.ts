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

/*
 * Aquí vivía `timeLeftLabel`, que daba el plazo en palabras ("Cierra en 2
 * días") sin cuenta atrás. Se retiró el 15 Agosto 2026 al sustituirse por el
 * átomo `Countdown`, que sí corre.
 *
 * El motivo original para no tener contador vivo era el gasto de repintar
 * cada segundo. Lo resuelve `useCountdown` cambiando el ritmo según lo que
 * quede: cada minuto mientras faltan horas, cada segundo en la última.
 */
