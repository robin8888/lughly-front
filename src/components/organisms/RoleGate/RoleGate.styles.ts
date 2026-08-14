/**
 * RoleGate styles
 * Tarjeta centrada, según MobileApp.dc.html (`isPublicarDenied`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.colors.bg,
  },
  card: {
    width: '100%',
    alignItems: 'stretch',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: theme.colors.cardText,
    marginBottom: 8,
  },
  message: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.55,
    textAlign: 'center',
    color: theme.colors.cardText,
    opacity: 0.8,
    marginBottom: 14,
  },
  action: {
    marginTop: 6,
  },
  unavailable: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    textAlign: 'center',
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 10,
  },
})
