/**
 * HomePage styles
 *
 * Fondo claro, igual que la home del profesional y que el resto de la app.
 *
 * HOME_MOBILE.md especifica #04070f para esta pantalla, pero el fondo oscuro
 * la dejaba como la única pantalla negra de la aplicación: se entraba desde
 * el directorio o la ficha, ambos claros, y el salto se notaba. Las secciones
 * 03 y 05 siguen siendo tarjetas oscuras, así que la alternancia clara/oscura
 * que usa el diseño para separar bloques se mantiene.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /**
   * Navy, el mismo del hero, y no el claro de la app.
   *
   * El hero y la escena ocupan de canto a canto y llegan casi hasta abajo; lo
   * que quedaba debajo era una franja blanca entre la ilustración y la barra,
   * que partía la pantalla en dos justo donde no hay contenido. Con el fondo
   * del hero, la pantalla entera es un solo bloque de color y la escena flota
   * dentro de él.
   *
   * Es además lo que hace que la barra de abajo se lea como cristal: es el
   * mismo navy al 78 % sobre este navy, así que se funde con la pantalla en
   * vez de recortarse contra un blanco.
   */
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.accent900,
  },
  content: {
    paddingBottom: 88,
  },
})
