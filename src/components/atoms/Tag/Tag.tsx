/**
 * Tag Atom
 * Etiqueta/distintivo sin lógica de negocio
 */

import { Text, View, ViewStyle, TextStyle } from 'react-native'
import { styles, variantStyles, textVariantStyles } from './Tag.styles'

export type TagVariant = 'accent' | 'accent2' | 'neutral' | 'outline' | 'available' | 'urgency'

export interface TagProps {
  children: React.ReactNode
  variant?: TagVariant
  style?: ViewStyle
  textStyle?: TextStyle
  testID?: string
}

export function Tag({
  children,
  variant = 'accent',
  style,
  textStyle,
  testID,
}: TagProps) {
  return (
    <View
      style={[styles.base, variantStyles[variant], style]}
      testID={testID}
    >
      <Text style={[styles.text, textVariantStyles[variant], textStyle]}>
        {children}
      </Text>
    </View>
  )
}
