/**
 * PublishPage styles
 * Formulario de publicar, según MobileApp.dc.html (`isPublicar`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  kicker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.66,
    color: theme.colors.accent700,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    gap: 4,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  urgent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(163, 69, 58, 0.25)',
    backgroundColor: 'rgba(163, 69, 58, 0.07)',
  },
  urgentText: {
    flex: 1,
  },
  urgentTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  urgentBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 2,
  },
  urgentArrow: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.urgency,
  },

  modes: {
    flexDirection: 'row',
    gap: 6,
  },
  mode: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  modeActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  modeText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  modeTextActive: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.accent700,
  },
  modeHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 12,
  },

  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  surcharges: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 12,
  },
  submit: {
    marginTop: 14,
  },
  draftNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 10,
  },
})
