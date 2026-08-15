/**
 * ForcePasswordPage styles
 * Mismo aire que el resto de pantallas de acceso: el marco lo pone AuthShell.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  submit: {
    marginTop: theme.spacing[2],
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: theme.spacing[3],
  },
  logout: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    textAlign: 'center',
    color: theme.colors.accent600,
    marginTop: theme.spacing[4],
  },
})
