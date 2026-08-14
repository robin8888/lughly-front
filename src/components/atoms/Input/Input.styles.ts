/**
 * Input styles
 * Desde .input en styles.css
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    width: '100%',
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 10,
    fontSize: 15.5,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    // `.input` va cuadrado en el tema industrial (styles.css, línea 291)
    borderRadius: theme.radius.none,
  },
  dark: {
    backgroundColor: theme.colors.darkInputBg,
    color: theme.colors.darkText,
    borderColor: 'rgba(232, 237, 245, 0.18)',
  },
  error: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
})
