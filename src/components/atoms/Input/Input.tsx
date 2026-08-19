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
  TextInput,
  View,
  Text,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
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
    <View style={styles.wrapper}>
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
