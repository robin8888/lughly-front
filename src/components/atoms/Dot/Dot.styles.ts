/**
 * Dot styles
 */

import { StyleSheet, ViewStyle } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
  },
})

type ColorStyle = Record<string, ViewStyle>

export const colorStyles: ColorStyle = {
  accent: {
    backgroundColor: theme.colors.accent,
  },
  success: {
    backgroundColor: theme.colors.available,
  },
  warning: {
    backgroundColor: theme.colors.rating,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  neutral: {
    backgroundColor: theme.colors.neutral500,
  },
}
