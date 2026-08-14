/**
 * MapMarker styles
 * Punto redondo con borde claro, para que se lea sobre cualquier tesela.
 */

import { StyleSheet, type ViewStyle } from 'react-native'
import { theme } from '@/theme'

const SIZE = 18

export const styles = StyleSheet.create({
  base: {
    width: SIZE,
    height: SIZE,
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    // Borde claro: sobre una tesela oscura o con mucho detalle, un punto sin
    // contorno se pierde.
    borderColor: theme.colors.cardBg,
    ...theme.shadows.md,
  },
  selected: {
    transform: [{ scale: 1.35 }],
    borderColor: theme.colors.text,
  },
})

export const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: theme.colors.accent },
  available: { backgroundColor: theme.colors.available },
  urgency: { backgroundColor: theme.colors.urgency },
}
