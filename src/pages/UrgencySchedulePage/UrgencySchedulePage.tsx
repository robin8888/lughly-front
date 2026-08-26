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
import { StatusBar } from 'expo-status-bar'
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
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
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

/** Iniciales para los botones de día: L M X J V S D */
const WEEKDAY_INITIALS: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  0: 'D',
}

const WEEKDAYS_LABORABLES = [1, 2, 3, 4, 5]
const WEEKDAYS_FIN_DE_SEMANA = [6, 0]

/**
 * Una franja tal como se edita: **un horario y los días que lo comparten**.
 *
 * El servidor guarda una fila por día (`UrgencyWindow.weekday`), que es lo
 * correcto para consultarlo, pero es un mal formulario: quien hace guardia de
 * lunes a viernes de 22:00 a 06:00 tenía que rellenar cinco veces la misma
 * hora y la misma tarifa, y cambiar el precio le obligaba a repasar las cinco.
 *
 * Aquí se agrupa al cargar y se despliega al guardar. El contrato con el
 * servidor no cambia.
 */
interface Franja {
  weekdays: number[]
  from: string
  to: string
  hourlyRate: number
}

/** Las franjas del servidor, juntadas por horario y tarifa iguales */
function toFranjas(windows: ApiUrgencyWindow[]): Franja[] {
  const porHorario = new Map<string, Franja>()

  for (const window of windows) {
    const clave = `${window.from}|${window.to}|${window.hourlyRate}`
    const franja = porHorario.get(clave)

    if (franja) {
      franja.weekdays.push(window.weekday)
      continue
    }

    porHorario.set(clave, {
      weekdays: [window.weekday],
      from: window.from,
      to: window.to,
      hourlyRate: window.hourlyRate,
    })
  }

  /* En el orden de la semana, que es como se leen */
  for (const franja of porHorario.values()) {
    franja.weekdays.sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b))
  }

  return [...porHorario.values()]
}

/** Y de vuelta: una fila por día, que es lo que espera el servidor */
function toWindows(franjas: Franja[]): ApiUrgencyWindow[] {
  return franjas.flatMap((franja) =>
    franja.weekdays.map((weekday) => ({
      weekday,
      from: franja.from,
      to: franja.to,
      hourlyRate: franja.hourlyRate,
    })),
  )
}

/** "Lunes, martes y miércoles" — para el rótulo de la tarjeta */
function nombrarDias(weekdays: number[]): string {
  const nombres = weekdays.map((day) => WEEKDAY_NAMES[day]!.toLowerCase())

  if (nombres.length === 0) return 'ningún día'
  if (nombres.length === 1) return nombres[0]!

  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}

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
  const tabBarClearance = useTabBarClearance()
  const { data, isPending, isError, refetch } = useUrgencyWindows(employeeId)
  const { save, isSaving } = useSetUrgencyWindows(employeeId)

  const [windows, setWindows] = useState<Franja[] | null>(null)

  /**
   * Se copia lo guardado una sola vez, agrupando los días que comparten
   * horario. Si se copiara en cada respuesta, un refresco de fondo borraría lo
   * que el empleador esté editando.
   */
  useEffect(() => {
    if (data && windows === null) setWindows(toFranjas(data))
  }, [data, windows])

  const current = windows ?? []

  const add = () => {
    setWindows([
      ...current,
      /*
        De lunes a viernes por defecto, que es la guardia más habitual y la que
        más se repetía a mano. Quitar días cuesta un toque cada uno; añadirlos
        de uno en uno costaba cinco.
      */
      { weekdays: [...WEEKDAYS_LABORABLES], from: '22:00', to: '06:00', hourlyRate: 0 },
    ])
  }

  const patch = (index: number, changes: Partial<Franja>) => {
    setWindows(current.map((w, i) => (i === index ? { ...w, ...changes } : w)))
  }

  /** Enciende o apaga un día de esa franja */
  const toggleDay = (index: number, weekday: number) => {
    const franja = current[index]
    if (!franja) return

    const puestos = franja.weekdays.includes(weekday)
      ? franja.weekdays.filter((day) => day !== weekday)
      : [...franja.weekdays, weekday]

    patch(index, {
      weekdays: puestos.sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)),
    })
  }

  const remove = (index: number) => {
    setWindows(current.filter((_, i) => i !== index))
  }

  /**
   * Qué le falta a cada franja para poder guardar, dicho con el día por
   * delante.
   *
   * El botón se apagaba sin explicar por qué. El aviso existía —dentro de la
   * franja, junto al campo— pero una franja recién añadida nace sin tarifa y
   * la lista crece hacia abajo: con tres días puestos, el que falla se queda
   * fuera de pantalla y desde el botón no se ve nada. Quien mira solo tiene un
   * botón muerto.
   *
   * Se nombra por el día y no por la posición: "la del martes" se encuentra de
   * un vistazo y "la segunda" hay que contarla.
   */
  const problemas = current.flatMap((franja, index) => {
    const cual = franja.weekdays.length > 0 ? `de ${nombrarDias(franja.weekdays)}` : `${index + 1}`

    if (franja.weekdays.length === 0) {
      return [`La franja ${index + 1} no tiene ningún día elegido.`]
    }

    if (franja.from === franja.to) {
      return [`La franja ${cual} empieza y acaba a la misma hora.`]
    }

    if (!(franja.hourlyRate > 0)) {
      return [`Falta lo que cobras por hora en la franja ${cual}.`]
    }

    return []
  })

  const isValid = problemas.length === 0

  const handleSave = async () => {
    /* Una fila por día, que es lo que espera el servidor: ver `toWindows` */
    const { ok, error } = await save(toWindows(current))

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
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
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
                {/**
                  * Los días que comparten este horario, no uno solo.
                  *
                  * Quien hace guardia de lunes a viernes rellenaba cinco veces
                  * la misma hora y la misma tarifa, y cambiar el precio le
                  * obligaba a repasar las cinco. Aquí se marcan los días y el
                  * horario se escribe una vez.
                  */}
                <FormField label="Días">
                  <View style={styles.days}>
                    {WEEK_ORDER.map((weekday) => {
                      const puesto = window.weekdays.includes(weekday)

                      return (
                        <Pressable
                          key={weekday}
                          onPress={() => toggleDay(index, weekday)}
                          disabled={isSaving}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: puesto }}
                          accessibilityLabel={WEEKDAY_NAMES[weekday]}
                          style={[styles.day, puesto && styles.dayOn]}
                          testID={`window-${index}-day-${weekday}`}
                        >
                          <Text style={[styles.dayText, puesto && styles.dayTextOn]}>
                            {WEEKDAY_INITIALS[weekday]}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>

                  {/*
                    Los dos repartos de siempre, de un toque. Son lo que se
                    elige el noventa por ciento de las veces, y marcarlos a mano
                    son cinco toques y dos.
                  */}
                  <View style={styles.dayShortcuts}>
                    <Pressable
                      onPress={() => patch(index, { weekdays: [...WEEKDAYS_LABORABLES] })}
                      disabled={isSaving}
                      accessibilityRole="button"
                      testID={`window-${index}-days-weekdays`}
                    >
                      <Text style={styles.dayShortcut}>Lunes a viernes</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => patch(index, { weekdays: [...WEEKDAYS_FIN_DE_SEMANA] })}
                      disabled={isSaving}
                      accessibilityRole="button"
                      testID={`window-${index}-days-weekend`}
                    >
                      <Text style={styles.dayShortcut}>Fin de semana</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => patch(index, { weekdays: [...WEEK_ORDER] })}
                      disabled={isSaving}
                      accessibilityRole="button"
                      testID={`window-${index}-days-all`}
                    >
                      <Text style={styles.dayShortcut}>Todos</Text>
                    </Pressable>
                  </View>
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
                  label="Tarifa de urgencia"
                  error={
                    window.hourlyRate > 0 ? undefined : 'Pon lo que cobras por esa hora'
                  }
                >
                  {/*
                    La unidad va dentro del campo y no en la etiqueta: ahí se
                    lee una vez al llegar, y aquí sigue delante mientras se
                    teclea el número, que es cuando importa.
                  */}
                  <Input
                    value={window.hourlyRate > 0 ? String(window.hourlyRate) : ''}
                    onChangeText={(value) =>
                      patch(index, {
                        hourlyRate: Number(value.replace(',', '.').replace(/[^0-9.]/g, '')),
                      })
                    }
                    placeholder="45"
                    suffix="€/h"
                    keyboardType="decimal-pad"
                    editable={!isSaving}
                    error={window.hourlyRate <= 0}
                    testID={`window-${index}-rate`}
                  />
                </FormField>

                <Pressable
                  onPress={() => remove(index)}
                  disabled={isSaving}
                  accessibilityRole="button"
                  style={styles.remove}
                  testID={`window-${index}-remove`}
                >
                  <Text style={styles.removeText}>Quitar esta franja</Text>
                </Pressable>
              </InfoCard>
            ))}
          </View>
        )}

        <Button
          fullWidth
          onPress={add}
          disabled={isSaving}
          style={styles.add}
          testID="urgency-schedule-add"
        >
          Añadir franja
        </Button>

        {/*
          Lo que falta, justo encima del botón: es donde se mira cuando no se
          puede pulsar. Repite lo que ya dice cada franja, y esa repetición es
          el arreglo —el aviso de dentro solo se ve si esa franja está en
          pantalla—.
        */}
        {problemas.length > 0 && (
          <View style={styles.missing} testID="urgency-schedule-missing">
            {problemas.map((problema) => (
              <Text key={problema} style={styles.missingText}>
                {problema}
              </Text>
            ))}
          </View>
        )}

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
