/**
 * Input Atom
 * Campo de texto base sin lógica de negocio.
 *
 * Lleva el estado de foco él mismo. Podría dejarse a cada formulario, pero
 * entonces lo tendrían unos sí y otros no, y el borde que se enciende al
 * escribir dejaría de significar algo.
 *
 * Cuando el campo tiene una unidad —€/h, km, %— se pasa en `suffix` en vez de
 * ponerla en el `placeholder`: el placeholder desaparece en cuanto se teclea,
 * que es justo cuando el número necesita la unidad al lado.
 */

import { useState } from 'react'
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native'
import { styles } from './Input.styles'
import { theme } from '@/theme'

export interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'default' | 'dark'
  error?: boolean
  /** Unidad fija a la derecha, dentro del campo: "€/h", "km" */
  suffix?: string
  style?: StyleProp<TextStyle>
}

/**
 * De `style` solo lo que decide el sitio del campo dentro de su fila —ancho,
 * flex, márgenes— vale para el envoltorio de la unidad. Lo demás (relleno,
 * alineación del texto) es del campo de dentro; dárselo también al
 * envoltorio metería, por ejemplo, un `paddingRight` pensado para estrechar
 * el hueco del texto y en el envoltorio recortaría el propio campo.
 */
const WRAPPER_KEYS = [
  'width',
  'minWidth',
  'maxWidth',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'margin',
  'marginHorizontal',
  'marginVertical',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
] as const

function wrapperSizing(style: StyleProp<TextStyle>): StyleProp<ViewStyle> {
  const flat = StyleSheet.flatten(style) ?? {}
  const sizing: ViewStyle = {}

  for (const key of WRAPPER_KEYS) {
    if (flat[key] !== undefined) (sizing as Record<string, unknown>)[key] = flat[key]
  }

  return sizing
}

export function Input({
  variant = 'default',
  error = false,
  suffix,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const isDark = variant === 'dark'
  const isEditable = props.editable !== false

  const field = (
    <TextInput
      style={[
        styles.base,
        isDark && styles.dark,
        // El foco antes que el error: mientras se corrige, se ve dónde se está
        isFocused && (isDark ? styles.darkFocused : styles.focused),
        error && !isFocused && styles.error,
        !isEditable && styles.disabled,
        // Deja sitio a la unidad, que va encima en posición absoluta
        Boolean(suffix) && styles.withSuffix,
        style,
      ]}
      placeholderTextColor={
        isDark ? 'rgba(232, 237, 245, 0.5)' : 'rgba(29, 31, 32, 0.5)'
      }
      cursorColor={theme.colors.accent}
      onFocus={(event) => {
        setIsFocused(true)
        onFocus?.(event)
      }}
      onBlur={(event) => {
        setIsFocused(false)
        onBlur?.(event)
      }}
      {...props}
    />
  )

  if (!suffix) return field

  return (
    // El ancho/flex que traiga `style` es cosa del envoltorio, no del campo:
    // si solo se lo quedara el `TextInput` de dentro (como antes), un ancho
    // fijo —el precio de un servicio, por ejemplo— no llegaba a la fila que
    // lo coloca y el campo se salía de su sitio.
    <View style={[styles.wrapper, wrapperSizing(style)]}>
      {field}
      {/*
        `pointerEvents="none"` para que tocar encima de la unidad abra el
        teclado igual: si no, hay una franja del campo que no responde y
        parece que está roto.
      */}
      <Text
        style={[styles.suffix, isDark && styles.suffixDark]}
        pointerEvents="none"
      >
        {suffix}
      </Text>
    </View>
  )
}
