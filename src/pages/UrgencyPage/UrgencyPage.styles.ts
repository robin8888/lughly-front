/**
 * UrgencyPage styles
 * Cabecera en rojo de urgencia, según MobileApp.dc.html (`isUrgencia`).
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
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    // El rojo del diseño: esta pantalla no se abre por gusto
    color: theme.colors.urgency,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  intro: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.55,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 14,
  },
  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  shareLink: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    textDecorationLine: 'underline',
    marginTop: 6,
  },
  shareNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 5,
  },
  shareError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginTop: 5,
  },
  alternative: {
    marginTop: 10,
    marginBottom: 4,
  },
  surcharge: {
    marginTop: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(163, 69, 58, 0.25)',
    backgroundColor: 'rgba(163, 69, 58, 0.07)',
  },
  surchargeTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 4,
  },
  surchargeBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.text,
    opacity: 0.85,
  },
  submit: {
    marginTop: 14,
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.65,
    textAlign: 'center',
    marginTop: 10,
  },
})
