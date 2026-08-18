/**
 * Avatar Atom
 * Foto de perfil circular, con reserva cuando no hay foto.
 *
 * Estaba sin usar en toda la app y con un contrato que no era el de nadie:
 * pedía `ImageSourcePropType` e iniciales, cuando los cuatro avatares reales
 * —Mi cuenta, ficha del profesional, pujas y tarjeta del directorio— reciben
 * una ruta del servidor y caen en el icono `user-circle`. Eso lo convertía en
 * una trampa: quien lo adoptara se llevaba otra reserva distinta.
 *
 * Ahora hace lo que ya hacían ellos, y el tamaño es un número en vez de tres
 * nombres, porque cada sitio lo pide distinto (22, 30, 44, 68…).
 */

import { View, Image } from 'react-native'
import { Icon } from '@/components/atoms/Icon'
import { theme } from '@/theme'
import { styles } from './Avatar.styles'

/** Proporción del icono de reserva dentro del círculo */
const ICON_RATIO = 0.6

export interface AvatarProps {
  /**
   * URI ya montada y lista para pedir. El servidor devuelve `avatarUrl` como
   * ruta relativa, así que el prefijo lo pone quien llama —igual que en el
   * resto de la app— y no este átomo, que no sabe de API.
   */
  uri?: string | null
  /** Lado del círculo, en puntos */
  size?: number
  testID?: string
}

export function Avatar({ uri, size = 48, testID }: AvatarProps) {
  const box = { width: size, height: size }

  return (
    <View style={[styles.container, box]} testID={testID}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Icon
          name="user-circle"
          size={Math.round(size * ICON_RATIO)}
          color={theme.colors.accent700}
        />
      )}
    </View>
  )
}
