/**
 * Border radius tokens
 *
 * **Reescrito el 20 Agosto 2026.** Hasta hoy el tema industrial del `_ds`
 * anulaba la escala para los componentes principales:
 *
 *   .card, .btn, .input, .tag, .seg, .dialog { border-radius: 0; }
 *
 * Eso daba el aire técnico del sistema —y tenía sentido con las marcas de
 * registro en las esquinas, que sobre una curva quedan flotando fuera del
 * papel—. Pero esas marcas se quitaron hace tiempo, el logotipo son letras
 * gordas de esquinas redondas, y en un sitio donde se elige a una persona la
 * escuadra se lee como un panel de control.
 *
 * Ahora **todo va redondeado**, y `none` se queda solo para lo que de verdad
 * no lleva curva.
 */

export const radius = {
  /** Lo que de verdad no lleva curva */
  none: 0,
  sm: 2,
  md: 4,
  lg: 7,
  /** Fotos y miniaturas */
  photo: 10,
  /** Campos de texto y cajas pequeñas */
  field: 14,
  /** Tarjetas y diálogos */
  card: 20,
  pill: 999,
} as const

export type Radius = keyof typeof radius
