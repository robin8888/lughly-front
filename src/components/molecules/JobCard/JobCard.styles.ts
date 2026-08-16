/**
 * JobCard styles
 * Tarjeta de la lista de trabajos (MobileApp.dc.html, `isMisTrabajos`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

const THUMB = 56

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    flexShrink: 0,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  photoCount: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  photoCountText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 9.5,
    color: '#ffffff',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 3,
  },
  type: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  budgetLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.75,
  },
  budget: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  bids: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 6,
  },
  lowest: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  deadline: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },

  requested: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 6,
  },

  /** El cambio de persona: lo único de la tarjeta que pide una decisión */
  substitute: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  substituteText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
  },
  strong: {
    fontFamily: theme.typography.fonts.bodyBold,
  },
  substituteHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 4,
  },
  substituteActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  accept: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: theme.colors.accent700,
  },
  acceptText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardBg,
  },
  reject: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardDivider,
  },
  rejectText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
})
