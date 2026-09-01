/**
 * Directorio de profesionales (GET /v1/pros).
 * Contrato: lughly-backend/src/modules/pros/pros.controller.ts
 */

import { apiRequest } from './http'

/** Un servicio de la carta, a precio fijo. */
export interface ApiServiceItem {
  id: string
  name: string
  price: number
}

/** Un oficio del profesional, con lo que cobra por él. */
export interface ApiProTrade {
  slug: string
  label: string
  /**
   * `null` si cobra por visita en vez de por hora — ver `visitFee` más
   * abajo. Son dos modos de cobrar el mismo oficio, no dos datos
   * independientes: exactamente uno de los dos está puesto.
   */
  hourlyRate: number | null
  /**
   * Cuántas horas hay que contratarle como mínimo en este oficio.
   *
   * `null` es **sin mínimo**: se le contrata por lo que se pida. Va junto a la
   * tarifa en la tarjeta —«14 €/h · mín. 2 h»— porque es parte del precio: sin
   * enseñarlo, quien pide una hora descubre el suelo al ver el total.
   *
   * Solo lo tienen los oficios por hora; en los de visita el suelo es la
   * propia visita.
   */
  minHours?: number | null
  /**
   * Lo que cobra por una urgencia de este oficio.
   *
   * `null` **significa que no atiende urgencias de este oficio**, no que falte
   * el dato: alguien puede querer salir corriendo por una fuga y no por un
   * mueble. Es lo que decide si sale en la lista que ve el cliente con una
   * avería.
   */
  urgencyHourlyRate?: number | null
  /**
   * Qué hace en este oficio, con sus palabras.
   *
   * `null` significa que no lo ha escrito, y entonces se enseña la descripción
   * general de su perfil. El servidor ya hace esa sustitución para la ficha
   * del directorio: lo que llega en `bio` es la del oficio de la tarjeta si la
   * hay, y la general si no.
   */
  description?: string | null
  /**
   * Lo que cobra por presentarse en este oficio, alternativa a `hourlyRate`
   * — no todos los oficios la usan, limpieza, clases o cuidado siguen
   * siendo por horas. Con esta puesta, la ficha enseña el selector de la
   * carta (servicios a precio fijo, además de la visita).
   */
  visitFee?: number | null
  /** Solo viene relleno en la ficha completa, no en el listado del directorio */
  services?: ApiServiceItem[]
}

export interface ApiPro {
  id: string
  name: string
  avatarUrl: string | null
  trade: string
  tradeLabel: string
  city: string
  /**
   * El precio del oficio al que responde esta tarjeta —el buscado si se
   * filtró, y si no el principal—, no una media de todos los suyos. `null`
   * si ese oficio cobra por visita — ver `visitFee`.
   */
  hourlyRate: number | null
  /** Lo que cobra por presentarse en el oficio de la tarjeta, si cobra por visita */
  visitFee: number | null
  /** Todos los que ejerce, en su orden, para las etiquetas de la tarjeta */
  trades: ApiProTrade[]
  /**
   * Fotos de trabajos hechos, hasta cinco. En oficios dicen más que cualquier
   * descripción, así que van en la tarjeta y no solo en la ficha.
   *
   * Son las **del oficio del que habla la tarjeta**, que las elige el
   * servidor: quien ejerce dos no enseña fotos de muebles en limpieza.
   */
  photos: string[]
  rating: number
  reviewCount: number
  completedJobs: number
  availableNow: boolean
  /** Identidad verificada por backoffice */
  verified: boolean
  bio: string | null
  /** Kilómetros desde el punto enviado; null si no se envió ubicación */
  distanceKm: number | null
  /**
   * **El punto base ya no viaja** (20 Agosto 2026). Lo mandaba el servidor
   * para pintar el mapa del directorio, y eso era decirle a cualquiera dónde
   * encontrar a una persona. Queda `distanceKm`, que es lo que el cliente
   * necesita y no lleva a nadie a ninguna puerta.
   */
  /**
   * Para quién trabaja. Encabeza la tarjeta: es a quien se contrata, quien
   * pone el precio y quien factura. Null si trabaja por su cuenta.
   */
  employerName: string | null
}

/**
 * Ficha completa (GET /v1/pros/:id).
 *
 * Superconjunto de `ApiPro` salvo `distanceKm`, que solo tiene sentido en el
 * listado: depende del punto desde el que se busca, no del profesional.
 */
/** Una foto propia, tal y como llega para gestionarla. */
export interface ApiMyProPhoto extends ApiProPhoto {
  id: string
  position: number
}

/** Una foto de la ficha, con el oficio del que es. */
export interface ApiProPhoto {
  /**
   * La **reducida**, que es la que hay que pintar.
   *
   * El servidor manda aquí la miniatura a propósito. Antes venía el original
   * —1400 px, medio mega— y con varias fichas en pantalla el teléfono no
   * conseguía decodificarlas: una imagen ocupa ancho × alto × 4 bytes en
   * memoria pese lo que pese comprimida, así que eran casi 8 MB por foto y no
   * se veía ninguna. Comprobado en el móvil: con una ficha con fotos se veían;
   * con dos o más, ninguna.
   */
  url: string
  /** El original. Solo para una vista a pantalla completa, cuando la haya. */
  fullUrl: string
  tradeSlug: string
  tradeLabel: string
}

export interface ApiProDetail extends Omit<ApiPro, 'distanceKm' | 'photos'> {
  /**
   * Todas sus fotos, cada una con su oficio y en el orden de sus oficios: la
   * ficha las agrupa, al contrario que la tarjeta, que solo enseña las del
   * oficio buscado. Aquí interesa ver todo lo que hace.
   */
  photos: ApiProPhoto[]
  /** Habilitación profesional comprobada (obligatoria en oficios regulados) */
  licenseVerified: boolean
  /** Kilómetros que se desplaza desde su base */
  radiusKm: number
  /** Alta en la plataforma, en ISO */
  memberSince: string
  /**
   * Su horario ordinario de trabajo, ordenado por día.
   *
   * Vacío significa que **no lo ha puesto**, no que no trabaje nunca: enseñar
   * "cerrado" siete veces a quien simplemente no lo ha rellenado le costaría
   * trabajos. La ficha esconde la sección entera en ese caso.
   */
  availability: ApiAvailabilityWindow[]
  /**
   * Último día que está fuera, "AAAA-MM-DD", o `null` si está.
   *
   * Va con el horario porque sin esto el horario miente: sigue diciendo "lunes
   * de 9 a 14" el lunes que está de vacaciones.
   */
  absentUntil: string | null
}

export interface ProsPage {
  items: ApiPro[]
  total: number
}

/**
 * Los ocho criterios de una valoración, de 1 a 5.
 * Las claves coinciden con las columnas del backend y con `REVIEW_CRITERIA`.
 */
export interface ApiReviewCriteria {
  speed: number
  knowledge: number
  performance: number
  finish: number
  cleanliness: number
  punctuality: number
  treatment: number
  budgetFit: number
}

export interface ApiReview {
  id: string
  /** Firma congelada al valorar ("Miguel A."); sobrevive a la baja del autor */
  authorLabel: string
  /** Media de los ocho criterios */
  average: number
  criteria: ApiReviewCriteria
  comment: string | null
  recommends: boolean
  /** Respuesta pública del profesional */
  proResponse: string | null
  createdAt: string
}

export interface ProReviewsPage {
  items: ApiReview[]
  total: number
  /** Media por criterio sobre TODAS sus reseñas, no solo las de esta página */
  criteriaAverages: ApiReviewCriteria | null
  /** Porcentaje de clientes que lo recomiendan (0-100); null si no hay reseñas */
  recommendRate: number | null
}

export interface ProReviewsFilters {
  limit?: number
  offset?: number
}

/** Respuesta de GET /v1/pros/coverage */
export interface ApiCoverage {
  /** Cuántos profesionales recibirían el aviso ahora mismo */
  available: number
  /** Del oficio y dentro del radio, pero no disponibles en este momento */
  offline: number
  /** Distancia al más cercano de los disponibles, en km */
  nearestKm: number | null
}

/** Respuesta de PATCH /v1/pro/available-now */
export interface AvailabilityState {
  availableNow: boolean
  /** Radio en km dentro del que le llegan las urgencias */
  radiusKm: number
  city: string
}

export interface ProsFilters {
  trade?: string
  availableNow?: boolean
  minRating?: number
  lat?: number
  lng?: number
  /**
   * Con `lat`/`lng`, deja solo a quien **llega hasta ese punto**: cada
   * profesional declara su radio de cobertura y se compara contra él, así que
   * no es "los que están a menos de X km".
   *
   * Sin el punto no hace nada. Va aparte de mandarlo porque son dos preguntas
   * distintas: el directorio manda el punto para poner delante a los de al
   * lado sin esconder a nadie, y la home lo manda para poder decir cuántos
   * hay cerca sin mentir.
   */
  nearby?: boolean
  city?: string
  limit?: number
  offset?: number
}

/**
 * Los filtros como cadena de consulta, saltándose lo que no se ha puesto.
 *
 * Acepta cualquier objeto plano y no una unión de tipos concretos a propósito:
 * cada endpoint del directorio tiene los suyos —filtros, huecos, precio— y
 * enumerarlos aquí obligaría a tocar esta línea cada vez que aparece uno,
 * sin ganar nada: lo que valida los nombres es el esquema del servidor.
 */
function toQueryString<T extends object>(filters: T): string {
  const params = new URLSearchParams()

  /*
    El `as` es por las interfaces: TypeScript no les da firma de índice, así
    que no encajan en un `Record` aunque sus valores sean exactamente eso.
  */
  for (const [key, value] of Object.entries(filters as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

/**
 * Respuesta de PUT /v1/pro/trades. Por hora o por visita, nunca los dos:
 * exactamente uno de `hourlyRate`/`visitFee` va puesto en cada oficio.
 */
export interface SetTradesPayload {
  trades: {
    slug: string
    hourlyRate?: number | null
    visitFee?: number | null
    /** Vacío o ausente = sin mínimo. Solo con `hourlyRate` puesto. */
    minHours?: number | null
    urgencyHourlyRate?: number | null
    /** Qué hace en ese oficio. Vacío = se enseña la general del perfil */
    description?: string | null
  }[]
}

/** Respuesta de GET/PUT /v1/pro/trades/:tradeSlug/carta */
export interface ApiCarta {
  tradeSlug: string
  /** La tarifa de visita del oficio, informativa: se pone en `setMyTrades`, no aquí */
  visitFee: number | null
  services: ApiServiceItem[]
}

/**
 * Cuerpo de PUT /v1/pro/trades/:tradeSlug/carta. Solo los servicios: la
 * tarifa de visita se guarda con "Mis oficios y tarifas" (`setMyTrades`).
 */
export interface SetCartaPayload {
  services: { name: string; price: number }[]
}

/**
 * Una franja del horario ordinario de trabajo.
 *
 * No lleva precio, y esa es la diferencia con `ApiUrgencyWindow`: lo que cobra
 * por su trabajo normal está en sus oficios, y una franja de urgencia sí lleva
 * el suyo porque es un precio distinto para esa hora concreta.
 *
 * Las horas son locales españolas, "HH:MM". "De nueve a seis" son las nueve
 * del reloj de la pared, en verano y en invierno.
 */
export interface ApiAvailabilityWindow {
  /** 0 domingo … 6 sábado, como `Date.getDay()` */
  weekday: number
  from: string
  to: string
}

/**
 * Una franja de un día del calendario, ya resuelta por el servidor.
 *
 * `endsNextDay` no es un adorno: sin él "de 22:00 a 06:00" se leería como un
 * turno hacia atrás, y "de 22:00 a 00:00" no diría si esa medianoche cierra el
 * día o lo abre.
 */
export interface ApiCalendarWindow {
  from: string
  to: string
  endsNextDay: boolean
}

/** Un rato ya comprometido en un trabajo: es lo que se pinta en color */
export interface ApiCalendarCommitment extends ApiCalendarWindow {
  appointmentId: string
  jobId: string
  title: string
  status: string
}

/**
 * De dónde salen las horas de un día.
 *
 * - `weekly`: del horario semanal, como todos los martes.
 * - `day`: de algo puesto a ese día concreto.
 * - `closed`: de algo puesto a ese día que dice que no se trabaja. **No es lo
 *   mismo que `weekly` sin franjas**: aquel es "los domingos no trabajo", este
 *   es "este domingo concreto, no", y solo el segundo se puede deshacer.
 */
export type ApiCalendarDaySource = 'weekly' | 'day' | 'closed'

export interface ApiCalendarDay {
  /** "AAAA-MM-DD" */
  date: string
  /** 0 domingo … 6 sábado */
  weekday: number
  windows: ApiCalendarWindow[]
  source: ApiCalendarDaySource
  /** Vacaciones o baja: manda sobre las horas, que siguen llegando igual */
  away: boolean
  /** El nombre del festivo, o null */
  holiday: string | null
  commitments: ApiCalendarCommitment[]
}

/**
 * Un mes del horario, día a día.
 *
 * Lo resuelve el servidor entero —horario semanal, excepciones, ausencias,
 * festivos y citas— y no el móvil: es la misma regla que decide qué huecos se
 * pueden reservar, y calcularla dos veces acabaría con un calendario que dice
 * una cosa y una reserva que hace otra. Además `Intl` va incompleto en Hermes,
 * así que el día español se decide allí.
 */
export interface ApiAvailabilityCalendar {
  /** "AAAA-MM" */
  month: string
  /** Hoy en España, "AAAA-MM-DD" */
  today: string
  /** Si lo pone su empresa: se mira, no se toca */
  setByEmployer: boolean
  weekly: ApiAvailabilityWindow[]
  days: ApiCalendarDay[]
}

/** Las horas de un día suelto, tal y como se mandan */
export interface ApiDayWindow {
  from: string
  to: string
}

/**
 * Dónde trabaja el profesional. `latitude` y `longitude` en null significan que
 * todavía no ha fijado su base: sin ella su ficha no enseña mapa, y las
 * urgencias no se le filtran por distancia.
 */
export interface ApiCoverageSettings {
  latitude: number | null
  longitude: number | null
  radiusKm: number
  city: string
  /** El de la base. De sus dos primeras cifras sale la comunidad */
  postcode: string | null
  /**
   * La comunidad autónoma que se deduce del código postal, en ISO ("ES-MD").
   * Es la del calendario de festivos que se le aplica: cambiar la base a otra
   * comunidad le cambia los festivos, y eso hay que poder decírselo.
   */
  region: string | null
  regionName: string | null
}


/**
 * Los recargos horarios de un profesional, en porcentaje sobre su tarifa.
 * **No se acumulan: se aplica el más alto.**
 *
 * `legal` es lo que dice la ley, y viene del servidor a propósito para que no
 * haya dos copias de los mismos números: el nocturno lo obliga el art. 36.2
 * del Estatuto sin decir cuánto —de ahí que se ofrezca el 25% de los
 * convenios—, el de domingos y festivos es el +75% mínimo del art. 47 del RD
 * 2001/1983, y el del sábado es `null` porque no lo manda ninguna ley.
 *
 * Y una distinción que la pantalla no puede perder: esto es lo que se le cobra
 * al cliente. Lo que una empresa le debe a su trabajador por ese mismo día va
 * por nómina y no se decide aquí.
 */
export interface ApiSurcharges {
  saturday: number
  sunday: number
  night: number
  legal: { saturday: number | null; sunday: number; night: number }
  /** Si se los pone su empresa: entonces la pantalla se lee, no se edita */
  setByEmployer: boolean
}

/** Un festivo del calendario de su comunidad, y qué hace ese día. */
export interface ApiHoliday {
  /** "AAAA-MM-DD" */
  date: string
  name: string
  /**
   * De dónde viene la fiesta: del Estado, de su comunidad, o `local` si la ha
   * puesto él —los dos días de su municipio, que el BOE no publica—.
   */
  kind: 'national' | 'national-kept' | 'regional' | 'local'
  /** Si tiene horario ese día de la semana */
  worksThatDay: boolean
  /** Si ese día cae dentro de una ausencia suya */
  away: boolean
  appliesSurcharge: boolean
  /** Si lo decidió a mano para ese día, en vez de heredarlo */
  chosen: boolean
  percent: number
}

export interface ApiHolidayCalendar {
  year: number
  /** Null si todavía no tiene base: sin ella no se sabe qué calendario le toca */
  region: string | null
  regionName: string | null
  /**
   * Si el servidor tiene el calendario de ese año. **No es lo mismo que la
   * lista vacía**: una comunidad siempre tiene festivos, así que `known` en
   * false significa que el BOE todavía no lo ha publicado —pasa cada año hasta
   * octubre— y hay que decirlo con otras palabras.
   */
  known: boolean
  setByEmployer: boolean
  holidays: ApiHoliday[]
}

/** En qué estado está cada cosa que se le pide a un profesional. */
export type ApiChecklistState = 'MISSING' | 'PENDING' | 'DONE'

export interface ApiProfileChecklist {
  trades: ApiChecklistState
  /** Lo que cuenta de su trabajo con sus palabras: sale en su tarjeta */
  bio: ApiChecklistState
  photos: ApiChecklistState
  schedule: ApiChecklistState
  coverage: ApiChecklistState
  /** `PENDING` = subidos y esperando a que alguien los revise */
  identityDocuments: ApiChecklistState
}

/**
 * Unos días fuera: vacaciones, una baja, un viaje.
 *
 * Los dos extremos entran: "del 1 al 15" son quince días y el de vuelta es el
 * 16. Sin horas, porque son días completos.
 */
export interface ApiAbsence {
  id: string
  /** "AAAA-MM-DD" */
  startsOn: string
  endsOn: string
  /** Para él. No sale en su ficha: una baja es asunto suyo. */
  reason: string | null
}

/**
 * Un rato en el que cabe lo que se quiere contratar
 * (GET /v1/pros/:id/slots).
 *
 * Sale de su horario menos sus ausencias menos lo que ya tiene, con la
 * antelación mínima aplicada. **Es para elegir, no para reservar**: entre ver
 * la lista y pulsar pagar pasan minutos y la agenda es de otro, así que el
 * servidor lo vuelve a comprobar al contratar.
 */
export interface ApiFreeSlot {
  /** ISO con zona */
  startAt: string
  endAt: string
}

export interface ApiFreeSlots {
  /** Lo que se pidió, para no tener que acordarse */
  durationMin: number
  /**
   * Si la hora concreta que traía pensada el cliente cabe. Solo tiene sentido
   * cuando se ha mandado `preferred`; sin ella llega siempre en `false`.
   */
  requestedAvailable: boolean
  /** Los primeros que caben, el más cercano primero */
  slots: ApiFreeSlot[]
}

/** Por qué se cobra de más esa hora. El servidor decide cuál, y solo uno. */
export type ApiSurchargeKind = 'night' | 'holiday' | 'sunday' | 'saturday'

export interface ApiAppliedSurcharge {
  kind: ApiSurchargeKind
  /** Ya escrito para enseñarlo: «Sábado», «Festivo (Todos los Santos)» */
  label: string
  /** Porcentaje sobre el importe base */
  percent: number
  amount: number
}

/**
 * El desglose de contratar por horas, antes de pagar
 * (GET /v1/pros/:id/hours-quote).
 *
 * Lo calcula entero el servidor y por un buen motivo: lleva dentro el mínimo
 * del oficio, los recargos de esa persona, el calendario de festivos de su
 * comunidad y la excepción que le haya puesto a ese día. Rehacer la cuenta
 * aquí acabaría enseñando un total distinto del que se cobra.
 */
export interface ApiHoursQuote {
  hourlyRate: number
  /** Lo que pidió el cliente */
  requestedHours: number
  /** Lo que se cobra: nunca menos del mínimo del oficio */
  billedHours: number
  minHours: number | null
  /**
   * Si el mínimo ha subido las horas. Con esto la pantalla puede explicar
   * «pides 1 h, se cobran 2 h de mínimo» en vez de enseñar un total que no
   * cuadra con lo que se pidió.
   */
  minApplied: boolean
  /** horas cobradas × tarifa */
  base: number
  /** El que se aplica, o `null` si es una hora normal de un día laborable */
  surcharge: ApiAppliedSurcharge | null
  total: number
  /** Lo preguntado, tal cual */
  startAt: string
  durationMin: number
  /** Las dos frases que van debajo del total, escritas por el servidor */
  terms: {
    hold: string
    freeCancellation: string
  }
}

export const prosApi = {
  list: (filters: ProsFilters = {}) =>
    apiRequest<ProsPage>(`/v1/pros${toQueryString(filters)}`),

  get: (id: string) => apiRequest<ApiProDetail>(`/v1/pros/${id}`),

  reviews: (id: string, filters: ProReviewsFilters = {}) =>
    apiRequest<ProReviewsPage>(`/v1/pros/${id}/reviews${toQueryString(filters)}`),

  /**
   * A cuántos llegaría una urgencia en ese punto. Devuelve números, no la
   * lista: quién está disponible y dónde no es asunto de quien aún no ha
   * contratado.
   */
  coverage: (trade: string, lat: number, lng: number) =>
    apiRequest<ApiCoverage>(
      `/v1/pros/coverage?trade=${encodeURIComponent(trade)}&lat=${lat}&lng=${lng}`,
      { auth: true },
    ),

  /**
   * Cuándo puede este profesional, para elegir hueco.
   *
   * `preferred` es la hora que el cliente traía pensada: con ella el servidor
   * contesta además si **esa** cabe, que es la pregunta que de verdad hace
   * quien ya ha elegido día. Sin ella se devuelven solo los primeros huecos.
   */
  slots: (
    id: string,
    query: { durationMin: number; from?: string; preferred?: string; limit?: number },
  ) =>
    apiRequest<ApiFreeSlots>(
      `/v1/pros/${id}/slots${toQueryString(query)}`,
      { auth: true },
    ),

  /**
   * Cuánto costaría contratarle esas horas a esa hora. No reserva nada.
   *
   * Se pide después de elegir el hueco y antes de pagar: es el desglose que se
   * enseña, y es el mismo que va a cobrar `book-hours`.
   */
  hoursQuote: (
    id: string,
    query: { tradeSlug: string; startAt: string; durationMin: number },
  ) =>
    apiRequest<ApiHoursQuote>(
      `/v1/pros/${id}/hours-quote${toQueryString(query)}`,
      { auth: true },
    ),

  /** Mis fotos de trabajo, para gestionarlas. Vienen agrupables por oficio. */
  myPhotos: () => apiRequest<ApiMyProPhoto[]>('/v1/pro/photos', { auth: true }),

  /** Quita una. Las que quedan se recolocan en el servidor. */
  removePhoto: (id: string) =>
    apiRequest<null>(`/v1/pro/photos/${id}`, { method: 'DELETE', auth: true }),

  /** Los oficios propios, para editarlos */
  myTrades: () => apiRequest<ApiProTrade[]>('/v1/pro/trades', { auth: true }),

  /**
   * Guarda la lista completa. No hay "añadir" ni "quitar" sueltos: entre dos
   * peticiones podría quedarse sin ningún oficio, y sin oficio se desaparece
   * del directorio.
   */
  setMyTrades: (payload: SetTradesPayload) =>
    apiRequest<ApiProTrade[]>('/v1/pro/trades', {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /** La carta de un oficio: tarifa de visita y servicios. Vacía (visitFee null) si no la ha montado */
  myCarta: (tradeSlug: string) =>
    apiRequest<ApiCarta>(`/v1/pro/trades/${tradeSlug}/carta`, { auth: true }),

  /** Se manda entera: la tarifa de visita y la lista de servicios, juntas */
  setMyCarta: (tradeSlug: string, payload: SetCartaPayload) =>
    apiRequest<ApiCarta>(`/v1/pro/trades/${tradeSlug}/carta`, {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /**
   * Qué tiene puesto en su perfil y qué le falta. Una sola petición para las
   * cinco cosas, porque se enseñan juntas en Mi cuenta.
   */
  myChecklist: () =>
    apiRequest<ApiProfileChecklist>('/v1/pro/checklist', { auth: true }),

  /** Su descripción: lo que cuenta de su trabajo, con sus palabras */
  myBio: () => apiRequest<{ bio: string | null }>('/v1/pro/bio', { auth: true }),

  /** Vacío la quita: es lo que cualquiera intenta primero para borrarla */
  setMyBio: (bio: string) =>
    apiRequest<{ bio: string | null }>('/v1/pro/bio', {
      method: 'PUT',
      auth: true,
      body: { bio },
    }),

  /** Los días que ha marcado que no está */
  myAbsences: () => apiRequest<ApiAbsence[]>('/v1/pro/absences', { auth: true }),

  addAbsence: (payload: { startsOn: string; endsOn: string; reason?: string }) =>
    apiRequest<ApiAbsence>('/v1/pro/absences', {
      method: 'POST',
      auth: true,
      body: payload,
    }),

  removeAbsence: (id: string) =>
    apiRequest<null>(`/v1/pro/absences/${id}`, { method: 'DELETE', auth: true }),


  /** Sus recargos por sábado, domingo/festivo y nocturno */
  mySurcharges: () => apiRequest<ApiSurcharges>('/v1/pro/surcharges', { auth: true }),

  /** Los tres a la vez. El cero vale y significa "no lo cobro" */
  setMySurcharges: (payload: { saturday: number; sunday: number; night: number }) =>
    apiRequest<ApiSurcharges>('/v1/pro/surcharges', {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /**
   * Añadir un festivo de su municipio. Los locales no los publica el BOE, así
   * que se le preguntan a quien vive allí.
   */
  addLocalHoliday: (date: string, name: string) =>
    apiRequest<{ date: string; name: string }>('/v1/pro/holidays/local', {
      method: 'POST',
      auth: true,
      body: { date, name },
    }),

  /** Quitar uno de los suyos. Los del BOE no se quitan: no son suyos */
  removeLocalHoliday: (date: string) =>
    apiRequest<null>(`/v1/pro/holidays/local/${date}`, {
      method: 'DELETE',
      auth: true,
    }),

  /** Los festivos de su comunidad ese año, con lo que hace en cada uno */
  myHolidays: (year: number) =>
    apiRequest<ApiHolidayCalendar>(`/v1/pro/holidays?year=${year}`, { auth: true }),

  /**
   * Decide si cobra el recargo un festivo concreto. Para no trabajar ese día
   * no se usa esto, sino una ausencia: ya es exactamente eso.
   */
  setMyHolidayChoice: (date: string, appliesSurcharge: boolean) =>
    apiRequest<ApiHoliday>(`/v1/pro/holidays/${date}`, {
      method: 'PUT',
      auth: true,
      body: { appliesSurcharge },
    }),

  /** Su zona de cobertura, para editarla */
  myCoverage: () =>
    apiRequest<ApiCoverageSettings>('/v1/pro/coverage', { auth: true }),

  /**
   * Guarda el punto base y el radio. La ciudad viaja solo si se ha elegido una
   * dirección del buscador: es por donde se busca en el directorio, y quien
   * mueve su base a otra ciudad tiene que aparecer en esa.
   */
  setMyCoverage: (payload: {
    latitude: number
    longitude: number
    radiusKm: number
    city?: string
    /** `null` lo vacía: mover la base sin saber el nuevo no puede dejar el viejo */
    postcode?: string | null
  }) =>
    apiRequest<ApiCoverageSettings>('/v1/pro/coverage', {
      method: 'PUT',
      auth: true,
      body: payload,
    }),

  /** El horario ordinario de trabajo propio, para editarlo */
  myAvailability: () =>
    apiRequest<ApiAvailabilityWindow[]>('/v1/pro/availability', { auth: true }),

  /**
   * Guarda la semana entera, como los oficios y por lo mismo: entre dos
   * peticiones el horario quedaría a medias, y de un horario a medias salen
   * citas a horas a las que nadie piensa ir.
   *
   * Lo que devuelve puede no ser lo que se mandó: el servidor junta las
   * franjas del mismo día que se tocan y parte en dos las que cruzan la
   * medianoche. Por eso se pinta la respuesta y no lo enviado.
   */
  setMyAvailability: (windows: ApiAvailabilityWindow[]) =>
    apiRequest<ApiAvailabilityWindow[]>('/v1/pro/availability', {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),

  /** Un mes del calendario propio, "AAAA-MM" */
  availabilityCalendar: (month: string) =>
    apiRequest<ApiAvailabilityCalendar>(
      `/v1/pro/availability/calendar?month=${month}`,
      { auth: true },
    ),

  /**
   * Las horas de un día suelto. Sustituyen al horario semanal solo esa fecha.
   *
   * **La lista vacía es "ese día no trabajo"**, no "vuelve al semanal": para
   * eso está `clearAvailabilityDay`. Si vaciarla volviera al semanal, quitarle
   * las horas a un jueves se las dejaría puestas.
   */
  setAvailabilityDay: (date: string, windows: ApiDayWindow[]) =>
    apiRequest<ApiCalendarDay>(`/v1/pro/availability/days/${date}`, {
      method: 'PUT',
      auth: true,
      body: { windows },
    }),

  /** Quita lo puesto a ese día: vuelve a mandar el horario semanal */
  clearAvailabilityDay: (date: string) =>
    apiRequest<ApiCalendarDay>(`/v1/pro/availability/days/${date}`, {
      method: 'DELETE',
      auth: true,
    }),

  /**
   * El atajo: las mismas horas a varios días de la semana de una vez.
   *
   * Cambia el horario **semanal**, que es lo que se repite solo el mes que
   * viene, y solo los días que se le pasan: quien trabaja los sábados no los
   * pierde por aplicar de lunes a viernes.
   */
  setAvailabilityWeekdays: (weekdays: number[], windows: ApiDayWindow[]) =>
    apiRequest<ApiAvailabilityWindow[]>('/v1/pro/availability/weekdays', {
      method: 'PUT',
      auth: true,
      body: { weekdays, windows },
    }),

  /**
   * Activa o desactiva "disponible ahora" en el perfil propio.
   * Se manda el estado deseado, no un "alterna": dos toques con mala
   * cobertura dejarían el interruptor donde no toca.
   */
  setAvailableNow: (availableNow: boolean) =>
    apiRequest<AvailabilityState>('/v1/pro/available-now', {
      method: 'PATCH',
      auth: true,
      body: { availableNow },
    }),
}
