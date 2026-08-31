/**
 * AvailabilityPage
 * El horario ordinario de trabajo: cuándo se le puede reservar una hora.
 *
 * Son tres cosas distintas y conviene no confundirlas, porque las tres viven
 * en la app y se parecen:
 *
 * - **Este horario**: a qué horas trabaja normalmente. Es lo que decide qué
 *   huecos se le pueden reservar.
 * - **"Disponible ahora"**: un interruptor para las urgencias, que dice si en
 *   este momento sale corriendo a una avería.
 * - **Horario de urgencias**: el que una empresa fija a cada trabajador, con
 *   su tarifa propia por esa hora.
 *
 * Aquí no se pone ningún precio: lo que cobra por su trabajo normal ya está en
 * sus oficios, y cada oficio tiene el suyo.
 *
 * ## Las dos mitades de la pantalla
 *
 * **El mes en rejilla** es para las excepciones: "este jueves solo por la
 * mañana", "este sábado sí". Tocar un día lo abre debajo, y al guardar se
 * pregunta lo único que la rejilla no puede saber —si es para ese día o para
 * todos los jueves—.
 *
 * **El horario de todas las semanas** es la base de la que sale casi todo el
 * mes, y va listado aparte, día de la semana por día de la semana. Hace falta
 * verlo entero: desde el calendario solo se llega a él de uno en uno y por el
 * camino largo, y quien quiere cambiar "los lunes" no está pensando en ninguna
 * fecha. Ahí está también el atajo de poner varios días a la vez.
 *
 * ## Quién puede tocar qué
 *
 * El horario de un empleado lo pone su empresa, así que a él se le explica en
 * vez de enseñarle un editor que el servidor va a rechazar. Con `employeeId` en
 * la dirección, quien edita es la empresa y la pantalla es la misma.
 */

import { useEffect, useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { InfoCard } from '@/components/molecules/InfoCard'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { Dialog } from '@/components/organisms/Dialog'
import { MonthCalendar } from '@/components/organisms/MonthCalendar'
import {
  useAvailabilityCalendar,
  useSetAvailabilityDay,
  useSetAvailabilityWeekdays,
} from '@/hooks/domain/useAvailabilityCalendar'
import { useMyHolidays } from '@/hooks/domain/useMyHolidays'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import type { ApiCalendarDay, ApiDayWindow } from '@/api/pros.api'
import {
  WEEKDAY_NAMES,
  atTime,
  formatDate,
  formatIsoDayLong,
  formatTime,
  monthOf,
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

/** De lunes a viernes: lo que trae marcado el atajo antes de tocarlo */
const WORKWEEK = [1, 2, 3, 4, 5]

/**
 * Tres letras por día, y no la inicial.
 *
 * **La inicial no vale**: martes y miércoles empiezan los dos por "m", así que
 * la fila de siete botones salía con dos iguales y no había forma de saber cuál
 * se estaba marcando. El calendario lo resuelve con la "X" de siempre, pero ahí
 * hay una cabecera de columna con siete casillas debajo que sitúan; un botón
 * suelto en un diálogo no tiene ese apoyo.
 */
const WEEKDAY_SHORT: Record<number, string> = {
  0: 'DOM',
  1: 'LUN',
  2: 'MAR',
  3: 'MIÉ',
  4: 'JUE',
  5: 'VIE',
  6: 'SÁB',
}

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

/** Las franjas de un día tal y como se editan: sin el `endsNextDay`, que se deduce */
function toDraft(day: ApiCalendarDay): ApiDayWindow[] {
  return day.windows.map((window) => ({ from: window.from, to: window.to }))
}

/** "09:00–14:00 · 16:00–20:00", o el vacío que hay que leer como tal */
function readableHours(windows: ApiDayWindow[]): string {
  if (windows.length === 0) return 'Sin horario'

  return windows.map((window) => `${window.from}–${window.to}`).join(' · ')
}

/**
 * Las franjas de un día, editables.
 *
 * Se usa en los dos sitios que editan horas —el día suelto del calendario y el
 * día de la semana— y por eso vive aquí y no escrito dos veces: son la misma
 * pieza, y en dos copias una acabaría aceptando lo que la otra rechaza.
 */
function HourRows({
  windows,
  onPatch,
  onRemove,
  disabled,
  prefix,
}: {
  windows: ApiDayWindow[]
  onPatch: (index: number, changes: Partial<ApiDayWindow>) => void
  onRemove: (index: number) => void
  disabled: boolean
  /** El principio del `testID` de cada franja, para distinguir los dos usos */
  prefix: string
}) {
  return (
    <View style={styles.list}>
      {windows.map((window, index) => (
        <InfoCard key={index} style={styles.window} testID={`${prefix}-${index}`}>
          <View style={styles.hours}>
            <View style={styles.hour}>
              <FormField label="Desde">
                <DateTimeField
                  value={toDate(window.from)}
                  onChange={(picked) => onPatch(index, { from: formatTime(picked) })}
                  mode="time"
                  disabled={disabled}
                  testID={`${prefix}-${index}-from`}
                />
              </FormField>
            </View>

            <View style={styles.hour}>
              <FormField label="Hasta">
                <DateTimeField
                  value={toDate(window.to)}
                  onChange={(picked) => onPatch(index, { to: formatTime(picked) })}
                  mode="time"
                  disabled={disabled}
                  testID={`${prefix}-${index}-to`}
                />
              </FormField>
            </View>
          </View>

          {/*
            Hay oficios de noche —vigilancia, limpieza de locales, grúas—, así
            que cruzar la medianoche se dice en vez de dejar que parezca un
            error.
          */}
          {window.to < window.from && (
            <Text style={styles.overnight}>Termina al día siguiente por la mañana.</Text>
          )}

          {window.from === window.to && (
            <Text style={styles.invalid}>
              Las dos horas no pueden ser la misma. Para el día entero, de 00:00 a
              23:59.
            </Text>
          )}

          <Pressable
            onPress={() => onRemove(index)}
            disabled={disabled}
            accessibilityRole="button"
            style={styles.remove}
            testID={`${prefix}-${index}-remove`}
          >
            <Text style={styles.removeText}>Quitar esta franja</Text>
          </Pressable>
        </InfoCard>
      ))}
    </View>
  )
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

  /**
   * El mes que se está mirando. Empieza por el del móvil y no por el que diga
   * el servidor porque hay que pedirle uno para que conteste; en cuanto
   * contesta, el día de hoy que manda es el suyo.
   */
  const [month, setMonth] = useState(() => monthOf(new Date()))

  const { data, isPending, isError, refetch, isFetching } = useAvailabilityCalendar(
    month,
    !blocked,
    employeeId,
  )

  const { setDay, clearDay, isSaving } = useSetAvailabilityDay(month, employeeId)
  const { apply, isSaving: isApplying } = useSetAvailabilityWeekdays(employeeId)

  const busy = isSaving || isApplying

  const [selected, setSelected] = useState<string | null>(null)

  /**
   * Al abrir, el día de hoy. Se hace con el `today` del servidor y no con el
   * del móvil: en las dos primeras horas de cada noche no son el mismo día, y
   * ese es justo el rato en que alguien se pone a cuadrar el horario de mañana.
   *
   * Solo la primera vez: si se recalculara en cada respuesta, cambiar de mes
   * devolvería la selección a hoy y no se podría abrir ningún día de octubre.
   */
  useEffect(() => {
    if (data && selected === null) setSelected(data.today)
  }, [data, selected])

  /**
   * Lo que se está editando de un día, mientras no se guarde.
   *
   * Lleva la fecha dentro para saber de qué día es: sin eso, tocar otro día
   * arrastraría las franjas a medias del anterior, que es la peor manera de
   * perder algo escrito.
   */
  const [draft, setDraft] = useState<{ date: string; windows: ApiDayWindow[] } | null>(
    null,
  )

  /** Si al guardar hay que preguntar "¿solo este día o todos los jueves?" */
  const [asking, setAsking] = useState(false)

  /** El atajo de varios días de la semana, mientras está abierto */
  const [shortcut, setShortcut] = useState<{
    weekdays: number[]
    from: string
    to: string
  } | null>(null)

  /** Qué día de la semana está abierto en el horario de siempre, si hay alguno */
  const [weekday, setWeekday] = useState<number | null>(null)

  /** Y lo que se esté escribiendo en él, con el día dentro por lo mismo que arriba */
  const [weekDraft, setWeekDraft] = useState<{
    weekday: number
    windows: ApiDayWindow[]
  } | null>(null)

  const day = data?.days.find((entry) => entry.date === selected) ?? null

  /*
    Lo que se pinta en el panel del día: lo que se está editando si es de este
    día, y si no, lo que hay guardado.
  */
  const editing = draft?.date === selected ? draft.windows : day ? toDraft(day) : []

  /** Se marca en cuanto se toca algo: sin esto, "Guardar" no sabría si hay qué */
  const touched = draft?.date === selected

  /**
   * El horario de siempre, agrupado por día de la semana.
   *
   * Llega en filas sueltas y ya partido por la medianoche, así que un turno de
   * noche se lee en dos trozos —"lunes 22:00–00:00" y "martes 00:00–06:00"—.
   * Se deja así a propósito: es lo que hay guardado, y juntarlo para enseñarlo
   * haría que lo que se ve y lo que se edita no fueran lo mismo.
   */
  const weeklyByWeekday = new Map<number, ApiDayWindow[]>()

  for (const window of data?.weekly ?? []) {
    const list = weeklyByWeekday.get(window.weekday) ?? []
    list.push({ from: window.from, to: window.to })
    weeklyByWeekday.set(window.weekday, list)
  }

  const weekEditing =
    weekday === null
      ? []
      : weekDraft?.weekday === weekday
        ? weekDraft.windows
        : (weeklyByWeekday.get(weekday) ?? [])

  const weekTouched = weekday !== null && weekDraft?.weekday === weekday

  /**
   * Los festivos que vienen y caen en días que trabaja.
   *
   * El calendario ya los marca uno a uno, pero solo los del mes que se está
   * mirando: esto avisa de los que vienen aunque estén en diciembre, que es
   * cuando sirve de algo enterarse.
   */
  const { data: calendar } = useMyHolidays(
    new Date().getFullYear(),
    !blocked,
    employeeId,
  )

  const today = toIsoDate(new Date())
  const upcomingHolidays = (calendar?.holidays ?? [])
    .filter((holiday) => holiday.date >= today && holiday.worksThatDay && !holiday.away)
    .slice(0, 3)

  const patch = (index: number, changes: Partial<ApiDayWindow>) => {
    if (!selected) return

    setDraft({
      date: selected,
      windows: editing.map((window, i) =>
        i === index ? { ...window, ...changes } : window,
      ),
    })
  }

  const add = () => {
    if (!selected) return

    // De nueve a seis: se cambia en dos toques y evita la fila vacía
    setDraft({ date: selected, windows: [...editing, { from: '09:00', to: '18:00' }] })
  }

  const remove = (index: number) => {
    if (!selected) return

    setDraft({ date: selected, windows: editing.filter((_, i) => i !== index) })
  }

  const patchWeek = (index: number, changes: Partial<ApiDayWindow>) => {
    if (weekday === null) return

    setWeekDraft({
      weekday,
      windows: weekEditing.map((window, i) =>
        i === index ? { ...window, ...changes } : window,
      ),
    })
  }

  const addWeek = () => {
    if (weekday === null) return

    setWeekDraft({ weekday, windows: [...weekEditing, { from: '09:00', to: '18:00' }] })
  }

  const removeWeek = (index: number) => {
    if (weekday === null) return

    setWeekDraft({ weekday, windows: weekEditing.filter((_, i) => i !== index) })
  }

  const isValid = editing.every((window) => window.from !== window.to)
  const isWeekValid = weekEditing.every((window) => window.from !== window.to)

  /** El resultado de cualquiera de las formas de guardar, contado igual */
  const report = async (
    run: () => Promise<{ ok: boolean; error: string | null }>,
    done: string,
  ) => {
    const { ok, error } = await run()

    if (!ok) {
      Alert.alert('No se ha podido guardar', error ?? 'Inténtalo de nuevo en un momento.')
      return
    }

    setDraft(null)
    setWeekDraft(null)
    Alert.alert('Horario guardado', done)
  }

  const saveThisDay = async () => {
    if (!selected) return

    setAsking(false)

    await report(
      () => setDay(selected, editing),
      editing.length === 0
        ? `El ${formatIsoDayLong(selected)} queda sin horario. Los demás ${
            WEEKDAY_NAMES[day?.weekday ?? 0]
          } siguen como estaban.`
        : `Guardado para el ${formatIsoDayLong(selected)}. Los demás ${
            WEEKDAY_NAMES[day?.weekday ?? 0]
          } siguen como estaban.`,
    )
  }

  const saveEveryWeek = async () => {
    if (!selected || !day) return

    setAsking(false)

    await report(
      () => apply([day.weekday], editing),
      `Guardado para todos los ${WEEKDAY_NAMES[day.weekday]}. Los días con algo puesto aparte siguen con lo suyo.`,
    )
  }

  const backToWeekly = async () => {
    if (!selected) return

    await report(
      () => clearDay(selected),
      `El ${formatIsoDayLong(selected)} vuelve a ir por tu horario de siempre.`,
    )
  }

  const saveWeekday = async () => {
    if (weekday === null) return

    await report(
      () => apply([weekday], weekEditing),
      weekEditing.length === 0
        ? `Los ${WEEKDAY_NAMES[weekday]} se quedan sin horario.`
        : `Guardado para todos los ${WEEKDAY_NAMES[weekday]}. Los días con algo puesto aparte siguen con lo suyo.`,
    )
  }

  const applyShortcut = async () => {
    if (!shortcut) return

    const { weekdays, from, to } = shortcut
    setShortcut(null)

    await report(
      () => apply(weekdays, from === to ? [] : [{ from, to }]),
      `Puesto en ${weekdays.length} ${weekdays.length === 1 ? 'día' : 'días'} de la semana. Los que no elegiste siguen como estaban.`,
    )
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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
            Toca un día del calendario para cambiar solo ese día. Tu horario de
            todas las semanas está más abajo. Aquí no va ningún precio: lo que
            cobras por tu trabajo ya está en tus oficios.
          </Text>
        </InfoCard>

        <View style={styles.calendarSlot}>
          <MonthCalendar
            month={month}
            days={data.days}
            today={data.today}
            selected={selected}
            onSelect={setSelected}
            onMonthChange={(next) => {
              /*
                Se suelta lo que hubiera a medias: pertenece a un día que ya no
                está en pantalla, y guardarlo después de dos meses de paseo
                sería guardar algo que nadie recuerda haber escrito.
              */
              setDraft(null)
              setMonth(next)
            }}
            busy={busy}
          />

          {isFetching && (
            <Text style={styles.updating} testID="availability-updating">
              actualizando…
            </Text>
          )}
        </View>

        {day && (
          <View style={styles.day} testID="availability-day">
            <Text style={styles.dayTitle}>{formatIsoDayLong(day.date)}</Text>

            {/*
              Lo que hace falta saber antes de tocar nada: de dónde salen estas
              horas, si es festivo y si ese día está fuera.
            */}
            <Text style={styles.daySource}>
              {day.source === 'weekly'
                ? `Va por tu horario de todos los ${WEEKDAY_NAMES[day.weekday]}.`
                : day.source === 'closed'
                  ? 'Tienes puesto que este día no trabajas.'
                  : 'Este día tiene horas puestas aparte.'}
            </Text>

            {day.holiday && (
              <Text style={styles.dayFlag} testID="availability-day-holiday">
                Es festivo: {day.holiday}. Si cobras recargo se decide en tus
                festivos.
              </Text>
            )}

            {day.away && (
              <Text style={styles.dayFlag} testID="availability-day-away">
                Este día estás fuera, así que no se te puede reservar aunque haya
                horario. Se quita desde tus ausencias.
              </Text>
            )}

            {day.commitments.length > 0 && (
              <View style={styles.commitments} testID="availability-commitments">
                <Text style={styles.commitmentsTitle}>Ya comprometido</Text>
                {day.commitments.map((commitment) => (
                  <View key={commitment.appointmentId} style={styles.commitment}>
                    <Text style={styles.commitmentHours}>
                      {commitment.from} – {commitment.to}
                      {commitment.endsNextDay ? ' (+1)' : ''}
                    </Text>
                    <Text style={styles.commitmentTitle} numberOfLines={1}>
                      {commitment.title}
                    </Text>
                  </View>
                ))}
                <Text style={styles.commitmentsNote}>
                  Esto no se cambia desde aquí: es un trabajo cerrado. Quitarle
                  el horario al día no lo cancela.
                </Text>
              </View>
            )}

            {editing.length === 0 ? (
              <Text style={styles.dayEmpty}>
                Este día no tiene horas. Sin ellas nadie puede reservarte.
              </Text>
            ) : (
              <HourRows
                windows={editing}
                onPatch={patch}
                onRemove={remove}
                disabled={busy}
                prefix="slot"
              />
            )}

            <Button
              variant="secondary"
              fullWidth
              onPress={add}
              disabled={busy}
              style={styles.add}
              testID="availability-add"
            >
              Añadir franja
            </Button>

            {/*
              Guardar pregunta antes si es para este día o para todos los que
              caen en el mismo día de la semana: es lo único que la rejilla no
              puede saber, y darlo por hecho en un sentido o en otro se
              equivocaría la mitad de las veces.
            */}
            <Button
              fullWidth
              loading={busy}
              disabled={!touched || !isValid || busy}
              onPress={() => setAsking(true)}
              style={styles.save}
              testID="availability-save"
            >
              Guardar
            </Button>

            {/*
              Volver al horario de siempre solo tiene sentido si ese día se ha
              salido de él. En un día normal el botón no diría nada.
            */}
            {day.source !== 'weekly' && (
              <Pressable
                onPress={() => void backToWeekly()}
                disabled={busy}
                accessibilityRole="button"
                style={styles.revert}
                testID="availability-revert"
              >
                <Text style={styles.revertText}>
                  Que este día vuelva a ir por mi horario de siempre
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/*
          El horario de todas las semanas, entero y a la vista. Es la base de la
          que sale casi todo el mes de arriba, y hasta ahora solo se llegaba a
          él día a día desde el calendario: quien quiere cambiar "los lunes" no
          está pensando en ninguna fecha concreta.
        */}
        <View style={styles.weekly} testID="availability-weekly">
          <Text style={styles.weeklyTitle}>
            {isForEmployee ? 'Su horario de todas las semanas' : 'Mi horario de todas las semanas'}
          </Text>
          <Text style={styles.weeklyNote}>
            Es lo que se repite solo cada semana. Toca un día para cambiarlo; lo
            que cambies aquí no toca los días que tengan algo puesto aparte.
          </Text>

          <View style={styles.weeklyList}>
            {WEEK_ORDER.map((number) => {
              const hours = weeklyByWeekday.get(number) ?? []
              const open = weekday === number

              return (
                <View key={number} style={styles.weeklyRowSlot}>
                  <Pressable
                    onPress={() => {
                      /*
                        Al cerrar o al cambiar de día se suelta lo escrito a
                        medias, por lo mismo que en el calendario: pertenece a un
                        día que ya no está delante.
                      */
                      setWeekDraft(null)
                      setWeekday(open ? null : number)
                    }}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    style={[styles.weeklyRow, open && styles.weeklyRowOpen]}
                    testID={`availability-weekly-${number}`}
                  >
                    <Text style={styles.weeklyDay}>{WEEKDAY_SHORT[number]}</Text>
                    <Text
                      style={[
                        styles.weeklyHours,
                        hours.length === 0 && styles.weeklyHoursOff,
                      ]}
                      numberOfLines={1}
                    >
                      {readableHours(hours)}
                    </Text>
                    <Text style={styles.weeklyChevron}>{open ? '⌄' : '›'}</Text>
                  </Pressable>

                  {open && (
                    <View style={styles.weeklyEditor} testID="availability-weekly-editor">
                      {weekEditing.length === 0 ? (
                        <Text style={styles.dayEmpty}>
                          Los {WEEKDAY_NAMES[number]} no tienes horario. Sin él
                          nadie puede reservarte ese día de la semana.
                        </Text>
                      ) : (
                        <HourRows
                          windows={weekEditing}
                          onPatch={patchWeek}
                          onRemove={removeWeek}
                          disabled={busy}
                          prefix="week-slot"
                        />
                      )}

                      <Button
                        variant="secondary"
                        fullWidth
                        onPress={addWeek}
                        disabled={busy}
                        style={styles.add}
                        testID="availability-weekly-add"
                      >
                        Añadir franja
                      </Button>

                      <Button
                        fullWidth
                        loading={busy}
                        disabled={!weekTouched || !isWeekValid || busy}
                        onPress={() => void saveWeekday()}
                        style={styles.save}
                        testID="availability-weekly-save"
                      >
                        Guardar los {WEEKDAY_NAMES[number]}
                      </Button>
                    </View>
                  )}
                </View>
              )
            })}
          </View>

          <Button
            variant="secondary"
            fullWidth
            onPress={() => setShortcut({ weekdays: WORKWEEK, from: '09:00', to: '18:00' })}
            disabled={busy}
            style={styles.shortcut}
            testID="availability-shortcut"
          >
            Poner varios días a la vez
          </Button>
        </View>

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
      </Animated.ScrollView>

      {/* ¿Este día, o todos los que caen igual? */}
      <Dialog
        visible={asking && day !== null}
        title="¿Para qué días?"
        message={
          day
            ? `Puedes guardarlo solo para el ${formatIsoDayLong(day.date)} o para todos los ${WEEKDAY_NAMES[day.weekday]}.`
            : undefined
        }
        actions={[
          {
            label: day ? `Solo el ${Number(day.date.slice(8))}` : 'Solo este día',
            onPress: () => void saveThisDay(),
            testID: 'availability-scope-day',
          },
          {
            label: day ? `Todos los ${WEEKDAY_NAMES[day.weekday]}` : 'Todas las semanas',
            onPress: () => void saveEveryWeek(),
            testID: 'availability-scope-weekly',
          },
        ]}
        onDismiss={() => setAsking(false)}
        testID="availability-scope"
      />

      {/* El atajo: las mismas horas a varios días de la semana */}
      <Dialog
        visible={shortcut !== null}
        title="Varios días a la vez"
        message="Marca los días y pon las horas. Va a tu horario de todas las semanas, y los días que no marques se quedan como estaban."
        actions={[
          {
            label: 'Poner en esos días',
            onPress: () => void applyShortcut(),
            /* Sin ningún día marcado el servidor lo rechaza; se corta antes */
            disabled: shortcut === null || shortcut.weekdays.length === 0,
            testID: 'availability-shortcut-apply',
          },
          {
            label: 'Cancelar',
            variant: 'secondary',
            onPress: () => setShortcut(null),
            testID: 'availability-shortcut-cancel',
          },
        ]}
        onDismiss={() => setShortcut(null)}
        testID="availability-shortcut-dialog"
      >
        {shortcut && (
          <View style={styles.shortcutBody}>
            {/*
              Las tres iniciales y una marca, no una letra suelta: martes y
              miércoles empiezan los dos por "m" y la fila salía con dos botones
              iguales. Y en dos líneas de cuatro y tres en vez de siete
              apretados, que en un móvil estrecho no se distinguían.
            */}
            <View style={styles.weekdays}>
              {WEEK_ORDER.map((number) => {
                const on = shortcut.weekdays.includes(number)

                return (
                  <Pressable
                    key={number}
                    onPress={() =>
                      setShortcut({
                        ...shortcut,
                        weekdays: on
                          ? shortcut.weekdays.filter((chosen) => chosen !== number)
                          : [...shortcut.weekdays, number],
                      })
                    }
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={WEEKDAY_NAMES[number]}
                    style={[styles.weekday, on && styles.weekdayOn]}
                    testID={`availability-weekday-${number}`}
                  >
                    <Text style={[styles.weekdayText, on && styles.weekdayTextOn]}>
                      {on ? '✓ ' : ''}
                      {WEEKDAY_SHORT[number]}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            {/* Los dos grupos que se piden siempre, para no marcar cinco veces */}
            <View style={styles.presets}>
              <Pressable
                onPress={() => setShortcut({ ...shortcut, weekdays: WORKWEEK })}
                accessibilityRole="button"
                style={styles.preset}
                testID="availability-preset-workweek"
              >
                <Text style={styles.presetText}>Entre semana</Text>
              </Pressable>

              <Pressable
                onPress={() => setShortcut({ ...shortcut, weekdays: [6, 0] })}
                accessibilityRole="button"
                style={styles.preset}
                testID="availability-preset-weekend"
              >
                <Text style={styles.presetText}>Fin de semana</Text>
              </Pressable>

              <Pressable
                onPress={() => setShortcut({ ...shortcut, weekdays: [...WEEK_ORDER] })}
                accessibilityRole="button"
                style={styles.preset}
                testID="availability-preset-all"
              >
                <Text style={styles.presetText}>Todos</Text>
              </Pressable>
            </View>

            <View style={styles.hours}>
              <View style={styles.hour}>
                <FormField label="Desde">
                  <DateTimeField
                    value={toDate(shortcut.from)}
                    onChange={(picked) =>
                      setShortcut({ ...shortcut, from: formatTime(picked) })
                    }
                    mode="time"
                    testID="availability-shortcut-from"
                  />
                </FormField>
              </View>

              <View style={styles.hour}>
                <FormField label="Hasta">
                  <DateTimeField
                    value={toDate(shortcut.to)}
                    onChange={(picked) =>
                      setShortcut({ ...shortcut, to: formatTime(picked) })
                    }
                    mode="time"
                    testID="availability-shortcut-to"
                  />
                </FormField>
              </View>
            </View>

            {shortcut.from === shortcut.to && (
              <Text style={styles.invalid}>
                Con las dos horas iguales, esos días se quedan sin horario.
              </Text>
            )}

            {shortcut.weekdays.length === 0 && (
              <Text style={styles.invalid}>Marca al menos un día.</Text>
            )}
          </View>
        )}
      </Dialog>
    </View>
  )
}
