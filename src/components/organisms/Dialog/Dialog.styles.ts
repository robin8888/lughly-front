/**
 * Dialog styles
 *
 * La tarjeta va del color de la barra de abajo y con su misma transparencia,
 * para que se lea como la misma pieza de cristal. Sobre el fondo oscuro del
 * diálogo, el texto blanco encima se lee de sobra.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(4, 7, 15, 0.62)',
  },
  card: {
    alignItems: 'center',
    padding: 20,
    borderRadius: theme.radius.card,
  },
  accent: {
    backgroundColor: theme.colors.accentGlass,
  },
  danger: {
    backgroundColor: theme.colors.unavailableGlass,
  },
  illustration: {
    width: 120,
    height: 120,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 20,
  },
})
