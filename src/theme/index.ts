/**
 * Sistema de diseño de Lughly
 * Tokens extraídos de _ds/industry-b237969c-50b4-49b1-bd23-47ccffb071f0/styles.css
 *
 * Reglas:
 * - Ningún componente puede usar colores o espaciados literales
 * - Todo sale de este theme
 * - Los valores son inmutables (as const)
 */

export * from './colors'
export * from './spacing'
export * from './typography'
export * from './radius'
export * from './shadows'

import { colors } from './colors'
import { spacing } from './spacing'
import { typography } from './typography'
import { radius } from './radius'
import { shadows } from './shadows'

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
} as const

export type Theme = typeof theme
