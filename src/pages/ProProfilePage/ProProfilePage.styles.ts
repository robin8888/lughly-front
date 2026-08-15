/**
 * ProProfilePage styles
 * Cabecera fija y ficha, según MobileApp.dc.html (isPerfil).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

const AVATAR_SIZE = 68

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  headerTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h6,
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },

  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    flexShrink: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  identityText: {
    flex: 1,
  },
  name: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  /** Quién hará el trabajo, bajo el nombre de quien lo contrata */
  worker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.85,
    marginTop: 2,
  },
  trade: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.65,
    marginTop: 2,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },

  headline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rate: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.accent700,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  ratingCount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.6,
  },

  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.55,
    color: theme.colors.text,
    marginBottom: 10,
  },
  completed: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 16,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h6,
    textTransform: 'uppercase',
    color: theme.colors.text,
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.85,
  },
  /** Altura del mapa de cobertura. En el diseño web son 160 px. */
  coverageMap: {
    height: 180,
    marginTop: 10,
  },
  sectionNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.65,
    marginTop: 4,
  },

  pendingCard: {
    marginBottom: 16,
  },
  pendingTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 4,
  },
  pendingBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.8,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  messageButton: {
    marginTop: 8,
  },
  report: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
    textAlign: 'center',
    marginTop: 16,
  },
})
