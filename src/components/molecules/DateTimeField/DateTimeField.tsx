/**
 * DateTimeField Molecule
 * Fecha y hora con el selector del sistema, nunca escritas a mano.
 *
 * Un campo de texto para fechas es una fábrica de errores: "03/04" es el 3 de
 * abril para quien lo escribe y el 4 de marzo para quien lo lee, y el fallo no
 * se descubre hasta que aparece un profesional un mes tarde. Con el selector
 * del sistema no hay formato que equivocar, y además sale en el idioma y con
 * las costumbres que el usuario ya tiene configuradas en su móvil.
 *
 * Las dos plataformas se manejan distinto y no hay forma de unificarlo:
 *
 * - **Android** abre un diálogo por orden nuestra y se cierra solo. Para
 *   fecha y hora hay que encadenar dos, porque no existe uno que haga las dos
 *   cosas.
 * - **iOS** pinta el selector como un componente más, así que va dentro de
 *   una hoja inferior con su botón de confirmar. Sin ella, el usuario no
 *   sabría cuándo ha terminado de elegir.
 */

import { useState } from 'react'
import { View, Text, Pressable, Modal, Platform } from 'react-native'
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { formatDate, formatDateTime, formatTime } from '@/utils/dates'
import { styles } from './DateTimeField.styles'

export type DateTimeMode = 'date' | 'time' | 'datetime'

export interface DateTimeFieldProps {
  value: Date | null
  onChange: (value: Date) => void
  mode?: DateTimeMode
  /** Qué se lee cuando aún no ha elegido nada */
  placeholder?: string
  minimumDate?: Date
  maximumDate?: Date
  disabled?: boolean
  error?: boolean
  testID?: string
}

function label(value: Date, mode: DateTimeMode): string {
  if (mode === 'date') return formatDate(value)
  if (mode === 'time') return formatTime(value)
  return formatDateTime(value)
}

export function DateTimeField({
  value,
  onChange,
  mode = 'date',
  placeholder = 'Elegir',
  minimumDate,
  maximumDate,
  disabled = false,
  error = false,
  testID,
}: DateTimeFieldProps) {
  /**
   * En iOS se elige sobre una copia y solo se confirma al pulsar Listo. Sin
   * esto, el valor cambiaría con cada giro de la rueda y "Cancelar" no
   * podría deshacer nada.
   */
  const [draft, setDraft] = useState<Date | null>(null)
  const [iosStep, setIosStep] = useState<'date' | 'time' | null>(null)

  /** Desde dónde empieza a girar la rueda si aún no hay valor. */
  const initial = value ?? minimumDate ?? new Date()

  const openAndroid = (step: 'date' | 'time', base: Date) => {
    DateTimePickerAndroid.open({
      value: base,
      mode: step,
      is24Hour: true,
      minimumDate,
      maximumDate,
      onChange: (event: DateTimePickerEvent, picked?: Date) => {
        if (event.type !== 'set' || !picked) return

        /**
         * En el paso de hora, `picked` trae la hora sobre la fecha base, así
         * que basta con propagarlo. En el de fecha, si además hay que pedir
         * la hora, se encadena el segundo diálogo.
         */
        if (mode === 'datetime' && step === 'date') {
          openAndroid('time', picked)
          return
        }

        onChange(picked)
      },
    })
  }

  const open = () => {
    if (disabled) return

    if (Platform.OS === 'android') {
      openAndroid(mode === 'time' ? 'time' : 'date', initial)
      return
    }

    setDraft(initial)
    setIosStep(mode === 'time' ? 'time' : 'date')
  }

  const confirmIos = () => {
    const picked = draft ?? initial

    // En datetime, al confirmar la fecha se pasa a la hora sin cerrar
    if (mode === 'datetime' && iosStep === 'date') {
      setIosStep('time')
      return
    }

    onChange(picked)
    setIosStep(null)
  }

  return (
    <View>
      <Pressable
        onPress={open}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={value ? label(value, mode) : placeholder}
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        testID={testID}
      >
        <Text style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value ? label(value, mode) : placeholder}
        </Text>
        <Text style={styles.icon}>{mode === 'time' ? '🕐' : '📅'}</Text>
      </Pressable>

      {Platform.OS === 'ios' && iosStep !== null && (
        <Modal transparent animationType="slide" onRequestClose={() => setIosStep(null)}>
          <Pressable style={styles.backdrop} onPress={() => setIosStep(null)} />

          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>
              {iosStep === 'time' ? 'Elige la hora' : 'Elige el día'}
            </Text>

            <DateTimePicker
              value={draft ?? initial}
              mode={iosStep}
              display="spinner"
              // El selector se pinta en español con el formato de aquí
              locale="es-ES"
              minimumDate={iosStep === 'date' ? minimumDate : undefined}
              maximumDate={iosStep === 'date' ? maximumDate : undefined}
              onChange={(_event, picked) => picked && setDraft(picked)}
              testID={testID ? `${testID}-picker` : undefined}
            />

            <View style={styles.actions}>
              <Pressable
                onPress={() => setIosStep(null)}
                accessibilityRole="button"
                testID={testID ? `${testID}-cancel` : undefined}
              >
                <Text style={styles.cancel}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={confirmIos}
                accessibilityRole="button"
                testID={testID ? `${testID}-confirm` : undefined}
              >
                <Text style={styles.confirm}>
                  {mode === 'datetime' && iosStep === 'date' ? 'Siguiente' : 'Listo'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}
