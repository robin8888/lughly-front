/**
 * Cómo se llama y se pinta cada estado de un trabajo.
 *
 * Los nombres son los que usa el diseño (`isSubastas`, `isMisTrabajos`):
 * "abierta", "adjudicada", "expirada". El servidor los maneja en inglés
 * porque son valores de un enum, no texto para leer; la traducción vive
 * aquí, en un único sitio.
 */

import type { ApiAppointmentStatus, ApiJobStatus, ApiJobType } from '@/api/jobs.api'
import type { TagVariant } from '@/components/atoms/Tag'
import { theme } from '@/theme'

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
  /** Se llamaba `AWARDED` hasta el 22 Ago 2026; el rótulo no cambia, solo la clave */
  CONTRACTED: { label: 'Adjudicada', variant: 'accent2' },
  /**
   * Se contrató la visita y ya hay presupuesto: falta que el cliente lo
   * acepte o lo rechace. Mismo color que "te proponen un cambio": necesita
   * que el cliente haga algo.
   */
  QUOTED: { label: 'Con presupuesto', variant: 'accent2' },
  /** Rechazado, pero no cerrado del todo: vence a los 15 días sin uno nuevo */
  QUOTE_REJECTED: { label: 'Presupuesto rechazado', variant: 'outline' },
  IN_PROGRESS: { label: 'En curso', variant: 'available' },
  COMPLETED: { label: 'Terminada', variant: 'neutral' },
  /** Cerrado sin arreglo: el presupuesto venció, o no llegó tras la visita */
  CLOSED: { label: 'Cerrada sin trato', variant: 'outline' },
  /** El cliente ha abierto una disputa sobre un cobro. Lo resuelve administración */
  DISPUTED: { label: 'En revisión', variant: 'urgency' },
  EXPIRED: { label: 'Expirada', variant: 'outline' },
  /** Dijeron que no. Se distingue de expirada: una es respuesta y otra silencio */
  DECLINED: { label: 'No pueden', variant: 'outline' },
  CANCELLED: { label: 'Cancelada', variant: 'outline' },
}

/**
 * Lo que cambia la frase mientras el trabajo está en el aire: a quién se
 * espera. Eran dos estados del trabajo hasta el 21 Agosto 2026; ahora son de
 * la cita, y se pintan igual que entonces.
 */
const WAITING: Partial<Record<ApiAppointmentStatus, StatusLook>> = {
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
}

/**
 * Terminado no es un estado del servidor: es `IN_PROGRESS` con la hora de fin
 * puesta, esperando a que el cliente lo dé por bueno.
 *
 * Sin distinguirlo, la etiqueta decía "En curso" a un trabajo que el
 * profesional había cerrado hacía rato, y las dos partes se quedaban mirando
 * un rótulo que contradecía lo que acababan de hacer. El detalle ya lo
 * explicaba con palabras; lo que faltaba era que lo dijera la etiqueta, que es
 * lo único que se ve en una lista.
 *
 * Color de "hace falta algo de ti": es exactamente eso, y el reloj de 24 horas
 * ya está corriendo.
 */
const AWAITING_CONFIRMATION: StatusLook = {
  label: 'Falta darlo por bueno',
  variant: 'accent2',
}

export function jobStatusLook(
  status: ApiJobStatus,
  appointmentStatus: ApiAppointmentStatus | null = null,
  /** Cuándo dijo el profesional que había terminado, si lo dijo */
  workFinishedAt: string | null = null,
): StatusLook {
  if (status === 'PENDING_PRO' && appointmentStatus !== null) {
    return WAITING[appointmentStatus] ?? STATUS[status]
  }

  if (status === 'IN_PROGRESS' && workFinishedAt !== null) return AWAITING_CONFIRMATION

  return STATUS[status]
}

/**
 * De qué color va el **fondo** de la tarjeta de un trabajo.
 *
 * Es lo que convierte una lista de diez tarjetas iguales en algo que se lee de
 * un vistazo: sin esto hay que leer la etiqueta de cada una para saber cuál es
 * la de ahora. El color no dice nada nuevo —subraya la etiqueta que ya lleva
 * la tarjeta— y por eso vive aquí, al lado de `jobStatusLook`: si un estado
 * cambia de familia, cambia en un sitio.
 *
 * ## Por qué seis tonos, y no cuatro
 *
 * Hasta el 8 de septiembre de 2026 eran cuatro, y tres cuartas partes de los
 * estados caían en «ninguno» o en «hecho»: una lista de trabajos terminados
 * —que es como acaba siendo cualquier cuenta con unos meses— **era una pared
 * gris**, que es exactamente lo que Robin dijo al verla. Los estados que le
 * faltaban color no eran raros: publicado, esperando respuesta, cancelado,
 * caducado, en disputa.
 *
 * Sigue sin haber uno por estado —trece colores no son una señal, son un
 * arcoíris— pero sí uno por **cada cosa distinta que puede pasarte**:
 *
 * - `waiting`: te toca a ti. Naranja. Lo pinta también quien llama, porque
 *   depende de más cosas que el estado —una urgencia abierta espera a que
 *   elijas—.
 * - `open`: en el aire, esperando a otro. Azul claro.
 * - `contracted`: cerrado y por delante. Azul.
 * - `inProgress`: está pasando ahora mismo. Verde vivo.
 * - `completed`: hecho. Verde apagado —buena noticia, pero ya no pide nada—.
 * - `failed`: se torció. Rojo lavado: cancelado, rechazado, no pueden, en
 *   disputa.
 * - `expired`: se apagó solo, sin que nadie decidiera nada. Gris.
 */
export type JobTint =
  | 'open'
  | 'waiting'
  | 'contracted'
  | 'inProgress'
  | 'completed'
  | 'failed'
  | 'expired'

export function jobTint(status: ApiJobStatus): JobTint {
  switch (status) {
    case 'CONTRACTED':
      return 'contracted'
    case 'IN_PROGRESS':
      return 'inProgress'
    case 'COMPLETED':
      return 'completed'
    /* Con un presupuesto encima de la mesa, el siguiente paso es del cliente */
    case 'QUOTED':
      return 'waiting'
    case 'CANCELLED':
    case 'DECLINED':
    case 'QUOTE_REJECTED':
    case 'DISPUTED':
      return 'failed'
    /* Nadie dijo que no: se acabó el plazo, o se cerró sin trato */
    case 'EXPIRED':
    case 'CLOSED':
      return 'expired'
    /* Publicado, encargado y esperando respuesta, o todavía sin publicar */
    case 'DRAFT':
    case 'OPEN':
    case 'PENDING_PRO':
      return 'open'
  }
}

/**
 * El color de cada tono, en una sola tabla para las dos pantallas que lo
 * pintan: la lista del cliente (`JobCard`) y la agenda del profesional.
 *
 * Vive aquí y no en cada hoja de estilos porque son la misma señal: dos
 * tablas del mismo color acaban discrepando el día que se añade un estado, y
 * entonces el mismo trabajo es verde en una pantalla y gris en la otra.
 *
 * El contorno es el que separa los dos verdes y los dos azules: el fondo dice
 * la familia y la línea dice si eso está vivo. Lo terminado y lo caducado la
 * llevan apagada a propósito —tienen que pesar menos que lo que está por
 * hacer, o una lista de tres meses tapa lo de hoy—.
 */
export const JOB_TINT_COLORS: Record<
  JobTint,
  { backgroundColor: string; borderColor: string }
> = {
  open: { backgroundColor: theme.colors.accent100, borderColor: theme.colors.accent300 },
  waiting: { backgroundColor: theme.colors.pendingSoft, borderColor: theme.colors.pending },
  contracted: {
    backgroundColor: theme.colors.accent2200,
    borderColor: theme.colors.accent2400,
  },
  inProgress: {
    backgroundColor: theme.colors.availableSoft,
    borderColor: theme.colors.available,
  },
  completed: {
    backgroundColor: theme.colors.completedSoft,
    borderColor: theme.colors.completedBorder,
  },
  failed: {
    backgroundColor: theme.colors.urgencySoft,
    borderColor: theme.colors.urgencyBorder,
  },
  expired: { backgroundColor: theme.colors.neutral200, borderColor: theme.colors.neutral400 },
}

const TYPE_LABEL: Record<ApiJobType, string> = {
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

/**
 * En qué punto está un trabajo, resumido en una cadena que se puede guardar y
 * comparar. Es la firma con la que se sabe si algo **ha cambiado** desde la
 * última vez que el cliente lo miró (`useSeenJobStatesStore`).
 *
 * Son tres cosas y no una, porque el estado a secas se queda corto en el paso
 * que más importa: cuando el profesional dice que ha terminado, el trabajo
 * sigue `IN_PROGRESS` y lo único que se mueve es `workFinishedAt`. Igual con
 * la cita: que la empresa proponga a otra persona no cambia el estado del
 * trabajo y es justo lo que el cliente tiene que contestar.
 *
 * Lo que **no** entra: nada que escriba el propio cliente —el reparo, por
 * ejemplo—. Marcarle como novedad lo que acaba de hacer él es ruido.
 */
export function jobStateSignature(job: {
  status: ApiJobStatus
  appointmentStatus: ApiAppointmentStatus | null
  workFinishedAt: string | null
}): string {
  return [
    job.status,
    job.appointmentStatus ?? '-',
    job.workFinishedAt ? 'fin' : '-',
  ].join('|')
}
