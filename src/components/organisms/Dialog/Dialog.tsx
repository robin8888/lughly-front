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
 *
 * **Con teclado abierto se comporta distinto**, y hace falta: cuando el
 * diálogo pide escribir algo, el teclado tapa los botones y lo primero que uno
 * hace es tocar fuera para quitárselo. Si eso cerrara el diálogo, se perdería
 * lo escrito justo al terminar de escribirlo. Así que mientras el teclado está
 * arriba, tocar fuera **solo lo baja**; el segundo toque ya cierra.
 */

import { ReactNode, useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  Pressable,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
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
  const [keyboardUp, setKeyboardUp] = useState(false)

  useEffect(() => {
    /*
      `Did` y no `Will`: en Android solo existen los `Did`, y usar distintos
      eventos en cada sistema haría que el diálogo se comportara distinto según
      el móvil.
    */
    const shown = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true))
    const hidden = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false))

    return () => {
      shown.remove()
      hidden.remove()
    }
  }, [])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      {/*
        El fondo oscuro cierra al tocarlo, que es lo que todo el mundo intenta
        primero —salvo con el teclado arriba, que entonces solo lo baja—. La
        tarjeta no cierra: un toque dentro no debe tirar lo que se está
        leyendo o escribiendo.
      */}
      <Pressable
        style={styles.backdrop}
        onPress={() => (keyboardUp ? Keyboard.dismiss() : onDismiss())}
        testID={testID}
      >
        {/*
          Que el teclado no se coma los botones: sin esto, quien escribe el
          motivo no llega a "Enviar" sin bajarlo antes a mano.
        */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centered}
        >
          <Pressable
            style={[styles.card, tone === 'danger' ? styles.danger : styles.accent]}
            /* Tocar dentro baja el teclado, que es lo que se intenta primero */
            onPress={Keyboard.dismiss}
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
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  )
}
