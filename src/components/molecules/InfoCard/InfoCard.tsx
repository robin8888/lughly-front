/**
 * InfoCard Molecule
 * Tarjeta del sistema, con la cuadrícula de fondo del sistema de diseño
 * (`_ds/.../styles.css`, `.card::before`).
 *
 * `variant` decide si es clara (#fdfdfb) u oscura (#04070f): el diseño
 * alterna ambas por la home para separar secciones sin usar líneas.
 *
 * **Sin marcas de registro en las esquinas** (decisión del 14 Agosto 2026).
 * El sistema de diseño las dibuja —`.blueprint > .corner`, cuatro cruces
 * sobresaliendo 6 px— pero en la app se ven como suciedad alrededor de cada
 * tarjeta, sobre todo con tarjetas contiguas cuyas cruces se solapan. El
 * átomo `Corner` sigue existiendo por si se recuperan.
 *
 * La cuadrícula va en una capa absoluta bajo el contenido, así que no la
 * tapa nada.
 */

import { ReactNode } from 'react'
import { View, type ViewStyle } from 'react-native'
import { CardGrid } from '@/components/atoms/CardGrid'
import { theme } from '@/theme'
import { styles } from './InfoCard.styles'

export type InfoCardVariant = 'light' | 'dark'

export interface InfoCardProps {
  children: ReactNode
  variant?: InfoCardVariant
  /** Oculta la cuadrícula. Para tarjetas muy pequeñas, donde solo ensucia. */
  grid?: boolean
  /**
   * Quita el contorno azul.
   *
   * Para las piezas que no se leen como una tarjeta dentro de la página sino
   * como la página misma —la cabecera de las dos home—, donde enmarcarlas las
   * convierte en un recuadro pegado encima en vez de en el principio de la
   * pantalla.
   */
  bordered?: boolean
  style?: ViewStyle
  testID?: string
}

export function InfoCard({
  children,
  variant = 'light',
  grid = true,
  bordered = true,
  style,
  testID,
}: InfoCardProps) {
  const isDark = variant === 'dark'
  // Las líneas siguen al color de texto de la tarjeta, como en el CSS
  const gridColor = isDark ? theme.colors.darkText : theme.colors.cardText

  return (
    <View
      style={[
        styles.base,
        bordered && styles.bordered,
        isDark ? styles.dark : styles.light,
        style,
      ]}
      testID={testID}
    >
      {grid && <CardGrid color={gridColor} />}

      {children}
    </View>
  )
}
