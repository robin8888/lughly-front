/**
 * AvailabilityPage
 * El horario ordinario de trabajo: cuándo se le puede reservar una hora.
 *
 * Son tres cosas distintas y conviene no confundirlas, porque las tres viven
 * en la app y se parecen:
 *
 * - **Este horario**: a qué horas trabaja normalmente. Es lo que decidirá qué
 *   huecos se le pueden reservar.
 * - **"Disponible ahora"**: un interruptor para las urgencias, que dice si en
 *   este momento sale corriendo a una avería.
 * - **Horario de urgencias**: el que una empresa fija a cada trabajador, con
 *   su tarifa propia por esa hora.
 *
 * Aquí no se pone ningún precio: lo que cobra por su trabajo normal ya está en
 * sus oficios, y cada oficio tiene el suyo.
 *
 * El horario de un empleado lo pone su empresa, así que a él se le explica en
 * vez de enseñarle un editor que el servidor va a rechazar.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Picker } from '@/components/molecules/Picker'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import {
  useMyAvailability,
  useSetMyAvailability,
} from '@/hooks/domain/useMyAvailability'
import { useMyHolidays } from '@/hooks/domain/useMyHolidays'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { ApiAvailabilityWindow } from '@/api/pros.api'
import {
  WEEKDAY_NAMES,
  atTime,
  formatDate,
  formatTime,
  parseIsoDate,
  toIsoDate,
} from '@/utils/dates'
import { theme } from '@/theme'
import { styles } from './AvailabilityPage.styles'

/**
 * La semana empieza en lunes, como en España, aunque `Date.getDay()` cuente
 * desde el domingo. Solo cambia el orden en que se listan; el número que viaja
 * al servidor sigue siendo el de `getDay()`.
 */
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

const WEEKDAY_OPTIONS = WEEK_ORDER.map((weekday) => ({
  value: String(weekday),
  label: WEEKDAY_NAMES[weekday]!,
}))

/**
 * De lunes a viernes, de nueve a seis. No es un horario que sirva a todo el
 * mundo, pero es el de mucha gente y ahorra montar cinco franjas a mano: quien
 * no lo tenga así cambia lo que necesite y ya está.
 */
const OFFICE_HOURS: ApiAvailabilityWindow[] = [1, 2, 3, 4, 5].map((weekday) => ({
  weekday,
  from: '09:00',
  to: '18:00',
}))

/** Una hora "HH:MM" convertida a fecha, que es lo que come el selector. */
function toDate(value: string): Date {
  const [hours, minutes] = value.split(':').map(Number)
  return atTime(new Date(), hours ?? 0, minutes ?? 0)
}

/** Un día en texto, como se lee: "8 de diciembre de 2026" */
function readableDay(day: string): string {
  const date = parseIsoDate(day)
  return date ? formatDate(date) : day
}

export interface AvailabilityPageProps {
  onBack: () => void
  /**
   * Cuando lo pone la empresa: el horario que se edita es el de ese trabajador,
   * no el de quien mira. Sin esto, la pantalla solo servía para uno mismo y al
   * empleado se le decía "te lo pone tu empresa" sin que la empresa tuviera
   * dónde ponerlo.
   */
  employeeId?: string
  /** Para encabezar con su nombre; opcional si aún no ha cargado */
  employeeName?: string
}

export function AvailabilityPage({
  onBack,
  employeeId,
  employeeName,
}: AvailabilityPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const isEmployee = useIsEmployee()

  /* Editando el de otro, lo que sea quien mira no viene al caso */
  const isForEmployee = employeeId !== undefined
  const blocked = isEmployee && !isForEmployee

  const { data, isPending, isError, refetch } = useMyAvailability(!blocked, employeeId)
  const { save, isSaving } = useSetMyAvailability(employeeId)

  /**
   * Los festivos que vienen y caen en días que trabaja.
   *
   * **Aquí no se pueden marcar**, y no es un olvido: el horario va por día de
   * la semana —los martes, todos— y un festivo es una fecha. En "los martes"
   * no cabe "el 8 de diciembre". Lo que sí se puede es avisar, para que nadie
   * descubra en diciembre que tenía puesto trabajar la Inmaculada.
   *
   * Se cruzan con el horario **guardado**, no con el que se está editando: el
   * aviso habla de lo que hay, no de lo que se está probando.
   */
  const { data: calendar } = useMyHolidays(
    new Date().getFullYear(),
    !blocked,
    employeeId,
  )

  const [windows, setWindows] = useState<ApiAvailabilityWindow[] | null>(null)

  /**
   * Se copia lo guardado una sola vez. Si se copiara en cada respuesta, un
   * refresco de fondo borraría lo que se esté editando.
   */
  useEffect(() => {
    if (data && windows === null) setWindows(data)
  }, [data, windows])

  const current = windows ?? []

  /**
   * Solo los que quedan por venir y en los que hay algo que decidir: los que
   * ya pasaron no se pueden cambiar, y uno que cae dentro de sus vacaciones ya
   * está resuelto. Tres como mucho: esto es un aviso, no la lista entera —para
   * eso está su calendario—.
   */
  const today = toIsoDate(new Date())
  const upcomingHolidays = (calendar?.holidays ?? [])
    .filter(
      (holiday) =>
        holiday.date >= today && holiday.worksThatDay && !holiday.away,
    )
    .slice(0, 3)

  const add = () => {
    // Un lunes de mañana: se cambia en dos toques y evita la fila vacía
    setWindows([...current, { weekday: 1, from: '09:00', to: '18:00' }])
  }

  const patch = (index: number, changes: Partial<ApiAvailabilityWindow>) => {
    setWindows(current.map((w, i) => (i === index ? { ...w, ...changes } : w)))
  }

  const remove = (index: number) => {
    setWindows(current.filter((_, i) => i !== index))
  }

  const isValid = current.every((window) => window.from !== window.to)

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
        ? 'Te has quedado sin horario. Ponlo cuando quieras: es lo que dice a qué horas se te puede reservar.'
        : 'Ya se sabe a qué horas trabajas. Las franjas que se tocaban se han juntado en una.',
    )
    onBack()
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {isForEmployee ? (employeeName ?? 'Su horario') : 'Mi horario'}
      </Text>
    </View>
  )

  /**
   * A un empleado se lo pone su empresa, igual que sus oficios. Se le dice
   * antes de pedir nada al servidor: la petición acabaría en un 403 y el
   * mensaje sería el mismo, pero después de una espera y con cara de error.
   */
  if (blocked) {
    return (
      <View style={styles.screen} testID="availability-page">
        {header}
        <EmptyState
          title="Tu horario lo pone tu empresa"
          message="Quien te dio de alta decide a qué horas se te puede reservar, igual que tus oficios y tus tarifas. Si algo no cuadra, háblalo con ellos."
          testID="availability-employee"
        />
      </View>
    )
  }

  if (isPending) {
    return (
      <View style={styles.screen} testID="availability-page">
        {header}
        <View style={styles.state} testID="availability-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="availability-page">
        {header}
        <EmptyState
          title="No hemos podido cargar tu horario"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'availability-retry',
            },
          ]}
          testID="availability-error"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="availability-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/*
          El texto que explica la pantalla, en el azul de la barra de abajo.
          Lo que se rellena va en tarjetas blancas, así que de un vistazo se
          distingue lo que hay que leer de lo que hay que tocar.
        */}
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {isForEmployee
              ? 'A qué horas trabaja normalmente. Es lo que dirá qué huecos se le pueden reservar, así que pon las horas a las que de verdad puede ir.'
              : 'A qué horas trabajas normalmente. Es lo que dirá qué huecos se te pueden reservar, así que pon las horas a las que de verdad puedes ir.'}
          </Text>

          <Text style={styles.note}>
            Aquí no va ningún precio: lo que cobras por tu trabajo ya está en tus
            oficios. Esto tampoco es "disponible ahora", que es el interruptor de
            las urgencias.
          </Text>
        </InfoCard>

        {upcomingHolidays.length > 0 && (
          <View style={styles.holidays} testID="availability-holidays">
            <Text style={styles.holidaysTitle}>Ojo con estos festivos</Text>
            {upcomingHolidays.map((holiday) => (
              <Text key={holiday.date} style={styles.holidaysLine}>
                {readableDay(holiday.date)} es festivo ({holiday.name}) y{' '}
                {isForEmployee ? 'tiene' : 'tienes'} horario ese día.
              </Text>
            ))}
            <Text style={styles.holidaysNote}>
              {isForEmployee
                ? 'Se decide festivo a festivo en su calendario: si lo trabaja, y si se cobra el recargo.'
                : 'Se decide festivo a festivo en tus festivos: si lo trabajas, y si cobras el recargo. Para no trabajarlo, márcalo como ausencia.'}
            </Text>
          </View>
        )}

        {current.length === 0 ? (
          <Text style={styles.empty}>
            Todavía no has puesto ninguna hora. Sin horario nadie sabe cuándo
            puede contar contigo.
          </Text>
        ) : (
          <View style={styles.list}>
            {current.map((window, index) => (
              <InfoCard key={index} style={styles.window} testID={`slot-${index}`}>
                <FormField label="Día">
                  <Picker
                    options={WEEKDAY_OPTIONS}
                    value={String(window.weekday)}
                    onChange={(value) => patch(index, { weekday: Number(value) })}
                    title="Día de la semana"
                    disabled={isSaving}
                    testID={`slot-${index}-weekday`}
                  />
                </FormField>

                <View style={styles.hours}>
                  <View style={styles.hour}>
                    <FormField label="Desde">
                      <DateTimeField
                        value={toDate(window.from)}
                        onChange={(picked) => patch(index, { from: formatTime(picked) })}
                        mode="time"
                        disabled={isSaving}
                        testID={`slot-${index}-from`}
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
                        testID={`slot-${index}-to`}
                      />
                    </FormField>
                  </View>
                </View>

                {/*
                  Hay oficios de noche —vigilancia, limpieza de locales, grúas—,
                  así que cruzar la medianoche se dice en vez de dejar que
                  parezca un error.
                */}
                {window.to < window.from && (
                  <Text style={styles.overnight}>
                    Termina al día siguiente por la mañana.
                  </Text>
                )}

                {window.from === window.to && (
                  <Text style={styles.invalid}>
                    Las dos horas no pueden ser la misma. Para el día entero, de
                    00:00 a 23:59.
                  </Text>
                )}

                <Pressable
                  onPress={() => remove(index)}
                  disabled={isSaving}
                  accessibilityRole="button"
                  style={styles.remove}
                  testID={`slot-${index}-remove`}
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
          testID="availability-add"
        >
          Añadir franja
        </Button>

        {/* Solo con el horario vacío: abajo del todo estorbaría a quien ya lo tiene */}
        {current.length === 0 && (
          <Button
            variant="secondary"
            fullWidth
            onPress={() => setWindows(OFFICE_HOURS)}
            disabled={isSaving}
            style={styles.preset}
            testID="availability-preset"
          >
            De lunes a viernes, 9:00 a 18:00
          </Button>
        )}

        <Button
          fullWidth
          loading={isSaving}
          disabled={!isValid || isSaving}
          onPress={() => void handleSave()}
          style={styles.save}
          testID="availability-save"
        >
          Guardar horario
        </Button>
      </Animated.ScrollView>
    </View>
  )
}
