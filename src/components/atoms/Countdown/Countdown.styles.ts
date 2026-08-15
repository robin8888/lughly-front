/**
 * Countdown styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    // Cifras de ancho fijo: sin esto el texto se mueve a cada segundo
    fontVariant: ['tabular-nums'],
  },
})
