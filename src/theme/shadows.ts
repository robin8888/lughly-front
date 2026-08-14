/**
 * Shadow/elevation tokens
 * En React Native usamos shadowColor, shadowOffset, shadowOpacity, shadowRadius (iOS)
 * y elevation (Android). Estos valores replican los del CSS.
 */

export const shadows = {
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
