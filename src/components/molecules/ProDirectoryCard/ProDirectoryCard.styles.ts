/**
 * ProDirectoryCard styles
 *
 * **Rediseñados el 20 Agosto 2026**: tarjeta blanca redondeada sin marco ni
 * cuadrícula, nombres sin mayúsculas, fotos con las esquinas redondeadas y la
 * disponibilidad en un anillo alrededor de la cara. El reparto de las piezas
 * no cambió.
 */

import { Dimensions, StyleSheet } from 'react-native'
import { theme } from '@/theme'

/**
 * El lado de cada miniatura de la tira.
 *
 * Medido y no `flex: 1`: con `flex` cada foto ocupaba lo que le tocara del
 * ancho, así que una sola salía enorme y cinco salían pequeñas, y dos tarjetas
 * seguidas no se parecían en nada. Se fija el tamaño que tienen cuando están
 * las cinco —cuatro fotos más el "+N"— y así todas las tarjetas se leen igual.
 *
 * La cuenta: el ancho de la pantalla menos el margen de la página (16 a cada
 * lado) y el relleno de la tarjeta (14 a cada lado), menos los cuatro huecos
 * de 5, repartido entre cinco.
 */
const STRIP_SIZE = Math.floor(
  (Dimensions.get('window').width - 32 - 28 - 4 * 5) / 5,
)

export const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.card,
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.card,
  },
  /** Se sombrea al tocarla: es lo que hace que se sienta pulsable entera */
  /**
   * Apagada: se ve pero no se toca. Medio velo y no invisible, para que se
   * entienda que sigue existiendo y solo que ahora no vale.
   */
  cardDisabled: {
    opacity: 0.55,
  },
  disabledNote: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.pendingText,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.pendingSoft,
  },
  cardPressed: {
    backgroundColor: theme.colors.surfaceSoft,
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
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    padding: 2,
    flexShrink: 0,
  },
  ringAvailable: {
    borderColor: theme.colors.available,
  },
  ringUnavailable: {
    borderColor: theme.colors.unavailable,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    flexShrink: 0,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSoft,
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
    color: theme.colors.cardText,
  },
  worker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 1,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: theme.colors.textSoft,
    marginTop: 2,
  },
  distance: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textSoft,
    marginTop: 3,
  },

  numbers: {
    alignItems: 'flex-end',
  },
  rate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 15,
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
    color: theme.colors.textSoft,
    marginTop: 2,
  },

  /** La tira, igual que ahora: todas del mismo tamaño y cuadradas de forma */
  photos: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 10,
  },
  photo: {
    width: STRIP_SIZE,
    height: STRIP_SIZE,
    borderRadius: theme.radius.photo,
    backgroundColor: theme.colors.surfaceSoft,
  },
  photoMore: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoMoreText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14,
    color: theme.colors.textSoft,
  },

  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.cardText,
    marginTop: 10,
  },
  alsoDoes: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.textSoft,
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
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent100,
  },
  tagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11,
    /* El oscuro: sobre el fondo pálido del distintivo, el claro no se lee */
    color: theme.colors.accent700,
  },
})
