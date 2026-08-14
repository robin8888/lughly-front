/**
 * LoginPage styles
 * La tarjeta y la marca viven en AuthShell; aquí solo lo propio del login.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  submit: {
    marginTop: theme.spacing[2],
  },
  footer: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    textAlign: 'center',
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: theme.spacing[4],
  },
  footerLink: {
    color: theme.colors.accent600,
  },
})
