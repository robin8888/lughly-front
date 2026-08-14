/**
 * Recargos horarios.
 *
 * Los porcentajes salen del README §6 y son regla de negocio, no decoración:
 * **no se acumulan, se aplica el más alto**. Un sábado por la noche es +25%
 * (nocturno), no +45%.
 *
 * Aquí viven solo los valores y el texto que los explica. El cálculo sobre un
 * importe llegará con `usePriceQuote` cuando exista la reserva instantánea
 * (Fase 7): mientras tanto, la app únicamente los muestra.
 *
 * El servidor vuelve a aplicarlos al cobrar. Lo de aquí es informativo: si
 * alguna vez discrepan, manda el servidor.
 */

export interface SurchargeRule {
  id: 'saturday' | 'sunday' | 'night' | 'urgency'
  label: string
  /** Porcentaje sobre la tarifa base */
  percent: number
}

export const SURCHARGES: readonly SurchargeRule[] = [
  { id: 'saturday', label: 'Sábados', percent: 20 },
  { id: 'sunday', label: 'Domingos y festivos', percent: 35 },
  { id: 'night', label: 'Nocturno 22:00–06:00', percent: 25 },
] as const

/**
 * El de urgencia es un rango, no un valor fijo: lo concreta el profesional
 * al aceptar. Por eso no entra en la lista de arriba.
 */
export const URGENCY_SURCHARGE = { min: 25, max: 50 } as const

/** Línea de una sola frase, tal cual aparece en la ficha del profesional. */
export function surchargesSummary(): string {
  return SURCHARGES.map((rule) => `${rule.label} +${rule.percent}%`).join(' · ')
}
