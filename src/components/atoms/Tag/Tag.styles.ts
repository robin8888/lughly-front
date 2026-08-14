/**
 * Tag styles
 * Desde .tag en styles.css
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 10,
    // `.tag` va cuadrada en el tema industrial (styles.css, línea 291)
    borderRadius: theme.radius.none,
  },
  text: {
    fontSize: 12.5,
    letterSpacing: 0.02,
    fontFamily: theme.typography.fonts.body,
  },
})

type VariantStyle = Record<string, ViewStyle>
type TextVariantStyle = Record<string, TextStyle>

export const variantStyles: VariantStyle = {
  accent: {
    backgroundColor: theme.colors.accent100,
  },
  accent2: {
    backgroundColor: theme.colors.accent2100,
  },
  neutral: {
    backgroundColor: theme.colors.neutral100,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  available: {
    backgroundColor: 'rgba(63, 143, 90, 0.15)',
  },
  urgency: {
    backgroundColor: 'rgba(163, 69, 58, 0.15)',
  },
}

export const textVariantStyles: TextVariantStyle = {
  accent: {
    color: theme.colors.accent800,
  },
  accent2: {
    color: theme.colors.accent2800,
  },
  neutral: {
    color: theme.colors.neutral800,
  },
  outline: {
    color: theme.colors.accent,
  },
  available: {
    color: theme.colors.available,
    fontWeight: '600',
  },
  urgency: {
    color: theme.colors.urgency,
    fontWeight: '600',
  },
}
