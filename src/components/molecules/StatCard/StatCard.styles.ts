/**
 * StatCard styles
 * Celda de la rejilla de estadísticas (MobileApp.dc.html, `isPanel`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    // La rejilla la monta quien la usa; la tarjeta solo ocupa su celda.
    flex: 1,
  },
  label: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: theme.colors.cardText,
    opacity: 0.6,
  },
  value: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h3,
    color: theme.colors.cardText,
    marginTop: 2,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },
})
