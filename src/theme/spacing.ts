/**
 * Spacing tokens desde styles.css
 * NOTA: no existe space-5 en el diseño original
 */

export const spacing = {
  1: 3.4,
  2: 6.8,
  3: 10.2,
  4: 13.6,
  6: 20.4,
  8: 27.2,
} as const

export type Spacing = keyof typeof spacing
