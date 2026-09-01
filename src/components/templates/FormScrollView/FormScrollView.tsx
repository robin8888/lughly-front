/**
 * FormScrollView Template
 * El scroll de una pantalla con campos, con el teclado ya resuelto.
 *
 * Existe porque el problema era el mismo en quince pantallas y la solución
 * también: al enfocar un campo de la mitad de abajo, el teclado lo tapaba y no
 * había forma de ver lo que se estaba escribiendo.
 *
 * ## Por qué no vale `KeyboardAvoidingView`
 *
 * Es lo que había, y solo en las pantallas de acceso: `behavior="padding"` en
 * iOS y **nada en Android**, que es donde se veía el fallo. Darle un
 * `behavior` a Android tampoco lo arregla del todo: desde que la app dibuja de
 * borde a borde, la ventana ya no se encoge al abrirse el teclado, así que el
 * componente no tiene de dónde deducir cuánto sitio queda.
 *
 * `react-native-keyboard-controller` lo mide de verdad —sigue la animación del
 * teclado fotograma a fotograma en las dos plataformas— y es lo que la propia
 * documentación de Expo recomienda para «formularios largos con varios
 * campos», que es exactamente lo que hay aquí.
 *
 * ## Los dos ajustes que trae puestos
 *
 * - **`bottomOffset`**: cuánto aire dejar entre el campo enfocado y el
 *   teclado. Va el mismo hueco que reserva el resto de la app para la píldora
 *   flotante de abajo (`useTabBarClearance`), porque la píldora sigue ahí con
 *   el teclado abierto: sin este margen, el campo queda visible pero debajo de
 *   ella, que es no estar visible.
 * - **`keyboardShouldPersistTaps="handled"`**: sin esto, el primer toque en un
 *   botón con el teclado abierto solo cierra el teclado y hay que volver a
 *   tocar. Es el fallo que todo el mundo achaca a que «no responde».
 *
 * ## Sigue siendo un `Animated.ScrollView`
 *
 * Las pantallas encogen la barra de navegación al hacer scroll
 * (`useNavScrollHandler`), y ese manejador es de Reanimated: necesita un
 * scroll animado por debajo. No hace falta pedirlo —es el que la librería usa
 * por defecto— pero conviene saberlo: el día que se cambie por el normal, el
 * `onScroll` de esas pantallas dejaría de llamarse y la cabecera se quedaría
 * siempre grande, sin ningún error que lo delate.
 */

import { forwardRef, type ReactNode } from 'react'
import { KeyboardAwareScrollView } from './keyboardController'
import type { ScrollViewProps } from 'react-native'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'

export interface FormScrollViewProps extends ScrollViewProps {
  children?: ReactNode
  /**
   * Aire extra entre el campo y el teclado, además del que ya se reserva para
   * la píldora. Para pantallas donde debajo del campo hay algo que también
   * tiene que verse —un texto de ayuda, un contador de caracteres—.
   */
  extraBottomOffset?: number
  testID?: string
}

export const FormScrollView = forwardRef<
  React.ComponentRef<typeof KeyboardAwareScrollView>,
  FormScrollViewProps
>(function FormScrollView({ children, extraBottomOffset = 0, ...props }, ref) {
  const tabBarClearance = useTabBarClearance()

  return (
    <KeyboardAwareScrollView
      ref={ref}
      bottomOffset={tabBarClearance + extraBottomOffset}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </KeyboardAwareScrollView>
  )
})
