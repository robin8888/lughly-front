/**
 * PasswordResetPage styles
 * Según MobileApp.dc.html (loginModeForgot / loginModeSent)
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
  /** Aviso circular de la pantalla "Revisa tu correo" */
  badge: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent200,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing[4],
  },
  badgeIcon: {
    fontSize: theme.typography.sizes.h4,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.75,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  code: {
    fontSize: theme.typography.sizes.h3,
    letterSpacing: 8,
    textAlign: 'center',
  },
  success: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.available,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
})
