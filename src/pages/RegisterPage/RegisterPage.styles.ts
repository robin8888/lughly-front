/**
 * RegisterPage styles
 * Según MobileApp.dc.html (STACK: REGISTRO)
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  consentBox: {
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing[3],
  },
  consentText: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
  },
  consentSecondary: {
    opacity: 0.85,
  },
  link: {
    color: theme.colors.accent600,
  },
  strong: {
    fontFamily: theme.typography.fonts.bodyBold,
  },
  consentError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
  /** Dos caras del documento, una al lado de la otra (como en el diseño) */
  documentRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  documentSlot: {
    flex: 1,
  },
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
