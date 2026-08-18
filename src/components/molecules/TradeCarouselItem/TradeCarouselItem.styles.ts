/**
 * TradeCarouselItem styles
 * Valores literales de HOME_MOBILE.md §1 ("Estilo de cada tarjeta").
 */

import { StyleSheet } from 'react-native'
import { ITEM_SIZE } from '@/hooks/ui/useCarousel'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    left: '50%',
    top: 40,
    width: ITEM_SIZE,
    alignItems: 'center',
  },
  pressable: {
    alignItems: 'center',
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  /**
   * Blanca y con sombra, sobre la foto de fondo del carrusel.
   *
   * La sombra no es adorno. La etiqueta cae a la altura del césped de la foto,
   * y blanco sobre ese verde da 1,97:1: sin ella no se leería. Con la sombra
   * el texto se recorta contra lo que tenga detrás, sea claro u oscuro, que es
   * lo que se hace siempre con texto sobre una imagen.
   *
   * Ojo: una sombra no es contraste medible. Si algún día hay que pasar una
   * auditoría de accesibilidad con esto, la salida no es retocar la sombra
   * sino oscurecer el velo del carrusel o meter un degradado bajo la fila de
   * etiquetas.
   */
  label: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 19,
    lineHeight: 23,
    marginTop: 8,
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
})
