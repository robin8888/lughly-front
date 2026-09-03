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
  /**
   * El hueco está apartado y todavía no lo ha aceptado nadie.
   *
   * Nace con una reserva por horas: el cliente eligió a quién, qué día y a qué
   * hora, y puso el dinero. Ocupa la agenda desde ese momento —si no, ese mismo
   * hueco se le seguiría ofreciendo a otros mientras él tiene el importe
   * retenido— pero **no espera respuesta de nadie a nivel de cita**: quien
   * tiene que contestar es quien recibió el encargo, y su plazo está en el
   * trabajo. Aceptar la confirma en su sitio, sin abrir otra.
   */
  | 'RESERVED'
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
  /**
   * Cuándo dijo el profesional que había terminado.
   *
   * Puesto con el trabajo todavía `IN_PROGRESS` significa **terminado y
   * esperando a que el cliente lo dé por bueno**, que no es "en curso": la
   * etiqueta de la tarjeta lo distingue con esto.
   */
  workFinishedAt: string | null
}

export interface CreateJobPayload {
  /**
   * Solo `URGENT`.
   *
   * `QUOTE` nunca estuvo: un presupuesto se pide a un profesional concreto
   * desde su ficha. Y `INSTANT` se retiró el 3 de septiembre de 2026, del
   * contrato y del servidor: publicar al aire creaba un trabajo sin precio y
   * sin nadie a quien pedírselo —la subasta que tenía que recogerlo no
   * existe—, y lo único que sabía hacer con él era llegar a `COMPLETED`
   * gratis. Volverá con la subasta y con su cobro puesto.
   */
  type: 'URGENT'
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
  /**
   * El cierre, en tres relojes.
   *
   * Con `workFinishedAt` puesto y el trabajo todavía `IN_PROGRESS`, el
   * profesional ha dicho que ha terminado y falta que el cliente lo dé por
   * bueno: es lo que enciende el botón de confirmar y el aviso de que, si no
   * hace nada, se dará por bueno el `confirmByAt`.
   */
  workFinishedAt: string | null
  confirmByAt: string | null
  completedAt: string | null
  /**
   * El reloj del trabajo, y lo pone el servidor.
   *
   * `startedAt` es cuándo el profesional pulsó Empezar y `workFinishedAt`
   * cuándo pulsó Terminar: entre los dos está el tiempo trabajado. Con el
   * primero puesto y el segundo a nulo, **el contador corre ahora mismo**.
   *
   * No se deduce aquí a propósito: dos relojes de pared no coinciden, y un
   * contador que a cada uno le diga una cosa es peor que no tenerlo.
   */
  startedAt: string | null
  /**
   * Cuándo el cliente reconoció el inicio. **No mueve el contador**: nulo con
   * el trabajo en curso solo significa que todavía no ha dicho nada, que es
   * lo normal mientras abre la puerta.
   */
  startApprovedAt: string | null
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

  /**
   * Pedirle la urgencia a uno concreto. Tiene cinco minutos para contestar.
   *
   * **Aquí se pone el dinero** (3 Septiembre 2026): se retiene la salida —una
   * hora al precio de urgencia que el cliente acaba de ver en la lista— y se
   * cobra cuando acepta. Si no contesta o dice que no, se suelta y no se le
   * cobra nada.
   *
   * Se retiene al pedirla y no al aceptarla porque es el único momento con el
   * cliente delante: a las tres de la madrugada el profesional acepta desde su
   * móvil, y si el banco pidiera autenticar la tarjeta no habría nadie a quien
   * pedírsela.
   */
  askUrgency: (jobId: string, proId: string, paymentMethodId: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      requestedProName: string
      /** €/h de urgencia, el que vio en la lista */
      urgencyRate: number | null
      /** La salida retenida: una hora a ese precio */
      amount: number
      respondByAt: string
    }>(`/v1/jobs/${jobId}/urgency-request`, {
      method: 'POST',
      auth: true,
      body: { proId, paymentMethodId },
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
   *
   * **Y con tarjeta** (3 Septiembre 2026). El precio de una visita es de quien
   * la hace, así que al cambiar de profesional se suelta lo retenido del
   * anterior y se retiene lo del nuevo. Sin esto, reasignar era la forma más
   * silenciosa de dejar de cobrar: el cobro del primero se anulaba al rechazar
   * y el segundo hacía el trabajo gratis.
   *
   * El servidor rechaza reasignar lo que se contrató por horas o de la carta:
   * las horas eran de aquel hueco y los servicios de aquella lista. La salida
   * es contratar al nuevo desde su ficha.
   */
  reassign: (jobId: string, proId: string, paymentMethodId: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      requestedProName: string
      respondedByName: string
      respondByAt: string
      /** Lo que se retiene ahora: la visita del nuevo, no la del que se cayó */
      amount: number
    }>(`/v1/jobs/${jobId}/reassign`, {
      method: 'POST',
      auth: true,
      body: { proId, paymentMethodId },
    }),

  /**
   * Dar por bueno un trabajo terminado: se cierra y lo que la plataforma tenía
   * retenido se transfiere al profesional. Si el cliente no hace nada, a las
   * 24 horas se da por bueno igual.
   *
   * `complete` y no `confirm` porque `assignmentsApi.confirm` ya es otra cosa:
   * allí un trabajador dice que puede con lo que le mandó su empresa.
   */
  /**
   * El cliente reconoce que el profesional ha llegado y ha empezado.
   *
   * No autoriza nada: el tiempo ya corre desde que él pulsó empezar. Sirve
   * para que le llegue que del otro lado se han enterado.
   */
  approveStart: (jobId: string) =>
    apiRequest<{ jobId: string; startedAt: string; startApprovedAt: string }>(
      `/v1/jobs/${jobId}/approve-start`,
      { method: 'POST', auth: true },
    ),

  complete: (jobId: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      completedAt: string
      /** Cuánto se le ha soltado al profesional, en euros */
      released: number
      /** Cobros que no han podido salir y quedan para el siguiente barrido */
      stuck: number
    }>(`/v1/jobs/${jobId}/complete`, { method: 'POST', auth: true }),

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
   * profesional, y deshace el dinero que hubiera puesto.
   *
   * **`refunded` y `voided` no son lo mismo y no se cuentan igual al
   * cliente.** `refunded` es dinero que se le cobró y vuelve, y tarda días en
   * aparecer en su banco; `voided` es una retención que se suelta, y ese cargo
   * nunca llegó a existir. Decirle "se te ha devuelto" de una retención le
   * manda a buscar al extracto algo que no va a encontrar.
   *
   * `releasedCharges` son los cobros ya transferidos al profesional, que no se
   * tocan: si viene con algo, ese dinero se resuelve con administración.
   */
  cancelContract: (jobId: string, reason: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      refunded: number
      voided: number
      releasedCharges: number
    }>(`/v1/jobs/${jobId}/cancel-contract`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),
}
