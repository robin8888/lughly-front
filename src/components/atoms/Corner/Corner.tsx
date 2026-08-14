/**
 * Corner Atom
 * Marca de registro del sistema blueprint: una cruz centrada en la esquina
 * de la tarjeta, como las marcas de corte de una imprenta.
 *
 * Se dibuja con dos vistas cruzadas —una vertical y otra horizontal— porque
 * en CSS son dos pseudoelementos y en React Native no existen.
 *
 * Uso: `<Corner position="tl" />` dentro de un contenedor **sin**
 * `overflow: hidden`, ya que la marca sobresale 6 px de la caja.
 */

import { View } from 'react-native'
import { CORNER_LIGHT, positionStyles, styles } from './Corner.styles'

export type CornerPosition = 'tl' | 'tr' | 'bl' | 'br'

export interface CornerProps {
  position: CornerPosition
  color?: string
  testID?: string
}

export function Corner({ position, color = CORNER_LIGHT, testID }: CornerProps) {
  return (
    <View
      style={[styles.base, positionStyles[position]]}
      testID={testID}
      pointerEvents="none"
    >
      <View style={[styles.vertical, { backgroundColor: color }]} />
      <View style={[styles.horizontal, { backgroundColor: color }]} />
    </View>
  )
}
