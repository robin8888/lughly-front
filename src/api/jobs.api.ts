/**
 * Trabajos publicados por el cliente.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts
 */

import { apiRequest } from './http'
import type { ApiUrgencyPro } from './urgencies.api'

export type ApiJobType = 'QUOTE' | 'INSTANT' | 'URGENT'

export type ApiJobStatus =
  | 'DRAFT'
  | 'OPEN'
  /**
   * Encargado a alguien concreto y en el aire. A quién se espera lo dice
   * `appointmentStatus`: a quien recibió el encargo si es null, al
   * trabajador si es `PENDING_WORKER`, al cliente si es `SUBSTITUTE_PROPOSED`.
   */
  | 'PENDING_PRO'
  /**
   * Adjudicado: hay alguien confirmado para ir. Se llamó `AWARDED` hasta el
   * 22 de Agosto de 2026.
   */
  | 'CONTRACTED'
  /**
   * Se contrató una visita y el profesional ya emitió presupuesto; falta que
   * el cliente lo acepte o lo rechace. Todavía no sale en ningún trabajo real
   * —hace falta `Quote`, que es de una fase posterior—, pero el tipo ya
   * contempla el valor para no tener que tocarlo dos veces.
   */
  | 'QUOTED'
  /** El cliente rechazó el presupuesto. Igual que `QUOTED`, inalcanzable hoy */
  | 'QUOTE_REJECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  /** Cerrado sin arreglo: el presupuesto venció sin aceptarse. Inalcanzable hoy */
  | 'CLOSED'
  /** El cliente abrió una disputa sobre un cobro. Inalcanzable hoy */
  | 'DISPUTED'
  | 'EXPIRED'
  /** El profesional ha dicho que no puede. No es lo mismo que expirar */
  | 'DECLINED'
  | 'CANCELLED'

/**
 * En qué punto está la cita de un trabajo: quién va y si lo ha dicho.
 * Contrato: lughly-backend/prisma/schema.prisma (`AppointmentStatus`)
 *
 * Hasta el 21 Agosto 2026 los dos primeros eran estados del propio trabajo.
 * Dejaron de serlo al separar la cita del contrato: un trabajo con visita y
 * después arreglo pasa dos veces por "falta que el trabajador confirme".
 */
export type ApiAppointmentStatus =
  /** La empresa ha mandado a uno de los suyos y falta que él confirme */
  | 'PENDING_WORKER'
  /** Va alguien distinto de quien pidió el cliente, y falta que lo acepte */
  | 'SUBSTITUTE_PROPOSED'
  | 'CONFIRMED'
  | 'STARTED'
  | 'DONE'
  | 'NO_SHOW_PRO'
  | 'NO_SHOW_CLIENT'
  | 'CANCELLED'

export interface ApiJob {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  /** La cita en juego, si la hay. Null mientras no haya nadie que vaya a ir */
  appointmentStatus: ApiAppointmentStatus | null
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  maxBudget: number | null
  preferredDate: string | null
  photoCount: number
  /**
   * A quién eligió el cliente en el directorio, si el encargo fue directo.
   * Null en lo publicado al aire.
   */
  requestedProName: string | null
  /**
   * Con quién está el trabajo: quien lo hace si ya está adjudicado, y si no, a
   * quien se le encargó. Null en lo publicado al aire, que todavía no es de
   * nadie.
   */
  /** Su id, para poder señalarlo en el directorio al buscar a otro */
  proId: string | null
  proName: string | null
  proAvatarUrl: string | null
  /** Quién propone mandar la empresa en su lugar, si lo ha propuesto */
  substituteProName: string | null
  /** Hasta cuándo tiene para responder quien recibió el encargo */
  respondByAt: string | null
  createdAt: string
}

export interface CreateJobPayload {
  /**
   * `QUOTE` no está: un presupuesto directo se pide a un profesional
   * concreto desde su ficha, no se publica al aire. Hoy solo `URGENT` llega
   * por aquí (`UrgencyPage`); `INSTANT` sigue en el contrato porque el
   * servidor lo admite, aunque la app no lo use desde que se retiró
   * `PublishPage` (22 Ago 2026).
   */
  type: 'INSTANT' | 'URGENT'
  tradeSlug: string
  title: string
  description: string
  city: string
  /**
   * Obligatorios en una urgencia y opcionales en el resto: solo se avisa a
   * quien cubre la dirección con su radio, así que sin punto no hay a quién
   * avisar.
   */
  /**
   * Obligatoria. No se enseña a nadie que no esté adjudicado: solo en la
   * agenda de quien va a hacer el trabajo.
   */
  addressLine: string
  latitude?: number
  longitude?: number
  maxBudget?: number
  preferredDate?: string
}

export interface MyJobsPage {
  items: ApiJob[]
  total: number
}


/** Quién hace el trabajo, cuando ya está decidido. */
export interface ApiAssignedPro {
  id: string
  /** La foto de quien va a ir, aunque se contratara a la empresa */
  avatarUrl: string | null
  /** A quién se contrató: la empresa, si la hay */
  name: string
  /** Quién va a ir, si es distinto de lo anterior */
  workerName: string | null
  rating: number
  reviewCount: number
  /** Solo lo ve el cliente, y solo cuando ya hay alguien asignado */
  phone: string | null
}

/**
 * La ficha completa de un trabajo.
 * Contrato: lughly-backend/src/modules/jobs/jobs.controller.ts (GET /v1/jobs/:id)
 *
 * Lo que llega depende de quién mira, y eso lo decide el servidor: el cliente
 * ve su dirección y su tope; quien va a hacerlo ve la dirección y el teléfono
 * del cliente pero no su tope. `viewer` dice desde qué lado se está mirando,
 * para no tener que deducirlo comparando identificadores.
 */
export interface ApiJobDetail {
  id: string
  type: ApiJobType
  status: ApiJobStatus
  /** La cita en juego, si la hay */
  appointmentStatus: ApiAppointmentStatus | null
  title: string
  description: string
  trade: string
  tradeLabel: string
  city: string
  viewer: 'client' | 'pro'
  /**
   * Por qué se canceló, si se canceló. `null` en todo lo demás, y también en
   * las que se cancelaron antes de que esto se guardara.
   *
   * `byMe` viene resuelto del servidor para no tener que comparar
   * identificadores aquí solo para decidir entre "lo cancelaste tú" y "lo
   * canceló el cliente".
   */
  cancellation: {
    reason: string | null
    at: string
    byMe: boolean
    side: 'client' | 'pro' | null
  } | null
  addressLine: string | null
  latitude: number | null
  longitude: number | null
  preferredDate: string | null
  /** Hasta cuándo hay para responder, si se espera a alguien */
  respondByAt: string | null
  maxBudget: number | null
  /** El precio acordado, cuando lo hay */
  amount: number | null
  assignedPro: ApiAssignedPro | null
  /** A quién propone la empresa, si se espera al cliente */
  substituteProName: string | null
  /**
   * Con quién se abriría el chat, si con alguien. `null` exactamente cuando
   * tampoco lo dejaría el servidor: sin nadie pedido ni adjudicado, no hay
   * hilo que abrir. A diferencia de `assignedPro`, existe desde que hay a
   * quien se le pidió, no solo tras confirmar — así se puede escribir antes
   * de que acepte.
   */
  chatWith: { id: string; name: string; avatarUrl: string | null } | null
  clientName: string | null
  clientPhone: string | null
  photoCount: number
  /** Las del cliente: `url` es la reducida y `fullUrl` la original */
  photos: { url: string; fullUrl: string }[]
  createdAt: string
  /**
   * Los servicios de la carta que se contrataron, copiados al pedirlo: si el
   * profesional cambia su carta después, esto sigue enseñando lo que se vio
   * y se pagó. Vacío en cualquier trabajo que no nació de la carta.
   */
  serviceLines: { name: string; price: number }[]
}

export const jobsApi = {
  create: (payload: CreateJobPayload) =>
    apiRequest<ApiJob>('/v1/jobs', { method: 'POST', auth: true, body: payload }),

  mine: () => apiRequest<MyJobsPage>('/v1/jobs', { auth: true }),

  /**
   * Quién puede atender una urgencia ahora mismo, con su tarifa y a qué
   * distancia. Vacío significa que no hay nadie de guardia cerca, y entonces
   * la pantalla propone buscar en el directorio a alguien que quizá pueda
   * ayudar igual.
   */
  urgencyPros: (trade: string, lat: number, lng: number) =>
    apiRequest<{ items: ApiUrgencyPro[] }>(
      `/v1/jobs/urgency-pros?trade=${encodeURIComponent(trade)}&lat=${lat}&lng=${lng}`,
      { auth: true },
    ),

  /** Pedirle la urgencia a uno concreto. Tiene cinco minutos para contestar */
  askUrgency: (jobId: string, proId: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      requestedProName: string
      respondByAt: string
    }>(`/v1/jobs/${jobId}/urgency-request`, {
      method: 'POST',
      auth: true,
      body: { proId },
    }),

  /** La ficha completa de un trabajo, para quien tiene algo que ver con él */
  detail: (jobId: string) =>
    apiRequest<ApiJobDetail>(`/v1/jobs/${jobId}`, { auth: true }),

  /**
   * Cancelar un trabajo propio. Solo mientras nadie ha movido nada: una vez
   * adjudicado hay alguien que ha reservado sus horas.
   */
  /**
   * Volver a encargar un trabajo que se quedó sin nadie. Es el mismo trabajo:
   * cambia a quién se le pide y se le reabre el plazo.
   */
  reassign: (jobId: string, proId: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      requestedProName: string
      respondedByName: string
      respondByAt: string
    }>(`/v1/jobs/${jobId}/reassign`, {
      method: 'POST',
      auth: true,
      body: { proId },
    }),

  cancel: (jobId: string) =>
    apiRequest<{ jobId: string; status: ApiJobStatus }>(
      `/v1/jobs/${jobId}/cancel`,
      { method: 'POST', auth: true },
    ),

  /**
   * Romper un trabajo **ya contratado**, desde cualquiera de los dos lados.
   *
   * Endpoint distinto de `cancel` y no un caso suyo: aquel es del cliente y
   * antes de que nadie mueva nada; este exige motivo, lo puede usar también el
   * profesional, y devuelve lo que la plataforma tuviera retenido.
   *
   * `releasedCharges` son los cobros ya transferidos al profesional, que no se
   * tocan: si viene con algo, ese dinero se resuelve con administración.
   */
  cancelContract: (jobId: string, reason: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      refunded: number
      releasedCharges: number
    }>(`/v1/jobs/${jobId}/cancel-contract`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),
}
