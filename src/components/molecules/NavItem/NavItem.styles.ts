/**
 * NavItem styles
 * Valores literales de BOTTOM_NAV_MOBILE.md §4.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const ACTIVE_OPACITY = 1
export const INACTIVE_OPACITY = 0.55

export const styles = StyleSheet.create({
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 2,
    paddingTop: 6,
    paddingBottom: 2,
    paddingHorizontal: 1,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 10.5,
  },
})
