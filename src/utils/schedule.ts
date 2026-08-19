/**
 * Un horario de trabajo, puesto como se lee.
 *
 * El servidor devuelve franjas sueltas —día, hora de inicio, hora de fin— y ya
 * ordenadas, pero eso no es lo que nadie quiere leer en una ficha. Lo que se
 * espera ahí es el cartel de un negocio: los siete días en columna, cada uno
 * con sus horas, y los cerrados dichos.
 *
 * Se hace aquí y no en la pantalla porque es la clase de código que se prueba
 * sin montar nada, y porque el mismo horario acabará viéndose en más de un
 * sitio en cuanto se pueda reservar una hora.
 */

import { WEEKDAY_NAMES } from './dates'

export interface ScheduleWindow {
  /** 0 domingo … 6 sábado, como `Date.getDay()` */
  weekday: number
  /** Hora local, "HH:MM" */
  from: string
  to: string
}

export interface ScheduleDay {
  weekday: number
  label: string
  /** "09:00 - 14:00 · 16:00 - 20:00", o null si ese día no trabaja */
  hours: string | null
}

/**
 * La semana empieza en lunes, como en España, aunque `Date.getDay()` cuente
 * desde el domingo.
 */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

/**
 * Los siete días con sus horas. Siempre los siete: un horario al que le faltan
 * los días cerrados obliga a quien lo lee a deducirlos, y en un cartel de
 * horarios lo que no está escrito se lee como un descuido.
 *
 * Las franjas que cruzan la medianoche llegan partidas en dos días, que es como
 * están guardadas y como se leen mejor: "viernes de 22:00 a 00:00" y "sábado de
 * 00:00 a 06:00" dice a qué hora se puede llamar cada día, que es la pregunta.
 */
export function toWeekSchedule(windows: ScheduleWindow[]): ScheduleDay[] {
  return WEEK_ORDER.map((weekday) => {
    const hours = windows
      .filter((window) => window.weekday === weekday)
      .map((window) => `${window.from} - ${window.to}`)
      .join(' · ')

    return {
      weekday,
      label: WEEKDAY_NAMES[weekday]!,
      hours: hours === '' ? null : hours,
    }
  })
}
