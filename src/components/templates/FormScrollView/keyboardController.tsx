/**
 * `react-native-keyboard-controller`, si está; y si no, lo de antes.
 *
 * La librería es **nativa**: no basta con instalarla, hay que reconstruir el
 * dev client. Entre una cosa y la otra pasan minutos o una build de EAS
 * entera, y durante ese rato la app no arranca —el módulo revienta al
 * importarse, así que ni siquiera llega a pintar la primera pantalla—.
 *
 * Eso no puede ser. El teclado es una mejora sobre lo que había; quedarse sin
 * app por ella es peor que el problema que resuelve. Así que se carga con
 * cuidado y, si el módulo nativo no está, se cae a lo que había antes:
 * `automaticallyAdjustKeyboardInsets` en iOS y nada en Android.
 *
 * ## No es una red que se quede puesta
 *
 * En cuanto el dev client esté reconstruido, esto no hace nada: la librería
 * carga y se usa entera, sin tocar una línea. Y mientras tanto avisa **una
 * vez** por consola, para que nadie se pase una tarde preguntándose por qué
 * el teclado sigue tapando los campos en Android.
 *
 * El aviso solo en desarrollo: en una app publicada el módulo nativo está
 * siempre —va en el mismo binario—, así que si esto llegara a saltar allí
 * sería un fallo de empaquetado, no algo que contarle al usuario.
 */

import { forwardRef, type ComponentType, type ReactNode } from 'react'
import { KeyboardAvoidingView as RNKeyboardAvoidingView, Platform } from 'react-native'
import type { ScrollViewProps, ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'

/** Lo que la app usa de la librería, y lo único que el repuesto tiene que imitar */
export type AwareScrollViewProps = ScrollViewProps & {
  bottomOffset?: number
  children?: ReactNode
}

interface Loaded {
  KeyboardProvider: ComponentType<{ children?: ReactNode }>
  KeyboardAwareScrollView: ComponentType<AwareScrollViewProps & { ref?: unknown }>
  KeyboardAvoidingView: ComponentType<ViewProps & { behavior?: string }>
}

function load(): Loaded | null {
  try {
    /* eslint-disable-next-line @typescript-eslint/no-require-imports */
    return require('react-native-keyboard-controller') as Loaded
  } catch {
    /*
      Falta el módulo nativo. Es el caso de "instalado pero sin reconstruir",
      y es temporal por definición.
    */
    return null
  }
}

const library = load()

export const hasNativeKeyboardController = library !== null

if (!hasNativeKeyboardController && __DEV__) {
  // eslint-disable-next-line no-console
  console.warn(
    'react-native-keyboard-controller no tiene su módulo nativo: reconstruye el dev client. ' +
      'Mientras tanto el teclado se comporta como antes, y en Android sigue tapando los campos.',
  )
}

/** Sin la librería no hay nada que proveer: los hijos, tal cual. */
function PassThroughProvider({ children }: { children?: ReactNode }) {
  return <>{children}</>
}

/**
 * El scroll de repuesto: exactamente lo que había antes de la librería.
 * `automaticallyAdjustKeyboardInsets` es de iOS y en Android no hace nada,
 * que es justo el fallo que se vino a arreglar — pero es mejor que no
 * arrancar.
 */
const FallbackAwareScrollView = forwardRef<unknown, AwareScrollViewProps>(
  function FallbackAwareScrollView({ bottomOffset: _bottomOffset, ...props }, ref) {
    return (
      <Animated.ScrollView
        ref={ref as never}
        automaticallyAdjustKeyboardInsets
        {...props}
      />
    )
  },
)

function FallbackAvoidingView({ behavior, ...props }: ViewProps & { behavior?: string }) {
  return (
    <RNKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? (behavior as 'padding') : undefined}
      {...props}
    />
  )
}

export const KeyboardProvider = library?.KeyboardProvider ?? PassThroughProvider
export const KeyboardAwareScrollView = (library?.KeyboardAwareScrollView ??
  FallbackAwareScrollView) as ComponentType<AwareScrollViewProps & { ref?: unknown }>
export const KeyboardAvoidingView = library?.KeyboardAvoidingView ?? FallbackAvoidingView
