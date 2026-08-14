/**
 * LoadingOverlay Organism
 * Velo de carga a pantalla completa, según Home.dc.html.
 *
 * Se usa para esperas que bloquean de verdad (subir documentos, adjudicar un
 * trabajo, pagar). Para el resto —listas, botones— hay opciones mejores:
 * `Skeleton` en las listas y el `loading` del propio `Button`. Tapar la
 * pantalla por cada petición hace que la app se sienta lenta.
 */

import { useEffect, useRef } from 'react'
import { Animated, Modal, Text, View, Image, Easing } from 'react-native'
import { BlurView } from 'expo-blur'
import { Spinner } from '@/components/atoms/Spinner'
import { images } from '@/images'
import { styles } from './LoadingOverlay.styles'

const FADE_DURATION_MS = 200

export interface LoadingOverlayProps {
  visible: boolean
  /** Qué está pasando. Ayuda a que la espera no parezca un cuelgue. */
  message?: string
  testID?: string
}

export function LoadingOverlay({
  visible,
  message,
  testID,
}: LoadingOverlayProps) {
  // El diseño abre con `animation: loader-fade .2s ease`
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: FADE_DURATION_MS,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start()
  }, [visible, opacity])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      // Sin escape con el botón atrás: si tapamos la pantalla es porque hay
      // una operación en curso que no debe interrumpirse a medias.
      onRequestClose={() => {}}
    >
      <Animated.View style={[styles.overlay, { opacity }]} testID={testID}>
        <BlurView intensity={30} tint="dark" style={styles.veil} />
        <View style={styles.veil} pointerEvents="none" />

        <Image
          source={images.loader}
          style={styles.mascot}
          resizeMode="contain"
          accessibilityLabel="Cargando"
        />

        <Spinner testID={testID ? `${testID}-spinner` : undefined} />

        {message && <Text style={styles.message}>{message}</Text>}
      </Animated.View>
    </Modal>
  )
}
