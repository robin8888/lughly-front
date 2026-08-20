/**
 * EmptyState styles
 * Tarjeta blueprint clara, tipografía y colores del sistema.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  illustration: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.cardText,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.75,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 18,
  },
})
