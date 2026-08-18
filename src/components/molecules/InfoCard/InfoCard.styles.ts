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
  /**
   * Contorno azul, en el `accent` de la marca.
   *
   * El diseño sí pone borde a las tarjetas —`.card` lleva un
   * `1px solid var(--color-divider)` en styles.css línea 292—, pero esta
   * implementación lo había perdido, y sin él una tarjeta `#fdfdfb` sobre la
   * página `#f2f2f3` se distinguía por tres puntos de gris: en la práctica, no
   * se veía dónde empezaba y acababa cada una.
   *
   * Se usa `accent` y no el `accent700` de los botones rellenos: ese es oscuro
   * porque tiene que sostener texto blanco encima, y aquí no sostiene nada. A
   * 3,71:1 contra el fondo de la página el contorno se ve de sobra —WCAG
   * 1.4.11 pide 3:1 para el contorno de un elemento— sin que cada tarjeta
   * parezca enmarcada a lápiz grueso.
   */
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  light: {
    backgroundColor: theme.colors.cardBg,
  },
  dark: {
    backgroundColor: theme.colors.darkBg,
  },
})
