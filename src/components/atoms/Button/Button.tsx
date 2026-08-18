/**
 * Button Atom
 * Botón base sin lógica de negocio
 *
 * Variantes desde styles.css:
 * - primary: fondo accent, texto claro
 * - secondary: borde, fondo transparente
 * - ghost: sin borde, solo hover
 */

import {
  Pressable,
  Text,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { styles, buttonStyles, pressedStyles, textStyles } from './Button.styles'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'default' | 'small' | 'large'

export interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
  fullWidth?: boolean
  /**
   * `StyleProp` y no `ViewStyle` a secas: así se puede pasar un array
   * —estilo base + capa de color, que es como se compone en este proyecto—
   * sin tener que fundir los objetos a mano en cada llamada.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Capa que se añade mientras el botón está pulsado, encima de `style`.
   *
   * Hace falta porque `style` se aplica al final y, si trae `backgroundColor`,
   * tapa el color de pulsado de la variante y el botón se queda sin respuesta
   * al tacto. Quien pinte el fondo a mano tiene que decir también cómo se ve
   * hundido.
   */
  pressedStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  testID?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  onPress,
  fullWidth = false,
  style,
  pressedStyle,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        buttonStyles[variant],
        buttonStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        pressed && !isDisabled && pressedStyles[variant],
        style,
        pressed && !isDisabled && pressedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#5980a6'}
        />
      ) : (
        <Text
          // Un botón nunca debe partir su texto en dos líneas: duplica su
          // altura y descuadra la fila en la que esté.
          numberOfLines={1}
          style={[
            styles.text,
            textStyles[variant],
            textStyles[size],
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  )
}
