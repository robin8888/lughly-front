/**
 * Avatar Atom
 * Foto de perfil circular, con reserva cuando no hay foto.
 *
 * Estaba sin usar en toda la app y con un contrato que no era el de nadie:
 * pedía `ImageSourcePropType` e iniciales, cuando los avatares reales —Mi
 * cuenta, ficha del profesional, chat y tarjeta del directorio— reciben una
 * ruta del servidor y caen en el icono `user-circle`. Eso lo convertía en
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
  /**
   * Si atiende urgencias ahora mismo. Dibuja el anillo alrededor de la foto:
   * verde si sí, rojo si no. **Sin pasarlo no hay anillo**, que es lo que
   * quiere un cliente —no tiene disponibilidad— y lo que quiere cualquier
   * avatar que no hable de eso.
   */
  available?: boolean
  testID?: string
}

/** Lo que el anillo añade a cada lado: su grosor más el hueco de aire */
const RING_SPACE = 5

export function Avatar({ uri, size = 48, available, testID }: AvatarProps) {
  const box = { width: size, height: size }
  const ringBox = { width: size + RING_SPACE * 2, height: size + RING_SPACE * 2 }

  const circle = (
    <View
      style={[styles.container, box]}
      testID={available === undefined ? testID : undefined}
    >
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

  if (available === undefined) return circle

  /*
    El anillo va en una capa de fuera y no como borde de la foto: pegado se
    confunde con el recorte de la propia imagen, y con el hueco de aire se lee
    como un estado puesto encima. Es el mismo gesto que en el directorio.

    El texto no se pierde para quien escucha la pantalla: va en la etiqueta.
  */
  return (
    <View
      style={[
        styles.ring,
        ringBox,
        available ? styles.ringAvailable : styles.ringUnavailable,
      ]}
      accessible
      accessibilityLabel={available ? 'Disponible ahora' : 'No disponible ahora'}
      testID={testID}
    >
      {circle}
    </View>
  )
}
