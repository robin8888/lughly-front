/**
 * MonthCalendar
 * Un mes en rejilla, como el calendario del móvil: se ve de un vistazo qué
 * días se trabaja y cuáles ya están pillados, y se toca uno para abrirlo.
 *
 * ## Qué dice cada casilla
 *
 * El número, y debajo hasta dos puntos: **azul** si ese día tiene horario,
 * **naranja** si hay algo comprometido en un trabajo. Los dos juntos son lo
 * normal en un día con trabajo; solo el naranja significa que hay una cita a
 * una hora en la que ya no tiene horario, y eso hay que poder verlo.
 *
 * Un día sin horario no lleva punto y se queda con el número apagado. Los días
 * fuera —vacaciones, baja— van tachados: no es lo mismo "ese día no trabajo"
 * que "estoy de vacaciones", y el segundo no se arregla desde aquí.
 *
 * ## La semana empieza en lunes
 *
 * Como en España, aunque el `weekday` que viaja siga contando desde el domingo
 * como `Date.getDay()`. Solo cambia en qué columna cae cada día, y esa cuenta
 * está en un sitio: `columnOf`.
 */

import { View, Text, Pressable } from 'react-native'
import type { ApiCalendarDay } from '@/api/pros.api'
import { formatMonth, shiftMonth } from '@/utils/dates'
import { styles } from './MonthCalendar.styles'

/** Las cabeceras de columna, ya en orden español */
const COLUMNS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/**
 * En qué columna cae un día. `weekday` es 0 domingo … 6 sábado, y la rejilla
 * empieza en lunes: el domingo pasa de la primera columna a la última.
 */
function columnOf(weekday: number): number {
  return (weekday + 6) % 7
}

export interface MonthCalendarProps {
  /** "AAAA-MM" */
  month: string
  days: ApiCalendarDay[]
  /** Hoy en España, "AAAA-MM-DD". Lo decide el servidor, no el móvil. */
  today: string
  /** El día abierto ahora mismo, o null */
  selected: string | null
  onSelect: (date: string) => void
  onMonthChange: (month: string) => void
  /** Mientras carga el mes, los controles no responden pero el mes sigue ahí */
  busy?: boolean
  testID?: string
}

export function MonthCalendar({
  month,
  days,
  today,
  selected,
  onSelect,
  onMonthChange,
  busy = false,
  testID = 'month-calendar',
}: MonthCalendarProps) {
  const first = days[0]

  /*
    Los huecos antes del día 1: tantos como columnas haya que saltarse para que
    caiga en la suya. Se sacan del propio día 1 y no de una cuenta de
    calendario aquí, que sería la segunda forma de calcular lo mismo.
  */
  const leading = first ? columnOf(first.weekday) : 0

  const [year, monthNumber] = month.split('-').map(Number)

  return (
    <View style={styles.calendar} testID={testID}>
      <View style={styles.monthBar}>
        <Pressable
          onPress={() => onMonthChange(shiftMonth(month, -1))}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
          hitSlop={8}
          style={styles.monthArrow}
          testID={`${testID}-prev`}
        >
          <Text style={styles.monthArrowIcon}>‹</Text>
        </Pressable>

        <Text style={styles.monthName} testID={`${testID}-month`}>
          {formatMonth(month)}
        </Text>

        <Pressable
          onPress={() => onMonthChange(shiftMonth(month, 1))}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
          hitSlop={8}
          style={styles.monthArrow}
          testID={`${testID}-next`}
        >
          <Text style={styles.monthArrowIcon}>›</Text>
        </Pressable>
      </View>

      <View style={styles.columns}>
        {COLUMNS.map((column, index) => (
          /*
            La inicial sola se repite —lunes y martes son las dos "M" en otras
            lenguas, aquí lo son martes y miércoles con "M" y "X"—, así que el
            lector de pantalla necesita el nombre entero. La `key` lleva el
            índice porque las iniciales no son únicas entre sí.
          */
          <Text
            key={`${column}-${index}`}
            style={styles.column}
            accessibilityLabel={COLUMN_NAMES[index]}
          >
            {column}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: leading }, (_, index) => (
          <View
            key={`hueco-${index}`}
            style={styles.cell}
            testID={`${testID}-pad-${index}`}
          />
        ))}

        {days.map((day) => {
          const isToday = day.date === today
          const isSelected = day.date === selected
          const works = day.windows.length > 0 && !day.away
          const busyDay = day.commitments.length > 0

          return (
            <Pressable
              key={day.date}
              onPress={() => onSelect(day.date)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={labelFor(day, isToday, year!, monthNumber!)}
              style={styles.cell}
              testID={`${testID}-day-${day.date}`}
            >
              <View
                style={[
                  styles.number,
                  isToday && styles.numberToday,
                  isSelected && styles.numberSelected,
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    !works && styles.numberTextOff,
                    day.away && styles.numberTextAway,
                    (isToday || isSelected) && styles.numberTextOn,
                  ]}
                >
                  {Number(day.date.slice(8))}
                </Text>
              </View>

              {/*
                Los puntos van fuera del círculo del número: dentro, el día
                seleccionado los taparía justo cuando se está mirando.
              */}
              <View style={styles.dots}>
                {works && <View style={[styles.dot, styles.dotWorks]} />}
                {busyDay && <View style={[styles.dot, styles.dotBusy]} />}
              </View>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotWorks]} />
          <Text style={styles.legendText}>Trabajas</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, styles.dotBusy]} />
          <Text style={styles.legendText}>Ya comprometido</Text>
        </View>
      </View>
    </View>
  )
}

/** Los nombres enteros de las columnas, para quien no ve la inicial */
const COLUMN_NAMES = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

/**
 * Lo que oye quien no ve la rejilla.
 *
 * Una casilla es un número suelto y dos puntos de color: sin esto, un lector de
 * pantalla diría "16" y ya está, que no dice si trabaja ni si tiene algo. Se
 * escribe entero porque es la única forma de usar el calendario sin verlo.
 */
function labelFor(
  day: ApiCalendarDay,
  isToday: boolean,
  year: number,
  month: number,
): string {
  const number = Number(day.date.slice(8))
  const parts = [`${number}`, isToday ? '(hoy)' : '']

  if (day.away) {
    parts.push('· fuera')
  } else if (day.windows.length === 0) {
    parts.push('· sin horario')
  } else {
    parts.push(
      `· ${day.windows.map((window) => `de ${window.from} a ${window.to}`).join(', ')}`,
    )
  }

  if (day.commitments.length > 0) {
    parts.push(
      `· ${day.commitments.length} ${
        day.commitments.length === 1 ? 'trabajo' : 'trabajos'
      }`,
    )
  }

  if (day.holiday) parts.push(`· festivo, ${day.holiday}`)

  /* El mes y el año al final: se dicen una vez y sitúan el número */
  parts.push(`· ${month}/${year}`)

  return parts.filter(Boolean).join(' ')
}
