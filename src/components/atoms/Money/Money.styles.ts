/**
 * Money styles
 */

import { StyleSheet, TextStyle } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.text,
  },
})

type SizeStyle = Record<string, TextStyle>

export const sizeStyles: SizeStyle = {
  small: {
    fontSize: theme.typography.sizes.small,
  },
  medium: {
    fontSize: theme.typography.sizes.body,
  },
  large: {
    fontSize: theme.typography.sizes.h4,
    fontFamily: theme.typography.fonts.heading,
  },
}
