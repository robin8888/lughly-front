/**
 * Chevron Atom
 * Punta de flecha de 14 px para los controles del carrusel.
 *
 * Dibujada con dos bordes de un cuadrado girado 45°: el proyecto no tiene
 * librería de SVG y añadir una para dos triángulos no compensa.
 */

import { View } from 'react-native'
import { theme } from '@/theme'

export type ChevronDirection = 'left' | 'right'

export interface ChevronProps {
  direction: ChevronDirection
  size?: number
  color?: string
  thickness?: number
  testID?: string
}

export function Chevron({
  direction,
  size = 14,
  color = theme.colors.text,
  thickness = 2,
  testID,
}: ChevronProps) {
  const side = size * 0.62

  return (
    <View
      testID={testID}
      style={{
        width: side,
        height: side,
        borderColor: color,
        borderTopWidth: thickness,
        borderRightWidth: direction === 'right' ? thickness : 0,
        borderLeftWidth: direction === 'left' ? thickness : 0,
        transform: [
          { rotate: direction === 'right' ? '45deg' : '-45deg' },
          // Compensa el hueco que deja la rotación respecto al centro óptico
          { translateX: direction === 'right' ? -side * 0.15 : side * 0.15 },
        ],
      }}
    />
  )
}
