/**
 * TradesCarousel styles
 * Valores literales de HOME_MOBILE.md §1.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

/**
 * Opacidad del velo sobre la foto de fondo.
 *
 * Bajo, porque el trabajo pesado lo hace ahora el desenfoque: la foto va
 * horneada con un desenfoque gaussiano, así que el detalle ya no compite con
 * las tarjetas. Lo que queda por hacer es rebajar un poco la saturación —el
 * cielo y el césped son muy vivos— para que las hormigas, que son claras, no
 * se pierdan encima.
 *
 * Es el color de la página, no un blanco cualquiera: así el fondo del carrusel
 * se lee como una variación de la pantalla y no como un parche.
 *
 * Este es el número que hay que tocar si la foto se ve apagada o demasiado
 * presente. A 0 desaparece el velo y queda solo el desenfoque.
 */
const VEIL_OPACITY = 0.2

export const styles = StyleSheet.create({
  /**
   * Sin padding: lo lleva el viewport como margen.
   *
   * Es lo que permite que la foto llegue de borde a borde. Con el padding aquí,
   * una capa absoluta se quedaría dentro de él y el fondo saldría enmarcado con
   * 16 px de página a cada lado, como un cuadro colgado.
   */
  section: {
    position: 'relative',
  },
  /** La foto, tapando la sección entera por debajo de todo */
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bg,
    opacity: VEIL_OPACITY,
  },
  viewport: {
    // Antes eran el padding de la sección; como margen dejan el fondo libre
    marginTop: 20,
    marginHorizontal: 16,
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
