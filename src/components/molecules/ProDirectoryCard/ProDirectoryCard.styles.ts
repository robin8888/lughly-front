/**
 * ProDirectoryCard styles
 * Según MobileApp.dc.html (isProfesionales): avatar de 44px, distintivo
 * verde de disponibilidad y tarifa en color de acento.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    flexShrink: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 15.5,
    textTransform: 'uppercase',
    color: theme.colors.cardText,
  },
  /**
   * El trabajador, bajo el nombre del empleador. Va en semibold y sin
   * mayúsculas: se lee como una segunda línea de la identidad, no como otro
   * titular que compita con el de arriba.
   */
  worker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 1,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 2,
  },
  distance: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 3,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.cardDivider,
  },
  badgeAvailable: {
    backgroundColor: 'rgba(63, 143, 90, 0.14)',
    borderColor: 'rgba(63, 143, 90, 0.45)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(28, 43, 51, 0.3)',
  },
  dotAvailable: {
    backgroundColor: theme.colors.available,
  },
  badgeText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 11,
    color: theme.colors.cardText,
    opacity: 0.75,
  },
  badgeAvailableText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 11,
    color: '#2f6f45',
  },
  numbers: {
    alignItems: 'flex-end',
  },
  rate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14.5,
    color: theme.colors.accent,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  star: {
    fontSize: 13,
    color: theme.colors.rating,
  },
  rating: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: theme.colors.cardText,
  },
  reviews: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },
  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 6,
  },
  /** Tira de fotos de sus trabajos, todas del mismo tamaño */
  photos: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  photo: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: theme.colors.accent100,
    // Cuadradas, como el resto del tema industrial
    borderRadius: theme.radius.none,
  },
  photoMore: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  photoMoreText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },

  /** Los otros oficios, en texto y con su precio: son datos, no insignias */
  alsoDoes: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12.5,
    lineHeight: 12.5 * 1.45,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },
  tag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  tagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11,
    color: theme.colors.accent700,
  },
})
