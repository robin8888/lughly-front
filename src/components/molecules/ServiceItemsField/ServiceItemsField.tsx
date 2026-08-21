/**
 * ServiceItemsField Molecule
 * Los servicios de la carta de un oficio, a precio fijo.
 *
 * Mismo patrón de lista que `TradeRatesField` —nombre, quitar con "×",
 * añadir al final— pero sin `Picker`: un servicio no sale de un catálogo
 * cerrado como un oficio, lo escribe el profesional con sus palabras
 * ("Corte de pelo", "Cambio de bombín"), así que añadir es un formulario
 * corto y no una elección.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { styles } from './ServiceItemsField.styles'

export interface ServiceItemRate {
  /** Vacío para uno que se acaba de añadir aquí, sin guardar todavía */
  id: string
  name: string
  /** Como texto: es lo que hay en el campo, con la coma que teclee */
  price: string
}

export interface ServiceItemsFieldProps {
  value: ServiceItemRate[]
  onChange: (services: ServiceItemRate[]) => void
  disabled?: boolean
  testID?: string
}

export function ServiceItemsField({
  value,
  onChange,
  disabled = false,
  testID,
}: ServiceItemsFieldProps) {
  const [draftName, setDraftName] = useState('')
  const [draftPrice, setDraftPrice] = useState('')

  const remove = (id: string) => {
    onChange(value.filter((service) => service.id !== id))
  }

  const setName = (id: string, name: string) => {
    onChange(value.map((service) => (service.id === id ? { ...service, name } : service)))
  }

  const setPrice = (id: string, price: string) => {
    onChange(value.map((service) => (service.id === id ? { ...service, price } : service)))
  }

  const priceOf = (raw: string) => Number(raw.trim().replace(',', '.'))

  const canAdd =
    draftName.trim().length >= 2 && priceOf(draftPrice) > 0 && !disabled

  const add = () => {
    if (!canAdd) return

    onChange([
      ...value,
      { id: `draft-${Date.now()}-${value.length}`, name: draftName.trim(), price: draftPrice },
    ])
    setDraftName('')
    setDraftPrice('')
  }

  return (
    <View testID={testID}>
      {value.length > 0 && (
        <>
          <Text style={styles.listLabel}>Servicios</Text>

          <View style={styles.list}>
            {value.map((service) => (
              <View key={service.id} style={styles.row} testID={`carta-service-${service.id}`}>
                <Input
                  value={service.name}
                  onChangeText={(text) => setName(service.id, text)}
                  placeholder="Nombre del servicio"
                  editable={!disabled}
                  style={styles.nameInput}
                  testID={`carta-service-name-${service.id}`}
                />

                <Input
                  value={service.price}
                  onChangeText={(text) => setPrice(service.id, text.replace(/[^0-9.,]/g, ''))}
                  placeholder="0"
                  suffix="€"
                  keyboardType="decimal-pad"
                  editable={!disabled}
                  style={styles.priceInput}
                  testID={`carta-service-price-${service.id}`}
                />

                <Pressable
                  onPress={() => remove(service.id)}
                  disabled={disabled}
                  style={styles.remove}
                  accessibilityRole="button"
                  accessibilityLabel={`Quitar ${service.name || 'este servicio'}`}
                  testID={`carta-service-remove-${service.id}`}
                >
                  <Text style={styles.removeIcon}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}

      {value.length === 0 && (
        <Text style={styles.empty}>
          Sin ningún servicio, solo se cobra la visita.
        </Text>
      )}

      <View style={styles.add}>
        <Text style={styles.addLabel}>Añadir servicio</Text>

        <View style={styles.addRow}>
          <Input
            value={draftName}
            onChangeText={setDraftName}
            placeholder="Ej. Corte de pelo"
            editable={!disabled}
            style={styles.nameInput}
            testID="carta-service-draft-name"
          />

          <Input
            value={draftPrice}
            onChangeText={(text) => setDraftPrice(text.replace(/[^0-9.,]/g, ''))}
            placeholder="0"
            suffix="€"
            keyboardType="decimal-pad"
            editable={!disabled}
            style={styles.priceInput}
            testID="carta-service-draft-price"
          />
        </View>

        <Button
          variant="secondary"
          disabled={!canAdd}
          onPress={add}
          style={styles.addButton}
          testID="carta-service-add"
        >
          Añadir a la carta
        </Button>
      </View>
    </View>
  )
}
