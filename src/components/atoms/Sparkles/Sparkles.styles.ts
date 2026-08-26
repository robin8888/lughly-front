/**
 * Sparkles styles
 */

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  /**
   * La capa se desborda del botón a propósito: las chispas salen **de** él, y
   * si quedaran dentro se leerían como parte del dibujo en vez de como algo
   * que le sale.
   *
   * Los cuatro lados en negativo y no un tamaño fijo, para que siga al botón
   * sea del tamaño que sea.
   */
  layer: {
    position: 'absolute',
    top: -8,
    left: -9,
    right: -9,
    bottom: -8,
  },
  spark: {
    position: 'absolute',
  },
})
