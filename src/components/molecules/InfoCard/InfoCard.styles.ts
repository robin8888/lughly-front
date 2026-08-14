/**
 * InfoCard styles
 * HOME_MOBILE.md §3 y §5: clara #fdfdfb con texto #1c2b33, oscura #04070f.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    position: 'relative',
    padding: 12,
    /**
     * Cuadrada. `.card` va a radio 0 en el tema industrial (styles.css,
     * línea 291) y además es lo que hace que las marcas de registro de las
     * esquinas funcionen: sobre un radio de 14 px caían justo en la zona que
     * la curva recorta, y quedaban flotando fuera de la tarjeta.
     */
    borderRadius: theme.radius.none,
  },
  light: {
    backgroundColor: theme.colors.cardBg,
  },
  dark: {
    backgroundColor: theme.colors.darkBg,
  },
})
