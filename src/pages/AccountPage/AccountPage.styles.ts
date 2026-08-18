/**
 * AccountPage styles
 * Según MobileApp.dc.html (isCuenta).
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
    paddingBottom: 14,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  content: {
    paddingHorizontal: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  identityCard: {
    padding: 14,
    marginBottom: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  email: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },
  photoAction: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent600,
    marginTop: 4,
  },
  roleTag: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  roleTagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  /** Falta el documento: no es un pendiente, es algo que le bloquea */
  missing: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 8,
  },
  pending: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 10,
  },
  modes: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  mode: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  modeActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  modeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },
  modeTextActive: {
    color: theme.colors.accent700,
    opacity: 1,
  },
  passwordCard: {
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h6,
    textTransform: 'uppercase',
    color: theme.colors.cardText,
    marginBottom: 10,
  },
  formError: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.error,
    marginBottom: 10,
  },
  saveButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  saveButtonText: {
    fontSize: 14,
  },
  links: {
    gap: 2,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  linkLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  linkDisabled: {
    opacity: 0.45,
  },
  chevron: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.4,
  },
  soon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.45,
  },
  logout: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
})
