/**
 * Encargos a un profesional concreto y su reparto.
 * Contrato: lughly-backend/src/modules/jobs/assignments.controller.ts
 *
 * El cliente elige a una persona en el directorio, pero si trabaja para
 * alguien el encargo lo recibe su empresa: es quien contrata, presupuesta y
 * factura. El trabajador se entera cuando se lo asignan.
 */

import { apiRequest } from './http'
import type { ApiAppointmentStatus, ApiJobStatus, ApiJobType } from './jobs.api'
import type { ApiHoursQuote } from './pros.api'

export interface RequestProPayload {
  /**
   * Solo presupuesto. Tenía también `INSTANT`, y ese era un encargo sin precio
   * y sin cobro: el hueco que cierra la regla «no hay camino que no cobra».
   * Reservar a tarifa fija va por `bookHours` o `bookServices`, y una urgencia
   * no pasa por aquí.
   */
  type: 'QUOTE'
  tradeSlug: string
  title: string
  description: string
  city: string
  /**
   * Se guarda desde el principio pero solo la ve quien quede asignado: no
   * viaja en la bandeja ni la ve la empresa mientras decide a quién manda.
   */
  addressLine: string
  preferredDate?: string
  /** Tope orientativo del cliente, **no un precio pactado** */
  maxBudget?: number
  /**
   * La tarjeta guardada en la que se retiene la visita
   * (`paymentsApi.methods()`).
   *
   * Pedir presupuesto es contratar un desplazamiento: alguien va a ir a la
   * dirección del cliente a mirarlo, y eso se paga aunque el presupuesto no
   * convenza. Antes era gratis.
   */
  paymentMethodId: string
}

/** Cuerpo de POST /v1/pros/:id/book-services */
export interface BookServicesPayload {
  tradeSlug: string
  /** Puede ir vacío: contratar solo la visita es un contrato válido */
  serviceIds: string[]
  city: string
  addressLine: string
  preferredDate?: string
  /** La tarjeta guardada en la que se retiene, y con la que se cobrará (`paymentsApi.methods()`) */
  paymentMethodId: string
}

/** Lo que devuelve contratar la carta: ya cobrado, encargo enviado */
/** Un cobro tal y como lo cuenta el servidor */
export interface ApiChargeView {
  id: string
  kind: string
  amount: number
  commissionAmount: number
  status: string
}

export interface ApiBookedServices {
  jobId: string
  amount: number
  /**
   * `booked`: el importe está retenido y el encargo ya le ha llegado al
   * profesional. `requires_action`: **la tarjeta pide autenticación** (3D
   * Secure, que en España salta a menudo). En ese caso el encargo espera en
   * borrador sin que lo vea nadie, y hay que abrir el reto con `clientSecret`
   * y después llamar a `confirmPayment`. Lo hace `useBookServices`: la
   * pantalla no se entera de nada.
   */
  status: 'booked' | 'requires_action'
  charge: ApiChargeView | null
  /** Solo cuando hay que autenticarse */
  clientSecret: string | null
}

/**
 * Lo que hace falta para reservar por horas
 * (`CICLOS_DE_CONTRATACION.md` §A3).
 *
 * **El precio no viaja**: lo calcula el servidor con la misma cuenta que
 * devolvió el desglose (`prosApi.hoursQuote`). Mandarlo desde aquí sería
 * dejar que el cliente ponga el suyo.
 */
export interface BookHoursPayload {
  tradeSlug: string
  /** El hueco elegido, ISO. Se vuelve a comprobar al reservar. */
  startAt: string
  durationMin: number
  city: string
  addressLine: string
  /** Lo que hay que hacer, con sus palabras. Opcional. */
  note?: string
  /** La tarjeta guardada en la que se retiene (`paymentsApi.methods()`) */
  paymentMethodId: string
}

/**
 * Lo que devuelve reservar por horas.
 *
 * Es lo mismo que la carta más el desglose que se ha cobrado, para poder
 * enseñarlo tal cual en la confirmación sin volver a pedirlo.
 *
 * Y una diferencia que importa con `requires_action`: aquí **el hueco ya está
 * apartado** mientras el cliente se autentica. Si abandona el reto, el barrido
 * de plazos suelta el intento y libera la hora media hora después.
 */
export interface ApiBookedHours extends ApiBookedServices {
  price: ApiHoursQuote
}

export interface ApiDirectRequest {
  id: string
  status: string
  type: string
  title: string
  trade: string
  tradeLabel: string
  /** A quién eligió el cliente */
  requestedProName: string
  /**
   * Quién va a contestar: la empresa si trabaja para alguien. Se enseña al
   * cliente para que no le extrañe recibir respuesta a nombre de otro.
   */
  respondedByName: string
  /** Vacío mientras la tarjeta no haya contestado: el reloj no ha empezado */
  respondByAt: string
  createdAt: string
  /** Lo que cuesta la visita, retenido al pedirla */
  amount: number
  /**
   * `sent`: la visita está retenida y el encargo ya le ha llegado.
   * `requires_action`: **la tarjeta pide autenticación** (3D Secure, que en
   * España salta a menudo). El encargo espera en borrador sin que lo vea nadie,
   * y hay que abrir el reto con `clientSecret` y después llamar a
   * `confirmPayment`. Lo hace `useRequestPro`, igual que `useBookServices`.
   */
  outcome: 'sent' | 'requires_action'
  charge: ApiChargeView | null
  clientSecret: string | null
}

/** Un encargo pendiente de responder, en la bandeja de quien lo recibió. */
export interface ApiInboxItem {
  id: string
  type: string
  /** Siempre en el aire: es lo único que hay en la bandeja */
  status: 'PENDING_PRO'
  /**
   * Qué hay que decidir con este encargo:
   *
   * - `null`: te han elegido y hay que decir quién lo hace. Lo ve un autónomo
   *   con lo suyo y una empresa con lo de su gente.
   * - `RESERVED`: lo mismo, **pero con hora ya elegida y pagada**. Es una
   *   reserva por horas: el hueco está apartado en tu agenda y sigue
   *   esperando tu sí. Se responde igual que un `null`.
   * - `SUBSTITUTE_PROPOSED`: ya se propuso a otro y se espera al cliente.
   * - `PENDING_WORKER`: tu empresa te lo ha asignado y **tienes que
   *   confirmarlo**. Es lo único que ve aquí un trabajador por cuenta ajena.
   */
  appointmentStatus: Extract<
    ApiAppointmentStatus,
    'RESERVED' | 'PENDING_WORKER' | 'SUBSTITUTE_PROPOSED'
  > | null
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  maxBudget: number | null
  preferredDate: string | null
  respondByAt: string | null
  /** A quién eligió el cliente */
  requestedProId: string
  requestedProName: string
  /** A quién se ha propuesto en su lugar, si ya se propuso */
  substituteProName: string | null
  photoCount: number
  /**
   * Las fotos que adjuntó el cliente. `url` es la reducida —para la tira— y
   * `fullUrl` la original, igual que en la agenda.
   *
   * Se enseñan **antes de responder**, y ese es el motivo de que estén: quien
   * tiene que decir sí o no a una avería necesita verla. Hasta ahora solo
   * viajaba el recuento, que no ayuda a decidir nada.
   */
  photos: { url: string; fullUrl: string }[]
  createdAt: string
  /**
   * Si quien mira puede quedarse este trabajo.
   *
   * Lo decide el servidor: al asignar exige que el elegido tenga ese oficio
   * dado de alta, y da igual que el elegido sea uno mismo. Antes no venía, así
   * que aquí se ofrecía "Yo mismo" siempre y el error llegaba tras pulsar.
   */
  canAssignToSelf: boolean
}

/** Lo que devuelve confirmar o rechazar un trabajo asignado */
export interface ApiConfirmation {
  jobId: string
  status: string
  /** Si al rechazarlo vuelve a su empresa */
  backToEmployer: boolean
}

export interface ApiAssignment {
  jobId: string
  status: string
  /** En qué punto queda la cita que se acaba de abrir */
  appointmentStatus: ApiAppointmentStatus
  /** Quién lo hará, si ya está decidido */
  assignedProName: string | null
  /** Si falta que el cliente acepte el cambio */
  awaitingClient: boolean
}

/** Lo que devuelve empezar un trabajo contratado */
export interface ApiStartedJob {
  jobId: string
  status: ApiJobStatus
  startedAt: string
}

/**
 * Lo que devuelve terminarlo.
 *
 * `status` sigue siendo `IN_PROGRESS` a propósito: terminar no cierra el
 * trabajo ni cobra. Abre el plazo que tiene el cliente para decir que no fue
 * así, y hasta que ese plazo vence —o el cliente confirma— el dinero sigue
 * retenido en la plataforma.
 */
export interface ApiFinishedJob {
  jobId: string
  status: ApiJobStatus
  finishedAt: string
  /** Hasta cuándo puede el cliente decir que no fue así */
  confirmByAt: string
}

export interface ApiSubstituteDecision {
  jobId: string
  status: string
  assignedProName: string | null
}

/**
 * Un trabajo que este profesional tiene asignado.
 *
 * Lleva dirección y teléfono: a estas alturas el trabajo es suyo y sin eso no
 * puede ir. `amount` es null para un trabajador por cuenta ajena, porque el
 * importe es de la empresa que le dio de alta.
 */
export interface ApiAssignedJob {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  /**
   * En qué punto está la cita, y cuándo se dio por terminado el trabajo.
   *
   * Es lo que decide qué botón sale en la agenda: `CONFIRMED` toca empezar,
   * `STARTED` toca terminar, y con `workFinishedAt` puesto no toca nada — se
   * está esperando a que el cliente lo dé por bueno.
   */
  appointmentStatus: ApiAppointmentStatus | null
  workFinishedAt: string | null
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  preferredDate: string | null
  clientName: string
  clientPhone: string | null
  amount: number | null
  photoCount: number
  awardedAt: string | null
  createdAt: string
  /**
   * Las fotos que puso el cliente. `url` es la reducida —para la tira— y
   * `fullUrl` la original, para abrirla y mirar el detalle.
   */
  photos: { url: string; fullUrl: string }[]
}

export const assignmentsApi = {
  /** Su agenda: lo que tiene adjudicado y por delante */
  assignments: () =>
    apiRequest<{ items: ApiAssignedJob[] }>('/v1/pro/assignments', { auth: true }),

  /**
   * El cliente le pide presupuesto a alguien concreto del directorio, que es
   * **contratarle una visita**: se retiene lo que cobra por presentarse y se le
   * paga cuando acepta. Si rechaza o se le pasa el plazo, la retención se
   * suelta y el cliente nunca ve un cargo.
   */
  request: (proId: string, payload: RequestProPayload) =>
    apiRequest<ApiDirectRequest>(`/v1/pros/${proId}/requests`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /**
   * Contratar la carta. **Retiene, no cobra**: el importe se aparta en la
   * tarjeta guardada y solo se cobra cuando el profesional acepta. Si rechaza
   * o se le pasa el plazo, la retención se suelta y el cliente nunca ve un
   * cargo — que es además lo que evita perder la comisión de Stripe de un
   * cobro que habría que devolver.
   */
  bookServices: (proId: string, payload: BookServicesPayload) =>
    apiRequest<ApiBookedServices>(`/v1/pros/${proId}/book-services`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /**
   * Contratar por horas. **Retiene, no cobra**, igual que la carta — y además
   * aparta el hueco: desde que se pulsa, esa hora deja de ofrecérsele a nadie
   * más, aunque el profesional tarde 24 horas en contestar.
   *
   * Un 409 puede ser dos cosas: que ese oficio suyo no se cobre por horas, o
   * que el hueco acabe de ocuparse entre verlo y pagarlo. En el segundo caso
   * no se ha cobrado nada y basta con elegir otro.
   */
  bookHours: (proId: string, payload: BookHoursPayload) =>
    apiRequest<ApiBookedHours>(`/v1/pros/${proId}/book-hours`, {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  /**
   * El segundo tiempo de contratar, cuando la tarjeta pidió autenticación.
   *
   * Se llama después de resolver el reto con `handleNextAction`. El servidor
   * no se cree lo que diga el móvil: le pregunta a Stripe cómo acabó, y solo
   * entonces manda el encargo al profesional.
   */
  confirmPayment: (jobId: string) =>
    apiRequest<ApiBookedServices>(`/v1/jobs/${jobId}/confirm-payment`, {
      method: 'POST',
      auth: true,
    }),

  /** Lo que tengo pendiente de responder: lo mío, o lo de toda mi gente */
  inbox: () =>
    apiRequest<{ items: ApiInboxItem[] }>('/v1/pro/inbox', { auth: true }),

  /** Quién hará el trabajo. Si no es a quien pidió el cliente, él decide */
  assign: (jobId: string, proId: string) =>
    apiRequest<ApiAssignment>(`/v1/jobs/${jobId}/assign`, {
      method: 'POST',
      auth: true,
      body: { proId },
    }),

  /**
   * El trabajador dice si puede con lo que le han asignado.
   *
   * Al rechazar hace falta el motivo, y ese motivo es para su empresa: es
   * quien tiene que mandar a otro. Al cliente no se le enseña.
   */
  confirm: (jobId: string, accept: boolean, reason?: string) =>
    apiRequest<ApiConfirmation>(`/v1/jobs/${jobId}/confirm`, {
      method: 'POST',
      auth: true,
      body: { accept, ...(reason ? { reason } : {}) },
    }),

  /**
   * Decir que no se puede con un encargo, antes de que caduque.
   *
   * El motivo es obligatorio pero **al cliente no se le enseña**: sin jefe a
   * quien contárselo, el único destinatario sería un desconocido. Se guarda
   * para nosotros.
   */
  decline: (jobId: string, reason: string) =>
    apiRequest<{ jobId: string; status: string }>(`/v1/jobs/${jobId}/decline`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),

  /**
   * Los dos pasos del día del trabajo, para quien va a hacerlo o para la
   * empresa que responde por él.
   *
   * Las urgencias tienen los suyos en `urgenciesApi`: allí terminar cierra el
   * trabajo y libera al profesional, aquí abre el plazo del cliente y acaba
   * en una transferencia.
   */
  start: (jobId: string) =>
    apiRequest<ApiStartedJob>(`/v1/jobs/${jobId}/start`, {
      method: 'POST',
      auth: true,
    }),

  finish: (jobId: string) =>
    apiRequest<ApiFinishedJob>(`/v1/jobs/${jobId}/finish`, {
      method: 'POST',
      auth: true,
    }),

  /** La respuesta del cliente al cambio de persona */
  respondSubstitute: (jobId: string, accept: boolean) =>
    apiRequest<ApiSubstituteDecision>(`/v1/jobs/${jobId}/substitute`, {
      method: 'POST',
      auth: true,
      body: { accept },
    }),
}
