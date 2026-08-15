/**
 * TradeRatesField Molecule
 * Los oficios que alguien ejerce, cada uno con su precio por hora.
 *
 * Lo usan los tres sitios donde se declaran oficios: el registro, el alta de
 * un trabajador por parte de su empresa y la pantalla de cambiarlos después.
 * Es el mismo dato en los tres, y con tres formularios distintos acabarían
 * validando cosas distintas.
 *
 * Cada oficio lleva su tarifa porque no se cobra lo mismo por limpiar una
 * casa que por cuidar a un mayor. Con un precio único habría que elegir entre
 * malvender el trabajo caro o parecer caro en el barato, y en un directorio
 * donde el cliente compara precios eso deja fuera de las dos búsquedas.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Input } from '@/components/atoms/Input'
import { Picker } from '@/components/molecules/Picker'
import { TRADE_OPTIONS, getTradeLabel } from '@/utils/trades'
import { styles } from './TradeRatesField.styles'

export interface TradeRate {
  slug: string
  /** Como texto: es lo que hay en el campo, con la coma que teclee */
  hourlyRate: string
}

export interface TradeRatesFieldProps {
  value: TradeRate[]
  onChange: (trades: TradeRate[]) => void
  disabled?: boolean
  /** Se esconde el precio: al trabajador no se le enseña lo que cobra su empresa */
  hideRates?: boolean
  testID?: string
}

export function TradeRatesField({
  value,
  onChange,
  disabled = false,
  hideRates = false,
  testID,
}: TradeRatesFieldProps) {
  /**
   * El desplegable de añadir se reinicia solo tras cada elección. Sin esto
   * conservaría el último oficio elegido y parecería que ya está puesto.
   */
  const [pickerKey, setPickerKey] = useState(0)

  const chosen = new Set(value.map((trade) => trade.slug))
  const available = TRADE_OPTIONS.filter((option) => !chosen.has(option.value))

  const add = (slug: string) => {
    onChange([...value, { slug, hourlyRate: '' }])
    setPickerKey((key) => key + 1)
  }

  const remove = (slug: string) => {
    onChange(value.filter((trade) => trade.slug !== slug))
  }

  const setRate = (slug: string, hourlyRate: string) => {
    onChange(
      value.map((trade) => (trade.slug === slug ? { ...trade, hourlyRate } : trade)),
    )
  }

  return (
    <View testID={testID}>
      {value.map((trade, index) => (
        <View key={trade.slug} style={styles.row} testID={`trade-row-${trade.slug}`}>
          <View style={styles.labelColumn}>
            <Text style={styles.label} numberOfLines={2}>
              {getTradeLabel(trade.slug)}
            </Text>
            {index === 0 && value.length > 1 && (
              /**
               * El primero encabeza su tarjeta cuando el cliente no ha
               * buscado un oficio concreto. Decirlo evita la sorpresa de
               * salir anunciado como otra cosa.
               */
              <Text style={styles.primary}>Encabeza tu ficha</Text>
            )}
          </View>

          {!hideRates && (
            <View style={styles.rateColumn}>
              <Input
                value={trade.hourlyRate}
                onChangeText={(text) => setRate(trade.slug, text.replace(/[^0-9.,]/g, ''))}
                placeholder="€/h"
                keyboardType="decimal-pad"
                editable={!disabled}
                testID={`trade-rate-${trade.slug}`}
              />
            </View>
          )}

          <Pressable
            onPress={() => remove(trade.slug)}
            disabled={disabled}
            style={styles.remove}
            accessibilityRole="button"
            accessibilityLabel={`Quitar ${getTradeLabel(trade.slug)}`}
            testID={`trade-remove-${trade.slug}`}
          >
            <Text style={styles.removeIcon}>×</Text>
          </Pressable>
        </View>
      ))}

      {available.length > 0 && (
        <View style={styles.add}>
          <Picker
            key={pickerKey}
            options={available}
            value={null}
            onChange={add}
            placeholder={value.length === 0 ? 'Elige tu oficio' : 'Añadir otro oficio'}
            title="Añadir oficio"
            disabled={disabled}
            testID="trade-add"
          />
        </View>
      )}

      {value.length === 0 && (
        <Text style={styles.empty}>
          Sin ningún oficio no apareces en el directorio: es por donde el
          cliente te busca.
        </Text>
      )}
    </View>
  )
}
