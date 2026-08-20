/**
 * Shadow/elevation tokens
 * En React Native usamos shadowColor, shadowOffset, shadowOpacity, shadowRadius (iOS)
 * y elevation (Android). Estos valores replican los del CSS.
 */

export const shadows = {
  /**
   * La de las tarjetas. Muy baja a propósito: en una lista hay decenas, y una
   * sombra marcada por tarjeta ensucia la pantalla entera. Es lo único que
   * separa una tarjeta blanca de una página blanca, así que tampoco puede ser
   * cero.
   */
  card: {
    shadowColor: '#0b1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sm: {
    shadowColor: '#2b2b2d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#2b2b2d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2b2b2d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 8,
  },
} as const

export type Shadow = keyof typeof shadows
