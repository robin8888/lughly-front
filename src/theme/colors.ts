/**
 * Color tokens extraídos de _ds/industry-b237969c-50b4-49b1-bd23-47ccffb071f0/styles.css
 * No modificar valores manualmente: son la fuente de verdad del diseño.
 */

export const colors = {
  // Base
  /**
   * **Blanco desde el 20 Agosto 2026.** Era `#f2f2f3`, y ese gris obligaba a
   * que la tarjeta fuese casi blanca para destacar sobre él; ahí se perdía el
   * contraste que de verdad importa, que es el de la foto y la cara contra la
   * página. Ahora las tarjetas se separan con aire y una sombra baja.
   */
  bg: '#ffffff',
  surface: '#e9e9ea',
  /** Para lo que espera algo: campos, chips, huecos de foto */
  surfaceSoft: '#f3f5f7',
  /** Lo que acompaña sin competir: oficio, ciudad, distancia, pies de texto */
  textSoft: '#697586',
  /** Línea de un pelo, solo donde de verdad hace falta separar */
  hairline: '#e9edf1',
  text: '#1d1f20',
  accent: '#5980a6',
  accent2: '#728fab',
  divider: 'rgba(29, 31, 32, 0.16)',

  // Neutral ramp
  neutral100: '#f5f5f8',
  neutral200: '#e7e7ea',
  neutral300: '#d4d4d7',
  neutral400: '#b7b7ba',
  neutral500: '#98989b',
  neutral600: '#7a7a7d',
  neutral700: '#5d5d60',
  neutral800: '#424244',
  neutral900: '#2b2b2d',

  // Accent ramp
  accent100: '#eef6ff',
  accent200: '#d6ebff',
  accent300: '#b5d9fd',
  accent400: '#94bce3',
  accent500: '#749dc4',
  accent600: '#597ea3',
  accent700: '#416180',
  accent800: '#2c455d',
  accent900: '#1d2d3d',

  // Accent-2 ramp
  accent2100: '#eef6ff',
  accent2200: '#d6ebff',
  accent2300: '#bdd8f2',
  accent2400: '#9ebbd8',
  accent2500: '#7e9cb8',
  accent2600: '#627d98',
  accent2700: '#486077',
  accent2800: '#314457',
  accent2900: '#1f2d3a',

  // Semánticos (según README)
  available: '#3f8f5a',
  /**
   * El anillo de quien no atiende ahora. Rojo apagado y **no** `urgency`: no
   * ha fallado nada ni hay ninguna urgencia, solo dice que hoy no sale
   * corriendo.
   */
  unavailable: '#d1544a',
  urgency: '#a3453a',
  error: '#a3453a',
  rating: '#d4a13a',

  // Dark theme para app móvil (según MobileApp.dc.html)
  darkBg: '#04070f',
  darkText: '#e8edf5',
  darkDivider: 'rgba(232, 237, 245, 0.14)',
  darkInputBg: '#0c1220',

  // Tarjetas claras sobre fondo oscuro
  cardBg: '#fdfdfb',
  cardText: '#1c2b33',
  cardDivider: 'rgba(28, 43, 51, 0.14)',
} as const

export type Color = keyof typeof colors
