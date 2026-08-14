/**
 * FormField Molecule
 * Etiqueta + control + texto de ayuda + error
 *
 * El control se pasa como children (Input, Picker, subida de archivo…)
 * para que la molécula no dependa de un tipo concreto de campo.
 */

import { ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { styles } from './FormField.styles'

export interface FormFieldAction {
  label: string
  onPress: () => void
  testID?: string
}

export interface FormFieldProps {
  label: string
  children: ReactNode
  /** Texto explicativo ANTES del control (ej. "Solo se usa para verificar tu identidad") */
  helper?: string
  /** Texto explicativo DESPUÉS del control (ej. "Mínimo 10 caracteres") */
  hint?: string
  error?: string
  /** Enlace a la derecha de la etiqueta (ej. "¿Olvidaste?") */
  action?: FormFieldAction
  testID?: string
}

export function FormField({
  label,
  children,
  helper,
  hint,
  error,
  action,
  testID,
}: FormFieldProps) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {action && (
          <Pressable
            onPress={action.onPress}
            testID={action.testID}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.action}>{action.label}</Text>
          </Pressable>
        )}
      </View>

      {helper && <Text style={styles.helper}>{helper}</Text>}

      {children}

      {hint && !error && <Text style={styles.hint}>{hint}</Text>}

      {error && (
        <Text style={styles.error} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}
    </View>
  )
}
