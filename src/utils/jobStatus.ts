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
  /**
   * Encargado a alguien concreto y esperando su respuesta. Si trabaja para
   * una empresa, quien responde es ella.
   */
  PENDING_PRO: { label: 'Esperando respuesta', variant: 'accent' },
  /**
   * La empresa propone mandar a otra persona y falta que el cliente diga.
   * Va en el color de urgencia porque es lo único de la lista que necesita
   * que el cliente haga algo.
   */
  SUBSTITUTE_PROPOSED: { label: 'Te proponen un cambio', variant: 'accent2' },
  /**
   * Asignado y esperando que el profesional lo confirme. Al cliente se le dice
   * así de neutro a propósito: quién va y cómo se organiza la empresa por
   * dentro no es asunto suyo, pero sí lo es que todavía no es firme.
   */
  PENDING_WORKER: { label: 'Pendiente de confirmar', variant: 'accent' },
  AWARDED: { label: 'Adjudicada', variant: 'accent2' },
  IN_PROGRESS: { label: 'En curso', variant: 'available' },
  COMPLETED: { label: 'Terminada', variant: 'neutral' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
  /** Dijeron que no. Se distingue de expirada: una es respuesta y otra silencio */
  DECLINED: { label: 'No pueden', variant: 'outline' },
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
