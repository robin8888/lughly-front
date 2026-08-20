/**
 * ProFeedCard styles — PROPUESTA, 20 Agosto 2026.
 *
 * Mismo reparto que `ProDirectoryCard.styles.ts` —los mismos nombres y los
 * mismos sitios— para que comparar sea comparar el aspecto y no el orden de
 * las cosas. Los valores salen de `@/theme/feed`, que es la propuesta; del
 * tema de la app solo se toman las fuentes, que no cambian.
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
  /** Se sombrea al tocarla: es lo que hace que se sienta pulsable entera */
  cardPressed: {
    backgroundColor: feed.colors.subtle,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  /**
   * El anillo de disponibilidad, alrededor de la cara.
   *
   * Es un aro con un hueco de aire por dentro y no un borde pegado a la foto:
   * pegado se confunde con el recorte de la propia imagen, y con el hueco se
   * lee como un estado puesto encima.
   */
  avatarRing: {
    borderRadius: feed.radius.pill,
    borderWidth: 2,
    padding: 2,
    flexShrink: 0,
  },
  ringAvailable: {
    borderColor: feed.colors.available,
  },
  ringUnavailable: {
    borderColor: feed.colors.unavailable,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: feed.radius.pill,
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: feed.colors.subtle,
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
  /** Sin `uppercase`: en caja alta el nombre de una persona suena a rótulo */
  name: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 16,
    color: feed.colors.text,
  },
  worker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
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
  distance: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: feed.colors.textSoft,
    marginTop: 3,
  },

  numbers: {
    alignItems: 'flex-end',
  },
  rate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 15,
    color: feed.colors.accent,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  star: {
    fontSize: 13,
    color: feed.colors.star,
  },
  rating: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: feed.colors.text,
  },
  reviews: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: feed.colors.textSoft,
    marginTop: 2,
  },

  /** La tira, igual que ahora: todas del mismo tamaño y cuadradas de forma */
  photos: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
  photo: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: feed.colors.subtle,
  },
  photoMore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoMoreText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14,
    color: feed.colors.textSoft,
  },

  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: feed.colors.text,
    marginTop: 10,
  },
  alsoDoes: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: feed.colors.textSoft,
    marginTop: 8,
  },

  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 10,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.accentSoft,
  },
  tagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11,
    /* El oscuro: sobre el fondo pálido del distintivo, el claro no se lee */
    color: feed.colors.accentStrong,
  },
})
