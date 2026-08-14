/**
 * Color tokens extraídos de _ds/industry-b237969c-50b4-49b1-bd23-47ccffb071f0/styles.css
 * No modificar valores manualmente: son la fuente de verdad del diseño.
 */

export const colors = {
  // Base
  bg: '#f2f2f3',
  surface: '#e9e9ea',
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
