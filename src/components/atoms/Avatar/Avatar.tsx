/**
 * Avatar Atom
 * Imagen de perfil circular sin lógica de negocio
 */

import { View, Image, Text, ImageSourcePropType } from 'react-native'
import { styles } from './Avatar.styles'

export type AvatarSize = 'small' | 'medium' | 'large'

export interface AvatarProps {
  source?: ImageSourcePropType
  size?: AvatarSize
  initials?: string
  testID?: string
}

export function Avatar({
  source,
  size = 'medium',
  initials,
  testID,
}: AvatarProps) {
  const sizeStyles = styles[size]

  if (source) {
    return (
      <View style={[styles.container, sizeStyles]} testID={testID}>
        <Image source={source} style={styles.image} />
      </View>
    )
  }

  // Fallback con iniciales
  return (
    <View
      style={[styles.container, styles.fallback, sizeStyles]}
      testID={testID}
    >
      <Text style={[styles.initials, styles[`${size}Text` as keyof typeof styles]]}>
        {initials || '?'}
      </Text>
    </View>
  )
}
