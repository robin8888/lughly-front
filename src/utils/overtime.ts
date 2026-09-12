/**
 * El rato de más de una reserva por horas (`CICLOS` §A6).
 *
 * **La misma cuenta que hace el servidor**, y aquí solo para poder enseñarla
 * antes de que el profesional decida: el importe que se retiene lo calcula él
 * con la tarifa congelada y la hora de la cita, no lo que mande el móvil.
 * Repetirla aquí es lo que permite escribir «cobrar los 45 minutos de más
 * (10,50 €)» en un botón en vez de «cobrar el rato de más» a ciegas.
 *
 * Cuartos **completos**: dieciséis minutos son un cuarto, no dos. Cobrar un
 * cuarto entero por dos minutos convertiría cada despedida en la puerta en una
 * discusión, y la discusión sale más cara que los tres euros y medio.
 */
export const EXTRA_QUARTER_MINUTES = 15

export interface Overtime {
  /** Minutos de más, para decirlos tal cual */
  minutes: number
  /** Y lo que se le retendría al cliente si decide cobrarlos */
  amount: number
}

/**
 * Cuánto lleva de más ahora mismo, o `null` si no hay nada que cobrar.
 *
 * `null` y no un cero para que la pantalla no tenga que decidir si enseña algo:
 * si no hay rato que cobrar, no hay nada que preguntar.
 */
export function overtimeNow(input: {
  startedAt: string | null
  bookedMinutes: number | null
  hourlyRate: number | null
  now?: Date
}): Overtime | null {
  const { startedAt, bookedMinutes, hourlyRate } = input

  if (!startedAt || bookedMinutes === null || hourlyRate === null) return null

  const ahora = input.now ?? new Date()
  const trabajados = Math.round((ahora.getTime() - new Date(startedAt).getTime()) / 60_000)
  const exceso = trabajados - bookedMinutes

  if (exceso < EXTRA_QUARTER_MINUTES) return null

  const cuartos = Math.floor(exceso / EXTRA_QUARTER_MINUTES)
  const cuartosPorHora = 60 / EXTRA_QUARTER_MINUTES

  return {
    minutes: exceso,
    amount: Math.round(((hourlyRate * cuartos) / cuartosPorHora) * 100) / 100,
  }
}
