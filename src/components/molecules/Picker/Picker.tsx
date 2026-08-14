/**
 * Picker Molecule
 * Sustituto móvil del <select> del diseño: disparador con aspecto de .input
 * que abre una hoja inferior con las opciones.
 */

import { useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView } from 'react-native'
import { styles } from './Picker.styles'

export interface PickerOption {
  value: string
  label: string
}

export interface PickerProps {
  options: PickerOption[]
  value?: string | null
  onChange: (value: string) => void
  placeholder?: string
  /** Título de la hoja de opciones */
  title?: string
  error?: boolean
  disabled?: boolean
  testID?: string
}

export function Picker({
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  title = 'Selecciona',
  error = false,
  disabled = false,
  testID,
}: PickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  const handleSelect = (option: PickerOption) => {
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <View>
      <Pressable
        onPress={() => setIsOpen(true)}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: isOpen }}
        accessibilityLabel={selected?.label ?? placeholder}
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
      >
        <Text
          style={[styles.value, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsOpen(false)}
          testID={testID ? `${testID}-backdrop` : undefined}
        >
          {/* Pressable vacío para que el tap dentro de la hoja no la cierre */}
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
            </View>
            <ScrollView>
              {options.map((option) => {
                const isSelected = option.value === value

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option)}
                    testID={testID ? `${testID}-option-${option.value}` : undefined}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
