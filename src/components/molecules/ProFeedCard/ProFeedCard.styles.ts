/**
 * ProFeedCard styles — PROPUESTA, 20 Agosto 2026.
 *
 * Todo sale de `@/theme/feed`, que es la propuesta, y nada de `@/theme`: así
 * se ve de un vistazo qué depende de lo nuevo, y adoptar o descartar es mover
 * un fichero o borrarlo.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'
import { feed } from '@/theme/feed'

export const styles = StyleSheet.create({
  card: {
    backgroundColor: feed.colors.bg,
    borderRadius: feed.radius.card,
    padding: feed.space.inset,
    marginBottom: feed.space.cards,
    ...feed.shadow,
  },
  /** Se hunde un poco al tocarla, que es lo que hace que se sienta pulsable */
  cardPressed: {
    backgroundColor: feed.colors.subtle,
  },

  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: feed.space.between,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  identity: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 17,
    color: feed.colors.text,
  },
  verified: {
    width: 16,
    height: 16,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedMark: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 10,
    lineHeight: 13,
    color: feed.colors.onAccent,
  },
  worker: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: feed.colors.textSoft,
    marginTop: 1,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: feed.colors.textSoft,
    marginTop: 2,
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    fontSize: 13,
    color: feed.colors.star,
  },
  ratingValue: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14,
    color: feed.colors.text,
  },

  /** Píldora verde, y solo cuando lo está: lo que no se dice no ocupa sitio */
  available: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: feed.space.between,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.availableSoft,
  },
  availableDot: {
    width: 7,
    height: 7,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.available,
  },
  availableText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12,
    color: feed.colors.available,
  },

  cover: {
    marginTop: feed.space.between,
    borderRadius: feed.radius.photo,
    overflow: 'hidden',
    backgroundColor: feed.colors.subtle,
    /** 16:9. Ancha y no cuadrada: cabe la habitación entera, no un rincón */
    aspectRatio: 16 / 9,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverMore: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: feed.radius.pill,
    backgroundColor: 'rgba(17, 20, 23, 0.72)',
  },
  coverMoreText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12,
    color: '#ffffff',
  },

  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: feed.colors.text,
    marginTop: feed.space.between,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: feed.space.gap,
    marginTop: feed.space.between,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.subtle,
  },
  chipText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: feed.colors.textSoft,
  },

  foot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: feed.space.inset,
    paddingTop: feed.space.between,
    borderTopWidth: 1,
    borderTopColor: feed.colors.hairline,
  },
  rate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 17,
    color: feed.colors.text,
  },
  reviews: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: feed.colors.textSoft,
    marginTop: 1,
  },
  /**
   * La única acción en azul de toda la tarjeta. No es un `Button` del sistema
   * a propósito: los de ahora son rectangulares y llenos, y aquí hace falta
   * una píldora.
   */
  action: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.accent,
  },
  actionText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14,
    color: feed.colors.onAccent,
  },
})
