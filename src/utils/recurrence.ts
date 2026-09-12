/**
 * Un contrato fijo, dicho en una frase.
 *
 * «Los lunes, miércoles y viernes, de 10:00 a 12:00». Es lo que hay que leer
 * de un vistazo en la ficha: quien firmó una limpieza de meses no quiere
 * deducir su acuerdo de una lista de cincuenta y seis citas.
 *
 * Vive aparte de la pantalla para poder probarlo: los días salen en el orden
 * de `Date.getDay()` —0 es domingo— y una semana que empiece en domingo se lee
 * mal en España, así que hay un reordenado que es fácil romper sin que nadie
 * lo note.
 */

import { WEEKDAY_NAMES } from './dates'

/** Los días como se lee una semana aquí: de lunes a domingo */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

/** 600 → "10:00" */
export function formatMinuteOfDay(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60) % 24
  const minute = minuteOfDay % 60

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** «lunes, miércoles y viernes», siempre de lunes a domingo */
export function formatWeekdays(weekdays: number[]): string {
  const names = WEEK_ORDER.filter((day) => weekdays.includes(day)).map(
    (day) => WEEKDAY_NAMES[day] as string,
  )

  if (names.length === 0) return ''
  if (names.length === 1) return names[0] as string

  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1] as string}`
}

/**
 * «Los lunes, miércoles y viernes, de 10:00 a 12:00».
 *
 * La hora de final se calcula y no se guarda: es la de empiece más lo que
 * dura, y dos campos que tienen que cuadrar acaban no cuadrando.
 */
export function describeRecurrence(recurrence: {
  weekdays: number[]
  startMinute: number
  durationMin: number
}): string {
  const dias = formatWeekdays(recurrence.weekdays)

  if (dias === '') return ''

  const desde = formatMinuteOfDay(recurrence.startMinute)
  const hasta = formatMinuteOfDay(recurrence.startMinute + recurrence.durationMin)

  return `Los ${dias}, de ${desde} a ${hasta}`
}
