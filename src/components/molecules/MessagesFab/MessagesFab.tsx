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
 *
 * **Avisa de lo que hay sin leer** con la chapa roja de siempre. Es la
 * convención de cualquier app de mensajes, y aquí importa más que en otras: el
 * chat es donde el cliente pregunta si el fontanero llega, así que un mensaje
 * que se queda sin ver cuesta un trabajo. Sin la chapa había que entrar a la
 * bandeja para descubrir que te habían escrito.
 */

import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '@/components/atoms/Icon'
import { BADGE_MAX, styles } from './MessagesFab.styles'

export interface MessagesFabProps {
  onPress: () => void
  /** Mensajes sin leer. Cero o sin dato, sin chapa. */
  unread?: number
  testID?: string
}

export function MessagesFab({ onPress, unread = 0, testID }: MessagesFabProps) {
  const insets = useSafeAreaInsets()
  const hayPendientes = unread > 0

  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, { bottom: 88 + insets.bottom }]}
      accessibilityRole="button"
      /*
        La cifra va en la etiqueta y no solo en la chapa: un lector de pantalla
        no ve el círculo rojo, y "Mensajes" a secas no diría lo único que ha
        cambiado en el botón.
      */
      accessibilityLabel={
        hayPendientes
          ? `Mensajes, ${unread} sin leer`
          : 'Mensajes'
      }
      testID={testID ?? 'messages-fab'}
    >
      <Icon name="message" size={24} color="#ffffff" strokeWidth={1.8} />

      {hayPendientes && (
        <View
          style={styles.badge}
          /*
            Ya lo dice la etiqueta del botón. Sin esto, un lector de pantalla
            leería el número dos veces: "Mensajes, 3 sin leer. 3".
          */
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          testID={testID ? `${testID}-badge` : 'messages-fab-badge'}
        >
          <Text style={styles.badgeText} numberOfLines={1}>
            {/*
              A partir de cierto número da igual cuántos son: lo que dice la
              chapa es "tienes conversaciones esperando", y tres cifras dentro
              de un círculo de veinte píxeles no se leen.
            */}
            {unread > BADGE_MAX ? `${BADGE_MAX}+` : unread}
          </Text>
        </View>
      )}
    </Pressable>
  )
}
