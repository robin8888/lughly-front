/**
 * PlusIcon styles
 *
 * Una sola regla, y es la que arregla el fallo: el lienzo se pega a los cuatro
 * lados del cuadro que lo contiene. Así el centro del dibujo es el centro de la
 * celda, sin depender de que nadie lo centre desde fuera.
 *
 * Los cuatro lados escritos a mano porque `StyleSheet.absoluteFillObject` no
 * está en los tipos de esta versión.
 */

import { StyleSheet } from 'react-native'

export const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
})
