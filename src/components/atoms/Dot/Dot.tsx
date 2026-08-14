/**
 * Dot Atom
 * Indicador circular (notificaciones, estado, etc.)
 */

import { View, ViewStyle } from 'react-native'
import { styles, colorStyles } from './Dot.styles'

export type DotColor = 'accent' | 'success' | 'warning' | 'error' | 'neutral'

export interface DotProps {
  color?: DotColor
  size?: number
  style?: ViewStyle
  testID?: string
}

export function Dot({ color = 'accent', size = 8, style, testID }: DotProps) {
  return (
    <View
      style={[
        styles.base,
        colorStyles[color],
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      testID={testID}
    />
  )
}
