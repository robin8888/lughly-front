/**
 * Typography tokens
 * Fuentes: Barlow Condensed (headings) + Barlow (body)
 */

export const typography = {
  fonts: {
    heading: 'BarlowCondensed_600SemiBold',
    body: 'Barlow_400Regular',
    bodySemiBold: 'Barlow_600SemiBold',
    bodyBold: 'Barlow_700Bold',
  },
  /**
   * Escala subida ~12% sobre la del diseño web (13 Agosto 2026): los tamaños
   * originales estaban pensados para una maqueta de 390 px vista en pantalla
   * grande, y en el móvil real se leían pequeños.
   *
   * Entre paréntesis, el valor original por si hay que volver atrás.
   */
  sizes: {
    h1: 46, // 42
    h2: 36, // 32
    h3: 28, // 25
    h4: 22, // 20
    h5: 18, // 16
    h6: 15, // 13
    body: 17, // 15
    small: 15, // 13
    tiny: 12.5, // 11
    button: 16, // 14
  },
  lineHeights: {
    heading: 1.12,
    body: 1.55,
    button: 1.2,
  },
  letterSpacing: {
    heading: -0.015,
    caps: 0.08,
    body: 0,
  },
} as const

export type FontFamily = keyof typeof typography.fonts
export type FontSize = keyof typeof typography.sizes
