/**
 * TradeBanner styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /*
    Cuadrado y a todo el ancho, la misma forma que la ilustración: así la
    llena de borde a borde sin recortarle nada y sin dejar hueco a los lados.

    Pasó por dos formas antes. Franja con `cover`: llenaba, pero ampliaba el
    dibujo hasta que solo cabía la cabeza. Franja con `contain`: no recortaba,
    pero dejaba media franja de fondo vacío a cada lado. Un cuadrado es lo
    único que cumple las dos cosas, y cuesta lo que cuesta: media pantalla
    antes de la primera ficha.
  */
  banner: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    backgroundColor: theme.colors.accent100,
  },
  /*
    La imagen ocupa el flujo al 100 % y no va en absoluto: con
    `position: absolute` y los cuatro lados a 0 el `Image` no recibe medida y
    se pinta a su tamaño real —640 px dentro de una caja de 343—, con lo que
    el `overflow: hidden` recorta y solo se ve una esquina.
  */
  image: {
    width: '100%',
    height: '100%',
  },
  /*
    El nombre vuelve a ir encima del dibujo, que ahora llega hasta el borde de
    abajo. Banda opaca y no un degradado: un degradado necesita
    `expo-linear-gradient`, y sobre dieciocho ilustraciones distintas —unas
    claras, otras con escena de fondo— solo un fondo sólido garantiza que se
    lea siempre igual.
  */
  labelBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(29, 45, 61, 0.78)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  label: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h6,
    color: '#ffffff',
  },
})
