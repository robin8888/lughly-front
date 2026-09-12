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
   * el cliente lo acepte o lo rechace. Real desde el 7 de septiembre de 2026,
   * cuando se construyó `Quote` (§C5).
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
  /**
   * Las tres fechas que cuentan la vida del trabajo, para la tarjeta de "Mis
   * trabajos".
   *
   * `startedAt` es cuándo el profesional pulsó Empezar, no cuándo estaba
   * citado, y sale de la cita: puede faltar en un trabajo ya terminado si es
   * de antes de que existiera ese botón.
   *
   * Se solapan menos de lo que parece: un trabajo cancelado a media faena
   * tiene `startedAt` **y** `cancelledAt`, y hacen falta las dos para contar
   * qué pasó.
   */
  startedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
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
  /**
   * Desde cuándo se puede pulsar «He llegado, empiezo»: diez minutos antes de
   * la hora acordada. El mismo dato que manda la agenda, porque el botón está
   * en las dos pantallas y no puede estar encendido en una y apagado en la
   * otra. `null` es "cuando quiera".
   */
  canStartAt: string | null
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
  /**
   * Cómo ha quedado, según quien lo ha hecho. Las sube al terminar y son
   * sobre las que el cliente da el visto bueno — que es lo que suelta el
   * dinero, así que no son una galería: son la prueba.
   */
  resultPhotos: { url: string; fullUrl: string }[]
  /**
   * Lo que la plataforma tiene retenido de este trabajo ahora mismo.
   *
   * **Decide si aquí se puede pedir revisión** (§C9): revisar es decidir qué
   * hacemos con lo que tenemos, y del ciclo del presupuesto no tenemos nada
   * desde el 12 de septiembre de 2026 —el arreglo se paga fuera de la app—.
   * Sirve para no enseñar un botón que el servidor va a rechazar.
   */
  retained: number
  /**
   * Por qué el cliente no lo da por bueno todavía, si ha dicho algo.
   *
   * Con esto puesto el cierre automático por silencio está apagado: quien ha
   * hablado no está callando, y el trabajo espera a que se arregle.
   */
  holdReason: string | null
  /**
   * Hasta cuándo tiene el profesional para contestar a ese reparo (§C9).
   * Pasado, el trabajo se va a revisión solo. **Lo dice el servidor**: dos
   * relojes distintos acabarían enseñando un plazo sobre algo que ya escaló.
   */
  holdAnswerByAt: string | null
  /** La revisión, si la hay. La ven los dos con lo mismo dentro */
  dispute: ApiJobDispute | null
  /** Y lo que ha aportado cada parte, en el orden en que llegó */
  evidence: ApiJobEvidence[]
  createdAt: string
  /**
   * Los servicios de la carta que se contrataron, copiados al pedirlo: si el
   * profesional cambia su carta después, esto sigue enseñando lo que se vio
   * y se pagó. Vacío en cualquier trabajo que no nació de la carta.
   */
  serviceLines: { name: string; price: number }[]
  /**
   * Los presupuestos del trabajo, del más nuevo al más viejo
   * (`CICLOS_DE_CONTRATACION.md` §C5).
   *
   * **Todos, no solo el vigente**, y los ven los dos lados: el rechazado lleva
   * el motivo, y ese motivo es la mitad de la conversación —sin él la v2
   * aparece de la nada—.
   *
   * Vacío en cualquier trabajo que no sea del ciclo de la visita: una reserva
   * por horas o una urgencia tienen el precio pactado antes de moverse.
   */
  quotes: ApiJobQuote[]
  /**
   * El trabajo que no empezó a su hora, mientras se decide qué hacer
   * (`CICLOS_DE_CONTRATACION.md` §A9).
   *
   * `null` es lo normal. Con algo dentro hay diez minutos y una decisión: o se
   * acuerda otra hora, o el trabajo se da por no realizado y se cae entero.
   */
  lateStart: ApiLateStart | null
  /**
   * La regla del contrato fijo, si lo es (`CICLOS_DE_CONTRATACION.md` §F).
   * `null` en un trabajo de una vez, que son casi todos.
   */
  recurrence: ApiJobRecurrence | null
  /**
   * Las sesiones que quedan por delante, de la primera a la última. Vacío en
   * cualquier trabajo que no sea fijo.
   *
   * Solo las que no han pasado: las de atrás están en la agenda y en los
   * pagos, y aquí lo que hace falta es lo que todavía se puede mover.
   */
  sessions: ApiJobSession[]
}

/**
 * El toque de «no ha empezado», con su reloj.
 *
 * `decideByAt` viene del servidor y no se calcula aquí aunque la suma sea de
 * una línea: la cuenta atrás de la pantalla y la del barrido tienen que ser la
 * misma, o se enseñaría "te quedan tres minutos" sobre un trabajo que el
 * servidor ya ha cerrado.
 */
export interface ApiLateStart {
  noticedAt: string
  decideByAt: string
  /** La hora propuesta, si alguien ha propuesto una */
  proposedAt: string | null
  /**
   * Si la propuesta es mía. Decide el botón: quien la hizo espera, y el otro
   * acepta.
   */
  proposedByMe: boolean
}

/** Qué días, a qué hora y hasta dónde llega un contrato fijo */
export interface ApiJobRecurrence {
  id: string
  /** 0 domingo … 6 sábado, como `Date.getDay()` */
  weekdays: number[]
  /** A qué hora empieza, en minutos desde medianoche */
  startMinute: number
  durationMin: number
  /** "AAAA-MM-DD" */
  startsOn: string
  /** Hasta qué día hay sesiones creadas. El barrido lo va estirando */
  generatedUntil: string
  /**
   * Si el contrato sigue vivo. Apagado es un contrato cortado —por quien sea,
   * o por tres impagos—: no va a haber más sesiones.
   */
  active: boolean
}

export interface ApiJobSession {
  id: string
  scheduledAt: string
  durationMin: number
  status: ApiAppointmentStatus
  /** Lo que cuesta, con el mínimo del contrato aplicado */
  amount: number | null
  /**
   * Si su importe ya está apartado en la tarjeta del cliente. Se retiene 24 h
   * antes, que es justo cuando cancelar deja de ser gratis.
   */
  held: boolean
  /**
   * Si cancelarla no cuesta nada.
   *
   * **Lo dice el servidor y no se calcula aquí** aunque la resta sea de una
   * línea: es la misma cuenta que decide el dinero, y dos relojes distintos
   * acabarían enseñando "gratis" y cobrando.
   */
  freeCancel: boolean
}

/** Cómo queda la hora después de proponer o aceptar */
export interface ApiRescheduleResult {
  jobId: string
  /** La que vale: la propuesta si se ha aceptado, la de siempre si no */
  scheduledAt: string
  /** La que espera un sí, cuando hay una */
  proposedAt: string | null
  /** Hasta cuándo hay para acordarla. `null` si ya está acordada */
  decideByAt: string | null
}

/** De qué es una línea. El tipo decide dinero, no es una etiqueta. */
export type ApiQuoteLineKind =
  /** Mano de obra: horas, desplazamientos, la faena */
  | 'LABOUR'
  /**
   * Piezas y materiales. **El único tipo que se puede cobrar por adelantado**
   * y el único que no se devuelve si el cliente cancela después de comprado.
   */
  | 'MATERIALS'
  /** Lo demás: residuos, alquiler de maquinaria, permisos */
  | 'OTHER'

export type ApiQuoteStatus =
  /** Emitido y esperando respuesta del cliente */
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  /** Se le pasó la validez sin respuesta */
  | 'EXPIRED'
  /** Llegó una versión posterior: deja de estar sobre la mesa, sin ser un "no" */
  | 'SUPERSEDED'

export interface ApiQuoteLine {
  kind: ApiQuoteLineKind
  concept: string
  /** Se guardan los tres: «3 × 12,50 €» se entiende, «37,50 €» hay que creérselo */
  quantity: number
  unitPrice: number
  amount: number
}

export interface ApiJobQuote {
  id: string
  /** v1, v2… Sube al reemitir después de un rechazo */
  version: number
  status: ApiQuoteStatus
  lines: ApiQuoteLine[]
  /** Suma de las líneas, antes de descontar la visita */
  linesTotal: number
  /**
   * Lo que se descuenta por la visita ya pagada. Cero si no hubo.
   * Congelado: es lo que el cliente pagó, no lo que el profesional cobra hoy.
   */
  visitCredit: number
  /** Lo que el cliente paga al aceptar */
  total: number
  validUntil: string
  /** Por qué dijo que no. Solo en los rechazados */
  rejectionReason: string | null
  rejectedAt: string | null
  acceptedAt: string | null
  createdAt: string
}

/** Cómo acabó una revisión: pagar, devolver o rebajar (§C9) */
export type ApiDisputeOutcome = 'TO_PRO' | 'TO_CLIENT' | 'SPLIT'

/**
 * Un trabajo en revisión, tal y como lo leen las dos partes (§C9).
 *
 * Con el plazo dentro, que es la mitad de lo que hace falta saber: lo que
 * tranquiliza a quien tiene el dinero parado no es que alguien lo esté mirando,
 * es cuándo termina.
 */
export interface ApiJobDispute {
  openedAt: string
  /** Hasta cuándo hay para resolverla */
  dueAt: string
  /** Si la abrió quien está mirando la ficha */
  openedByMe: boolean
  /** O la abrió el plazo, porque el reparo se quedó sin contestar */
  byDeadline: boolean
  reason: string
  resolvedAt: string | null
  outcome: ApiDisputeOutcome | null
  /** El motivo de la decisión, con las palabras de quien la tomó */
  decision: string | null
  /** Lo que se le devolvió al cliente */
  refunded: number | null
}

/**
 * Una prueba aportada en una revisión (§C9).
 *
 * Con **de qué lado viene y cuándo llegó**: es lo que la distingue de una foto
 * cualquiera, y la fecha es la del servidor —la del móvil la cambia su dueño en
 * dos toques—.
 */
export interface ApiJobEvidence {
  id: string
  /** La reducida, para la tira */
  url: string
  /** Y la original, para leer un ticket de cerca */
  fullUrl: string
  side: 'CLIENT' | 'PRO'
  note: string | null
  createdAt: string
}

export interface ApiAcceptedQuote {
  jobId: string
  quoteId: string
  /**
   * Lo acordado, con la visita ya descontada. **No es un cobro**: desde el 12
   * de septiembre de 2026 el arreglo se lo paga el cliente al profesional
   * directamente (§C6), y la app no lo retiene ni lo transfiere.
   */
  amount: number
}

/** Una línea tal y como se escribe en el formulario, sin importe todavía */
export interface QuoteLinePayload {
  kind: ApiQuoteLineKind
  concept: string
  quantity: number
  unitPrice: number
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
  /**
   * «No lo doy por bueno todavía, y esto es lo que falta.»
   *
   * Apaga el cierre por silencio —el que a las 24 horas cierra y paga— y le
   * manda el motivo al profesional, al móvil y a su agenda. No cierra ninguna
   * puerta: dar por bueno sigue disponible en todo momento.
   */
  hold: (jobId: string, reason: string) =>
    apiRequest<{
      jobId: string
      status: ApiJobStatus
      reason: string
      holdAt: string
    }>(`/v1/jobs/${jobId}/hold`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),

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
      /**
       * Cuántas sesiones de un contrato fijo se ha llevado por delante. Cero
       * en un trabajo de una vez.
       *
       * Se enseña: "se cancelan las 18 sesiones que quedaban" y "se cancela la
       * cita del jueves" son dos avisos distintos, y quien acaba de romper un
       * acuerdo de meses tiene derecho a ver el tamaño de lo que ha hecho.
       */
      cancelledSessions: number
    }>(`/v1/jobs/${jobId}/cancel-contract`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),

  /**
   * Proponer otra hora para un trabajo que no empezó a la suya (§A9).
   *
   * No mueve la cita: deja la hora encima de la mesa y avisa al otro, que es
   * quien tiene que aceptarla. Escribirla directamente sería moverle la mañana
   * a alguien sin su sí.
   */
  proposeTime: (jobId: string, scheduledAt: string) =>
    apiRequest<ApiRescheduleResult>(`/v1/jobs/${jobId}/reschedule`, {
      method: 'POST',
      auth: true,
      body: { scheduledAt },
    }),

  /** Y el otro dice que sí. **El otro**: quien la propuso no puede aceptarla */
  acceptTime: (jobId: string) =>
    apiRequest<ApiRescheduleResult>(`/v1/jobs/${jobId}/reschedule/accept`, {
      method: 'POST',
      auth: true,
    }),

  /**
   * Saltarse **una sesión** de un contrato fijo, sin romperlo (§F7).
   *
   * Distinta de `cancelContract` a propósito, y no un parámetro suyo: aquella
   * se lleva el acuerdo entero y sus dieciocho mañanas; esta, el miércoles que
   * viene. El motivo es opcional porque no hay nada que justificar: saltarse
   * un día es la vida normal de un acuerdo de meses.
   *
   * `fee` es lo que se cobra por avisar con menos de 24 horas —el mínimo del
   * contrato—, y viene a cero en el caso normal. `remaining` es lo que sigue
   * en pie, que es la mitad del mensaje que hay que enseñar: cancelar una
   * sesión no cancela el contrato.
   */
  cancelSession: (jobId: string, sessionId: string, reason?: string) =>
    apiRequest<{
      jobId: string
      sessionId: string
      fee: number
      refunded: number
      voided: number
      remaining: number
    }>(`/v1/jobs/${jobId}/sessions/${sessionId}/cancel`, {
      method: 'POST',
      auth: true,
      body: reason ? { reason } : {},
    }),

  /**
   * La valoración del trabajo, al darlo por bueno.
   *
   * Una nota de 1 a 5 y, si quiere, lo que tenga que contar. **Una por
   * trabajo**: el servidor la ata al trabajo con un índice único, que es lo que
   * separa una valoración de un comentario en internet.
   *
   * Devuelve la media del profesional ya recalculada.
   */
  /**
   * Emitir el presupuesto del trabajo (§C5). Lo llama el lado profesional.
   *
   * Cada emisión es una versión nueva y la anterior queda marcada: reemitir
   * después de un rechazo es el camino normal, no un caso raro.
   */
  createQuote: (
    jobId: string,
    payload: {
      lines: QuoteLinePayload[]
      /** Cuántos días vale. Sin poner, quince */
      validDays?: number
    },
  ) =>
    apiRequest<{
      quoteId: string
      jobId: string
      version: number
      total: number
      validUntil: string
    }>(`/v1/jobs/${jobId}/quotes`, { method: 'POST', auth: true, body: payload }),

  /**
   * Rechazarlo, con el motivo.
   *
   * **No cierra el trabajo**: queda esperando otra versión quince días. El
   * motivo se exige porque es lo único que le dice al profesional qué cambiar.
   */
  rejectQuote: (jobId: string, reason: string) =>
    apiRequest<{
      quoteId: string
      jobId: string
      status: ApiJobStatus
      reissueByAt: string
    }>(`/v1/jobs/${jobId}/quotes/reject`, {
      method: 'POST',
      auth: true,
      body: { reason },
    }),

  /**
   * Aceptar el presupuesto y poner el dinero (§C6).
   *
   * **El importe no viaja desde aquí**: se retiene `quote.total`, con la visita
   * ya descontada. Mandar la cifra sería dejar elegir cuánto se paga.
   */
  acceptQuote: (jobId: string) =>
    apiRequest<ApiAcceptedQuote>(`/v1/jobs/${jobId}/quotes/accept`, {
      method: 'POST',
      auth: true,
    }),

  /**
   * «He vuelto y ya está arreglado», del lado profesional (`CICLOS` §C9).
   *
   * Limpia el reparo y le devuelve al cliente sus 24 horas. No reabre la cita:
   * volver a arreglar algo mal hecho no es trabajo nuevo.
   */
  markFixed: (jobId: string) =>
    apiRequest<{ jobId: string; status: ApiJobStatus; confirmByAt: string }>(
      `/v1/jobs/${jobId}/fixed`,
      { method: 'POST', auth: true },
    ),

  /**
   * «Que lo revise alguien» (`CICLOS` §C9).
   *
   * De los dos lados, y solo con un reparo encima de la mesa. Lo que se decide
   * es qué pasa con el dinero retenido; no cierra la vía de consumo ni la
   * judicial.
   */
  openDispute: (jobId: string, reason: string) =>
    apiRequest<{ disputeId: string; jobId: string; status: ApiJobStatus; dueAt: string }>(
      `/v1/jobs/${jobId}/dispute`,
      { method: 'POST', auth: true, body: { reason } },
    ),

  review: (jobId: string, rating: number, comment: string | null) =>
    apiRequest<{
      reviewId: string
      rating: number
      proRating: number
      proReviewCount: number
    }>(`/v1/jobs/${jobId}/review`, {
      method: 'POST',
      auth: true,
      body: { rating, comment },
    }),
}
