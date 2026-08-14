/**
 * Fechas en relativo: "hace 2 semanas", como en el diseño (Perfil.dc.html).
 *
 * En una reseña importa la antigüedad, no el día exacto: "hace 2 semanas"
 * se entiende de un vistazo y "14/07/2026" obliga a calcular.
 *
 * Se conjuga a mano y NO con `Intl.RelativeTimeFormat`: el motor Hermes de
 * esta app no lo trae —`new Intl.RelativeTimeFormat(...)` revienta con
 * "undefined cannot be used as a constructor"— aunque sí tenga
 * `Intl.NumberFormat`, que es el que usa el átomo `Money`. Como solo hay que
 * cubrir el español, la tabla de plurales de abajo sale más barata que
 * arrastrar un polyfill entero.
 */

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
/** Meses y años en promedio: para "hace X" no se necesita más precisión. */
const MONTH = 30 * DAY
const YEAR = 365 * DAY

interface Unit {
  size: number
  /** Cómo se llama en singular y en plural */
  one: string
  many: string
}

/** De mayor a menor; gana el primero que quepa. */
const UNITS: readonly Unit[] = [
  { size: YEAR, one: 'año', many: 'años' },
  { size: MONTH, one: 'mes', many: 'meses' },
  { size: WEEK, one: 'semana', many: 'semanas' },
  { size: DAY, one: 'día', many: 'días' },
  { size: HOUR, one: 'hora', many: 'horas' },
  { size: MINUTE, one: 'minuto', many: 'minutos' },
]

/**
 * @param iso fecha en ISO, tal como la devuelve la API
 * @param now inyectable para poder fijar el momento al probar a mano
 */
export function relativeDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime()

  if (Number.isNaN(then)) return ''

  const elapsed = now.getTime() - then

  // Un desfase de reloj entre el móvil y el servidor no debe sacar
  // "dentro de 3 minutos" en una reseña que ya está escrita.
  if (elapsed < MINUTE) return 'ahora mismo'

  for (const unit of UNITS) {
    if (elapsed >= unit.size) {
      const amount = Math.floor(elapsed / unit.size)

      // "ayer" se lee mejor que "hace 1 día"; el resto no gana nada con
      // formas especiales, así que se quedan en "hace N".
      if (amount === 1 && unit.size === DAY) return 'ayer'

      return `hace ${amount} ${amount === 1 ? unit.one : unit.many}`
    }
  }

  return 'ahora mismo'
}
