/**
 * HomePage styles
 * HOME_MOBILE.md: ScrollView con fondo #04070f.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
  },
  content: {
    paddingBottom: 78,
  },
})
