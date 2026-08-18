/**
 * UrgencySchedulePage
 * Cuándo puede un trabajador atender urgencias, y a cuánto la hora.
 *
 * Lo declara su empleador por adelantado, y esa es toda la razón de que esta
 * pantalla exista: una urgencia se decide en minutos, así que si hubiera que
 * esperar a que la empresa la reparta se pierde. Dejándolo dicho antes, el
 * cliente se la asigna al trabajador directamente y nadie está de guardia.
 *
 * Las horas se eligen con el selector del sistema. Escribirlas a mano en una
 * pantalla que decide a qué hora puede llamar un desconocido a la puerta de
 * alguien es pedir un accidente.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import {
  useUrgencyWindows,
  useSetUrgencyWindows,
} from '@/hooks/domain/useUrgencyWindows'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import type { ApiUrgencyWindow } from '@/api/employees.api'
import { WEEKDAY_NAMES, atTime, formatTime } from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './UrgencySchedulePage.styles'

/**
 * La semana empieza en lunes, como en España, aunque `Date.getDay()` cuente
 * desde el domingo. Solo cambia el orden en que se listan; el número que
 * viaja al servidor sigue siendo el de `getDay()`.
 */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const WEEKDAY_OPTIONS = WEEK_ORDER.map((weekday) => ({
  value: String(weekday),
  label: WEEKDAY_NAMES[weekday]!,
}))

/** Una hora "HH:MM" convertida a fecha, que es lo que come el selector. */
function toDate(value: string): Date {
  const [hours, minutes] = value.split(':').map(Number)
  return atTime(new Date(), hours ?? 0, minutes ?? 0)
}

export interface UrgencySchedulePageProps {
  employeeId: string | undefined
  /** Para encabezar la pantalla con su nombre; opcional si aún no cargó */
  employeeName?: string
  onBack: () => void
}

export function UrgencySchedulePage({
  employeeId,
  employeeName,
  onBack,
}: UrgencySchedulePageProps) {
  const onScroll = useNavScrollHandler()
  const { data, isPending, isError, refetch } = useUrgencyWindows(employeeId)
  const { save, isSaving } = useSetUrgencyWindows(employeeId)

  const [windows, setWindows] = useState<ApiUrgencyWindow[] | null>(null)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo borraría lo que el empleador esté editando.
   */
  useEffect(() => {
    if (data && windows === null) setWindows(data)
  }, [data, windows])

  const current = windows ?? []

  const add = () => {
    setWindows([
      ...current,
      // Un lunes de mañana: se cambia en dos toques y evita la fila vacía
      { weekday: 1, from: '09:00', to: '18:00', hourlyRate: 0 },
    ])
  }

  const patch = (index: number, changes: Partial<ApiUrgencyWindow>) => {
    setWindows(current.map((w, i) => (i === index ? { ...w, ...changes } : w)))
  }

  const remove = (index: number) => {
    setWindows(current.filter((_, i) => i !== index))
  }

  const isValid = current.every(
    (window) => window.from !== window.to && window.hourlyRate > 0,
  )

  const handleSave = async () => {
    const { ok, error } = await save(current)

    if (!ok) {
      Alert.alert(
        'No se ha podido guardar',
        error ?? 'Inténtalo de nuevo en un momento.',
      )
      return
    }

    Alert.alert(
      'Horario guardado',
      current.length === 0
        ? 'No recibirá urgencias hasta que le pongas alguna franja.'
        : 'Dentro de esas horas aparecerá disponible y el cliente podrá asignarle urgencias directamente.',
    )
    onBack()
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        Horario de urgencias
      </Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="urgency-schedule-page">
        {header}
        <View style={styles.state} testID="urgency-schedule-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="urgency-schedule-page">
        {header}
        <EmptyState
          title="No hemos podido cargar el horario"
          message="Revisa tu conexión e inténtalo de nuevo."
          illustration="greeting"
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'urgency-schedule-retry',
            },
          ]}
          testID="urgency-schedule-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="urgency-schedule-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <InfoCard>
          <Text style={styles.intro}>
            {employeeName ? `${employeeName} aparecerá` : 'Aparecerá'} disponible
            para urgencias solo dentro de estas horas, y el cliente podrá
            asignárselas sin pasar por ti. Fuera de ellas no le llega ningún
            aviso.
          </Text>

          {/*
            Los recargos van dentro de esta tarifa, no encima (decisión de
            producto del 18 Agosto 2026). Aquí se decía lo contrario, y no es un
            matiz: quien pone 40 €/h creyendo que el sábado subirá solo está
            fijando un precio distinto del que cree.
          */}
          <Text style={styles.rateNote}>
            Esta es la tarifa final de la urgencia: ya incluye lo que quieras
            cobrar de más por sábados, domingos, festivos o noche. No se le suma
            ningún recargo encima.
          </Text>
        </InfoCard>

        {current.length === 0 ? (
          <Text style={styles.empty}>
            Sin ninguna franja no recibirá urgencias. Es lo correcto si solo
            trabaja a lo que tú le asignes.
          </Text>
        ) : (
          <View style={styles.list}>
            {current.map((window, index) => (
              <InfoCard key={index} style={styles.window} testID={`window-${index}`}>
                <FormField label="Día">
                  <Picker
                    options={WEEKDAY_OPTIONS}
                    value={String(window.weekday)}
                    onChange={(value) => patch(index, { weekday: Number(value) })}
                    title="Día de la semana"
                    disabled={isSaving}
                    testID={`window-${index}-weekday`}
                  />
                </FormField>

                <View style={styles.hours}>
                  <View style={styles.hour}>
                    <FormField label="Desde">
                      <DateTimeField
                        value={toDate(window.from)}
                        onChange={(picked) =>
                          patch(index, { from: formatTime(picked) })
                        }
                        mode="time"
                        disabled={isSaving}
                        testID={`window-${index}-from`}
                      />
                    </FormField>
                  </View>

                  <View style={styles.hour}>
                    <FormField label="Hasta">
                      <DateTimeField
                        value={toDate(window.to)}
                        onChange={(picked) => patch(index, { to: formatTime(picked) })}
                        mode="time"
                        disabled={isSaving}
                        testID={`window-${index}-to`}
                      />
                    </FormField>
                  </View>
                </View>

                {/**
                 * Cruzar la medianoche es lo normal en urgencias, así que se
                 * dice en vez de dejar que parezca un error.
                 */}
                {window.to < window.from && (
                  <Text style={styles.overnight}>
                    Termina al día siguiente por la mañana.
                  </Text>
                )}

                {window.from === window.to && (
                  <Text style={styles.invalid}>
                    Las dos horas no pueden ser la misma. Para el día entero,
                    de 00:00 a 23:59.
                  </Text>
                )}

                <FormField
                  label="Tarifa de urgencia (€/h)"
                  error={
                    window.hourlyRate > 0 ? undefined : 'Pon lo que cobras por esa hora'
                  }
                >
                  <Input
                    value={window.hourlyRate > 0 ? String(window.hourlyRate) : ''}
                    onChangeText={(value) =>
                      patch(index, {
                        hourlyRate: Number(value.replace(',', '.').replace(/[^0-9.]/g, '')),
                      })
                    }
                    placeholder="Ej. 45"
                    keyboardType="decimal-pad"
                    editable={!isSaving}
                    testID={`window-${index}-rate`}
                  />
                </FormField>

                <Pressable
                  onPress={() => remove(index)}
                  disabled={isSaving}
                  accessibilityRole="button"
                  testID={`window-${index}-remove`}
                >
                  <Text style={styles.remove}>Quitar esta franja</Text>
                </Pressable>
              </InfoCard>
            ))}
          </View>
        )}

        <Button
          variant="secondary"
          fullWidth
          onPress={add}
          disabled={isSaving}
          style={styles.add}
          testID="urgency-schedule-add"
        >
          Añadir franja
        </Button>

        <Button
          fullWidth
          loading={isSaving}
          disabled={!isValid || isSaving}
          onPress={() => void handleSave()}
          style={styles.save}
          testID="urgency-schedule-save"
        >
          Guardar horario
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
