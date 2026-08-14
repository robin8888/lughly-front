/**
 * Button styles
 * Extraídos de .btn en styles.css
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3] * 1.2,
    // `.btn` va cuadrado en el tema industrial (styles.css, línea 291)
    borderRadius: theme.radius.none,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  text: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.button,
    lineHeight: theme.typography.sizes.button * theme.typography.lineHeights.button,
    textAlign: 'center',
  },
})

type ButtonVariantStyle = Record<string, ViewStyle>
type TextVariantStyle = Record<string, TextStyle>

export const buttonStyles: ButtonVariantStyle = {
  primary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.divider,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: theme.spacing[1],
  },
  default: {},
  small: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
  large: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
}

export const textStyles: TextVariantStyle = {
  primary: {
    color: '#ffffff',
  },
  secondary: {
    color: theme.colors.text,
  },
  ghost: {
    color: theme.colors.accent,
  },
  default: {},
  small: {
    fontSize: 13.5,
  },
  large: {
    fontSize: 18,
  },
}
