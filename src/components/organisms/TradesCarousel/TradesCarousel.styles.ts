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
    // Mismo tono que "03 · Subasta inversa": accent700 no se lee sobre #04070f
    color: theme.colors.accent400,
    marginBottom: 10,
  },
  viewport: {
    position: 'relative',
    height: 410,
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

  /**
   * Velos laterales desenfocados.
   *
   * La tarjeta central mide 300 px y va centrada, así que ocupa la franja
   * media. Los velos cubren solo los extremos, donde solo se ven las
   * laterales: la central nunca queda debajo y por eso se ve siempre nítida.
   *
   * La capa interior es más estrecha y suave para que el borde del
   * desenfoque no se note como una línea recta.
   */
  veil: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  veilLeftOuter: {
    left: 0,
    width: 52,
  },
  veilLeftInner: {
    left: 52,
    width: 34,
  },
  veilRightOuter: {
    right: 0,
    width: 52,
  },
  veilRightInner: {
    right: 52,
    width: 34,
  },
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
