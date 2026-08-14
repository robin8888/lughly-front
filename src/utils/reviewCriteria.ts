/**
 * Los ocho criterios de una valoración.
 *
 * Etiquetas y pistas copiadas literalmente de MobileApp.dc.html (formulario
 * del historial). El orden es el del diseño y no es alfabético ni casual:
 * va de lo primero que percibe el cliente (rapidez) a lo último que juzga
 * (si el precio se ajustó a lo pactado).
 *
 * `key` coincide con el campo del backend, así que la respuesta de la API se
 * recorre con esta lista sin traducir nada por el camino.
 */

export interface ReviewCriterion {
  key:
    | 'speed'
    | 'knowledge'
    | 'performance'
    | 'finish'
    | 'cleanliness'
    | 'punctuality'
    | 'treatment'
    | 'budgetFit'
  label: string
  /** Aclaración corta de qué se puntúa */
  hint: string
}

export const REVIEW_CRITERIA: readonly ReviewCriterion[] = [
  { key: 'speed', label: 'Rapidez al atender', hint: 'Respuesta y llegada' },
  { key: 'knowledge', label: 'Conocimientos técnicos', hint: 'Diagnóstico y solución' },
  { key: 'performance', label: 'Desempeño', hint: 'Cómo trabajó' },
  { key: 'finish', label: 'Acabado y perfección', hint: 'Calidad del resultado' },
  { key: 'cleanliness', label: 'Limpieza y orden', hint: 'Dejó la zona limpia' },
  { key: 'punctuality', label: 'Puntualidad', hint: 'Cumplió día y hora' },
  { key: 'treatment', label: 'Trato y comunicación', hint: 'Claridad y educación' },
  { key: 'budgetFit', label: 'Ajuste al presupuesto', hint: 'Sin sorpresas' },
] as const
