/**
 * TradesCarousel styles
 * Valores literales de HOME_MOBILE.md §1.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  section: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    // Va sobre el fondo claro de la página, así que el accent700 del diseño
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  viewport: {
    position: 'relative',
    /**
     * 40 (top de la tarjeta) + 345 (imagen) + 8 + 20 (etiqueta) = 413, más
     * holgura para una etiqueta de dos líneas. El diseño decía 410 con la
     * imagen a 300; sube con ella.
     */
    height: 455,
    overflow: 'hidden',
  },

  /**
   * Capa que se arrastra con el dedo. Ocupa todo el viewport para que el
   * gesto se pueda empezar en cualquier punto, no solo sobre una tarjeta.
   */
  dragLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /*
   * Velos laterales desenfocados, retirados el 14 Agosto 2026.
   * Se conservan por si se recuperan; ver el comentario en el componente.
   *
   * Cubrían solo los extremos, donde únicamente se ven las tarjetas
   * laterales: la central quedaba fuera y por eso se veía siempre nítida.
   * La capa interior era más estrecha y suave para que el borde del
   * desenfoque no se notase como una línea recta.
   *
   * veil:            { position: 'absolute', top: 0, bottom: 0, zIndex: 20 },
   * veilLeftOuter:   { left: 0,  width: 40 },
   * veilLeftInner:   { left: 40, width: 26 },
   * veilRightOuter:  { right: 0,  width: 40 },
   * veilRightInner:  { right: 40, width: 26 },
   */
  arrows: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
