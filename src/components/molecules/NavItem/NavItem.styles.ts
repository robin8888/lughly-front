/**
 * NavItem styles
 * Valores literales de BOTTOM_NAV_MOBILE.md §4.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const ACTIVE_OPACITY = 1
/**
 * Antes 0,55, con la barra en material claro. Sobre el cristal navy esa
 * opacidad deja el rótulo en 3,36:1 y hace falta 4,5:1; al 75 % son 4,75:1 y
 * se sigue leyendo como apagado frente al 6,93:1 del activo.
 */
export const INACTIVE_OPACITY = 0.75

export const styles = StyleSheet.create({
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 1,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11.5,
  },
})
