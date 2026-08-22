/**
 * MessagesFab Molecule
 * Botón flotante a Mensajes, en las dos homes.
 *
 * Vivía como una fila más de "Mi cuenta" (22 Agosto 2026), a la misma
 * profundidad que "Cambiar contraseña" o "Notificaciones", cuando es lo único
 * de esa lista que espera respuesta de otra persona. Se saca a la home, que es
 * donde se entra todos los días, y se le da la forma con la que ya se
 * reconoce un chat en cualquier otra app.
 *
 * Redondo y no una fila, para no repetir la píldora de abajo ni competir con
 * el resto de la pantalla: solo se lee como lo que es, un atajo aparte.
 */

import { Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/components/atoms/Icon'
import { styles } from './MessagesFab.styles'

export interface MessagesFabProps {
  onPress: () => void
  testID?: string
}

export function MessagesFab({ onPress, testID }: MessagesFabProps) {
  const insets = useSafeAreaInsets()

  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, { bottom: 88 + insets.bottom }]}
      accessibilityRole="button"
      accessibilityLabel="Mensajes"
      testID={testID ?? 'messages-fab'}
    >
      <Icon name="message" size={24} color="#ffffff" strokeWidth={1.8} />
    </Pressable>
  )
}
