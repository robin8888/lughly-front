/**
 * StatCard styles
 * Celda de la rejilla de estadísticas (MobileApp.dc.html, `isPanel`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/**
 * Lado de cada estrella cuando la tarjeta lleva valoración.
 *
 * 14 y no menos: van bajo una cifra de 28 px y en una celda de media pantalla,
 * así que caben cinco holgadas. Por debajo de 12 el pico de la estrella se
 * empasta y deja de distinguirse cuántas están pintadas, que es justo lo único
 * que se les pide.
 */
export const STAR_SIZE = 14

export const styles = StyleSheet.create({
  card: {
    // La rejilla la monta quien la usa; la tarjeta solo ocupa su celda.
    flex: 1,
  },
  label: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
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
  stars: {
    marginTop: 4,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },
})
