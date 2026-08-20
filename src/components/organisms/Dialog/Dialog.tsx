/**
 * Dialog Organism
 * El diálogo del sistema: Uhiro, un mensaje y lo que hay que decidir.
 *
 * **Solo para decidir.** Si no hay nada que responder, un diálogo con un único
 * botón de aceptar es un estorbo: eso es un aviso al móvil y el estado en la
 * pantalla que corresponda. Aquí se bloquea la pantalla porque hace falta una
 * respuesta.
 *
 * **Se puede cerrar sin responder**, y es a propósito: quien abre la app para
 * otra cosa tiene derecho a hacerla, y lo que quedó pendiente sigue estando en
 * su sitio. Un diálogo sin salida se acaba respondiendo de cualquier manera con
 * tal de quitarlo de en medio.
 *
 * El tono decide el color: `accent` es el azul de la barra de abajo y `danger`
 * el rojo del anillo de disponibilidad —el de "ahora no", no el de error—, los
 * dos con la misma transparencia que la barra.
 */

import { ReactNode } from 'react'
import { Modal, View, Text, Pressable, Image } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { images } from '@/images'
import { styles } from './Dialog.styles'

export type DialogTone = 'accent' | 'danger'

export interface DialogAction {
  label: string
  onPress: () => void
  /** El que resuelve va relleno; el otro, contorno */
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  testID?: string
}

export interface DialogProps {
  visible: boolean
  title: string
  message?: string
  tone?: DialogTone
  /** Lo que haya que rellenar antes de responder, si lo hay */
  children?: ReactNode
  actions: DialogAction[]
  /** Cerrar sin responder: el botón de atrás del móvil y el toque fuera */
  onDismiss: () => void
  testID?: string
}

export function Dialog({
  visible,
  title,
  message,
  tone = 'accent',
  children,
  actions,
  onDismiss,
  testID,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/*
        El fondo oscuro cierra al tocarlo, que es lo que todo el mundo intenta
        primero. La tarjeta no: un toque dentro no debe cerrar lo que se está
        leyendo.
      */}
      <Pressable style={styles.backdrop} onPress={onDismiss} testID={testID}>
        <Pressable
          style={[styles.card, tone === 'danger' ? styles.danger : styles.accent]}
          onPress={() => {}}
        >
          <Image
            source={images.pulgar}
            style={styles.illustration}
            resizeMode="contain"
            accessibilityLabel=""
          />

          <Text style={styles.title}>{title}</Text>
          {message && <Text style={styles.message}>{message}</Text>}

          {children}

          <View style={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action.label}
                fullWidth
                variant={action.variant ?? 'primary'}
                disabled={action.disabled}
                onPress={action.onPress}
                testID={action.testID}
              >
                {action.label}
              </Button>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
