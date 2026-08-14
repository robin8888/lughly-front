/**
 * Checkbox Atom
 * Casilla de consentimiento (términos, comunicaciones…)
 */

import { ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { styles } from './Checkbox.styles'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Texto de la casilla; admite nodos para enlaces dentro del texto */
  children?: ReactNode
  error?: boolean
  disabled?: boolean
  testID?: string
}

export function Checkbox({
  checked,
  onChange,
  children,
  error = false,
  disabled = false,
  testID,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={styles.row}
      hitSlop={4}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          error && !checked && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && <Text style={styles.check}>✓</Text>}
      </View>
      {typeof children === 'string' ? (
        <Text style={styles.label}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  )
}
