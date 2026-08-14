/**
 * Input Atom
 * Campo de texto base sin lógica de negocio
 */

import { TextInput, TextInputProps, StyleProp, TextStyle } from 'react-native'
import { styles } from './Input.styles'
import { theme } from '@/theme'

export interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'default' | 'dark'
  error?: boolean
  style?: StyleProp<TextStyle>
}

export function Input({
  variant = 'default',
  error = false,
  style,
  ...props
}: InputProps) {
  return (
    <TextInput
      style={[
        styles.base,
        variant === 'dark' && styles.dark,
        error && styles.error,
        style,
      ]}
      placeholderTextColor={
        variant === 'dark'
          ? 'rgba(232, 237, 245, 0.5)'
          : 'rgba(29, 31, 32, 0.5)'
      }
      cursorColor={theme.colors.accent}
      {...props}
    />
  )
}
