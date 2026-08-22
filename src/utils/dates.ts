/**
 * Fechas y horas en español, escritas a mano.
 *
 * **Sin `Intl`.** Hermes lo trae incompleto: `Intl.DateTimeFormat` con
 * opciones de calendario devuelve resultados distintos según el dispositivo o
 * revienta directamente, igual que pasó con `Intl.RelativeTimeFormat` en las
 * fechas relativas y con `Intl.NumberFormat` en los importes. Formatear a
 * mano son veinte líneas y no depende de qué lleve el móvil dentro.
 *
 * El formato es el español: **día/mes/año** y hora de 24 h. Un "03/04" es el
 * 3 de abril, y quien escriba fechas a mano acabará equivocándose tarde o
 * temprano; por eso en la app se eligen con un selector y esto solo las
 * pinta.
 *
 * Todo lo que sale de aquí está en la hora del dispositivo. Es lo correcto:
 * el usuario piensa en su reloj, y `Date` ya resuelve el cambio de horario
 * con la base de datos de zonas del sistema.
 */

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

const WEEKDAYS = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const

/** Los días de la semana como los ordena `Date.getDay()`: 0 es domingo. */
export const WEEKDAY_NAMES = WEEKDAYS

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

/** "16/08/2026" */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

/** "22:05" */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** "16/08/2026, 22:05" */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`
}

/**
 * "domingo, 16 de agosto" — para confirmaciones, donde el día de la semana
 * evita el error de haber elegido el martes que viene sin querer.
 */
export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`
}

/** "domingo, 16 de agosto de 2026 a las 22:05" */
export function formatLongDateTime(date: Date): string {
  return `${formatLongDate(date)} de ${date.getFullYear()} a las ${formatTime(date)}`
}

/**
 * La hora si es de hoy, la fecha corta si no — para el chat: "22:05" en la
 * propia conversación de hoy, "16/08" en la lista de hilos si el último
 * mensaje es de otro día. El año no hace falta: nadie deja una conversación
 * sin abrir un año entero.
 */
export function formatMessageTime(date: Date, now: Date = new Date()): string {
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  return sameDay ? formatTime(date) : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`
}

/**
 * Fecha suelta para la API, sin hora: "2026-08-16".
 *
 * Se construye con las partes locales y NO con `toISOString()`, que convierte
 * a UTC: en España, entre marzo y octubre, las primeras dos horas del día
 * pertenecen al día anterior en UTC, y una cita del día 16 se enviaría como
 * el 15.
 */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Lee una fecha suelta "2026-08-16" como ese día en la hora del usuario.
 *
 * No vale `new Date('2026-08-16')`: la norma manda interpretarla como UTC, y
 * en España eso es el día 15 a las 22:00 en verano. Un usuario que eligió el
 * 16 vería el 15 al volver a abrir el formulario.
 */
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseIsoDate(value: string): Date | null {
  const match = DATE_ONLY.exec(value.trim())
  if (!match) return null

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  // Rechaza el 31 de febrero y compañía, que JS convertiría al 3 de marzo
  return date.getMonth() === Number(month) - 1 ? date : null
}

/**
 * Fecha **con hora** para la API: "2026-08-16T18:30:00.000Z".
 *
 * Aquí sí se usa `toISOString()`, al revés que en `toIsoDate`, y no es
 * incoherencia: son dos cosas distintas. Una fecha suelta es un día del
 * calendario y hay que mandarla tal cual se eligió; una cita es un **instante**,
 * y un instante se manda en UTC y se pinta en la hora de quien lo mire.
 *
 * Es además lo que resuelve el cambio de hora sin pensarlo. En el día de 25
 * horas hay dos "02:30" locales; en UTC son dos instantes distintos y no hay
 * ambigüedad. Sumar o restar horas sobre una hora local sí la tendría.
 */
export function toIsoDateTime(date: Date): string {
  return date.toISOString()
}

/**
 * Lee lo que venga: una cita con hora o una fecha suelta de las de antes.
 *
 * Las dos formas conviven y van a seguir conviviendo. Los trabajos publicados
 * antes de que se pidiera la hora llevan "2026-08-16" a secas, y los borradores
 * a medias guardados en el móvil, también. Un solo `new Date(value)` no vale
 * para ambas: con la fecha suelta la norma manda leerla como UTC, y en España
 * eso devuelve el día anterior a las 22:00.
 */
export function parseIsoDateTime(value: string): Date | null {
  const trimmed = value.trim()
  if (trimmed === '') return null

  // Fecha suelta: la lee quien sabe hacerlo sin correrla un día
  const dateOnly = parseIsoDate(trimmed)
  if (dateOnly) return dateOnly

  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Cuándo es un trabajo, dicho como se pueda: con hora si la tiene, y solo el
 * día si no.
 *
 * Hace falta porque los datos son mixtos. Un trabajo de antes se guardó como
 * "2026-08-16", que al leerlo es medianoche **UTC**; pintarle la hora diría "a
 * las 02:00", una hora que nadie eligió y a la que nadie va a ir. Se detecta
 * justo por eso: si el instante cae exactamente en medianoche UTC, es una
 * fecha suelta disfrazada.
 *
 * El falso positivo —alguien que eligiera de verdad la medianoche UTC— sale
 * gratis: se le enseña el día sin la hora, que es lo que se veía hasta ahora.
 */
export function formatJobWhen(iso: string): string | null {
  const trimmed = iso.trim()

  /*
   * Una fecha sin hora llega de dos formas y hay que reconocer las dos.
   *
   * La cadena a secas —"2026-08-16"— viene de un borrador guardado en el
   * móvil. La otra, "2026-08-16T00:00:00.000Z", es la misma fecha después de
   * pasar por el servidor: se guardó con `z.coerce.date()`, que la leyó como
   * medianoche UTC.
   *
   * Mirar solo la hora UTC no vale para la primera: se lee como medianoche
   * **local**, que en España son las 22:00 UTC del día anterior, y pasaría por
   * una hora elegida. Por eso se comprueba antes la forma de la cadena.
   */
  if (DATE_ONLY.test(trimmed)) {
    const dateOnly = parseIsoDate(trimmed)
    return dateOnly ? formatLongDate(dateOnly) : null
  }

  const date = parseIsoDateTime(trimmed)
  if (!date) return null

  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0

  return isUtcMidnight ? formatLongDate(date) : formatLongDateTime(date)
}

/** Hoy a las 00:00, en la hora del dispositivo. */
export function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

/**
 * Dentro de N días, conservando la hora.
 *
 * `setDate` con un número mayor que los días del mes pasa al siguiente él
 * solo, y respeta el cambio de horario porque opera sobre la fecha local.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** El mismo día a la hora indicada. */
export function atTime(date: Date, hours: number, minutes = 0): Date {
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * Cuánto falta, en palabras: "en 3 días", "en 2 h", "menos de un minuto".
 *
 * Para plazos que el usuario mira de reojo —lo que queda de una subasta, las
 * 24 h que tiene la empresa para responder—. Devuelve null si ya pasó, que
 * es un estado distinto y se dice con otras palabras.
 */
export function timeLeft(target: Date, from: Date = new Date()): string | null {
  const ms = target.getTime() - from.getTime()
  if (ms <= 0) return null

  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'menos de un minuto'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`

  const days = Math.floor(hours / 24)
  return `${days} ${days === 1 ? 'día' : 'días'}`
}
