/**
 * InfoCard Molecule
 * La tarjeta del sistema: casi todas las pantallas de la app cuelgan de ella.
 *
 * **Cambio del 20 Agosto 2026.** Era cuadrada, con contorno azul y una
 * cuadrícula de plano de fondo —las tres marcas del sistema industrial del
 * `_ds`—. Ahora es blanca, redondeada y sin marco, y se separa de la página y
 * de la siguiente por aire y una sombra muy baja.
 *
 * Con eso desaparecieron dos propiedades que ya no significan nada:
 *
 * - `bordered`, que quitaba el contorno azul. Ya no hay contorno que quitar.
 * - `grid`, que ocultaba la cuadrícula. Ya no hay cuadrícula. El átomo
 *   `CardGrid` sigue existiendo por si alguna vez vuelve, como `Corner`.
 *
 * `variant` se queda: la home alterna claras y oscuras para separar secciones
 * sin usar líneas.
 */

import { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'
import { styles } from './InfoCard.styles'

/**
 * `accent` es para el texto que explica la pantalla: fondo en el azul de la
 * barra de abajo y letra blanca. Le da a esos párrafos una identidad propia y
 * los separa de lo que se rellena.
 */
export type InfoCardVariant = 'light' | 'dark' | 'accent'

export interface InfoCardProps {
  children: ReactNode
  variant?: InfoCardVariant
  style?: ViewStyle
  testID?: string
}

export function InfoCard({
  children,
  variant = 'light',
  style,
  testID,
}: InfoCardProps) {
  return (
    <View
      style={[styles.base, styles[variant], style]}
      testID={testID}
    >
      {children}
    </View>
  )
}
