/**
 * La rejilla del mes.
 *
 * Lo que se ata es la colocación: la semana empieza en lunes y el `weekday` que
 * viaja cuenta desde el domingo, así que hay una conversión, y si se equivoca
 * **el mes entero sale corrido un día** sin que nada falle. Es el fallo típico
 * de un calendario y no se ve en una captura si no se cuenta.
 */

import { render, fireEvent } from '@testing-library/react-native'
import type { ApiCalendarDay } from '@/api/pros.api'
import { MonthCalendar } from './MonthCalendar'

/** Septiembre de 2026: el día 1 es martes y el mes tiene 30 días */
function septiembre(cambios: Record<string, Partial<ApiCalendarDay>> = {}) {
  const days: ApiCalendarDay[] = []

  for (let numero = 1; numero <= 30; numero += 1) {
    const date = `2026-09-${String(numero).padStart(2, '0')}`

    days.push({
      date,
      weekday: new Date(Date.UTC(2026, 8, numero)).getUTCDay(),
      windows: [],
      source: 'weekly',
      away: false,
      holiday: null,
      commitments: [],
      ...cambios[date],
    })
  }

  return days
}

function pintar(props: Partial<React.ComponentProps<typeof MonthCalendar>> = {}) {
  return render(
    <MonthCalendar
      month="2026-09"
      days={septiembre()}
      today="2026-09-16"
      selected="2026-09-16"
      onSelect={() => {}}
      onMonthChange={() => {}}
      {...props}
    />,
  )
}

describe('MonthCalendar', () => {
  it('encabeza con el mes en curso', () => {
    const { getByTestId } = pintar()

    expect(getByTestId('month-calendar-month')).toHaveTextContent('septiembre 2026')
  })

  it('pinta todos los días del mes', () => {
    const { getByTestId, queryByTestId } = pintar()

    expect(getByTestId('month-calendar-day-2026-09-01')).toBeTruthy()
    expect(getByTestId('month-calendar-day-2026-09-30')).toBeTruthy()
    expect(queryByTestId('month-calendar-day-2026-09-31')).toBeNull()
  })

  /**
   * El 1 de septiembre de 2026 es martes, así que le toca **un** hueco delante:
   * el del lunes. Si la cuenta se hiciera desde el domingo saldrían dos, y todo
   * el mes quedaría corrido una columna.
   */
  it('deja delante los huecos que hacen falta para que el día 1 caiga en su columna', () => {
    const { getByTestId, queryByTestId } = pintar()

    // Martes: un hueco delante, el del lunes
    expect(getByTestId('month-calendar-pad-0')).toBeTruthy()
    expect(queryByTestId('month-calendar-pad-1')).toBeNull()
  })

  /**
   * El domingo es el caso que se rompe si la cuenta se hace desde `getDay()` sin
   * convertir: sale en la primera columna en vez de en la última, y con él se
   * corre el mes entero.
   */
  it('un mes que empieza en domingo lleva seis huecos delante', () => {
    // 1 de noviembre de 2026, domingo
    const noviembre = Array.from({ length: 30 }, (_, index) => ({
      date: `2026-11-${String(index + 1).padStart(2, '0')}`,
      weekday: new Date(Date.UTC(2026, 10, index + 1)).getUTCDay(),
      windows: [],
      source: 'weekly' as const,
      away: false,
      holiday: null,
      commitments: [],
    }))

    expect(noviembre[0]!.weekday).toBe(0)

    const { getByTestId, queryByTestId } = pintar({
      month: '2026-11',
      days: noviembre,
      today: '2026-11-01',
      selected: null,
    })

    expect(getByTestId('month-calendar-pad-5')).toBeTruthy()
    expect(queryByTestId('month-calendar-pad-6')).toBeNull()
  })

  it('avisa de qué días se trabaja y cuáles están comprometidos', () => {
    const { getByLabelText } = pintar({
      days: septiembre({
        '2026-09-17': {
          windows: [{ from: '09:00', to: '14:00', endsNextDay: false }],
          commitments: [
            {
              appointmentId: 'a1',
              jobId: 'j1',
              title: 'Caldera',
              from: '11:00',
              to: '12:00',
              endsNextDay: false,
              status: 'CONFIRMED',
            },
          ],
        },
      }),
    })

    /*
      Quien no ve los puntos de color tiene que enterarse igual: la etiqueta
      dice las horas y cuántos trabajos hay.
    */
    expect(getByLabelText(/17 .*de 09:00 a 14:00.*1 trabajo/)).toBeTruthy()
  })

  it('dice cuál es hoy', () => {
    const { getByLabelText } = pintar()

    expect(getByLabelText(/^16 \(hoy\)/)).toBeTruthy()
  })

  it('un día fuera se anuncia como fuera y no como sin horario', () => {
    const { getByLabelText } = pintar({
      days: septiembre({
        '2026-09-18': {
          away: true,
          windows: [{ from: '09:00', to: '14:00', endsNextDay: false }],
        },
      }),
    })

    // Tiene horario, pero está de vacaciones: manda lo segundo
    expect(getByLabelText(/18 .*fuera/)).toBeTruthy()
  })

  it('tocar un día lo elige', () => {
    const elegir = jest.fn()
    const { getByTestId } = pintar({ onSelect: elegir })

    fireEvent.press(getByTestId('month-calendar-day-2026-09-19'))

    expect(elegir).toHaveBeenCalledWith('2026-09-19')
  })

  it('las flechas van al mes de al lado', () => {
    const cambiar = jest.fn()
    const { getByTestId } = pintar({ onMonthChange: cambiar })

    fireEvent.press(getByTestId('month-calendar-next'))
    expect(cambiar).toHaveBeenCalledWith('2026-10')

    fireEvent.press(getByTestId('month-calendar-prev'))
    expect(cambiar).toHaveBeenCalledWith('2026-08')
  })

  /** Enero y diciembre son los dos que se saltan de año */
  it('las flechas cruzan el cambio de año', () => {
    const cambiar = jest.fn()
    const { getByTestId } = pintar({ month: '2026-12', onMonthChange: cambiar })

    fireEvent.press(getByTestId('month-calendar-next'))

    expect(cambiar).toHaveBeenCalledWith('2027-01')
  })

  it('mientras guarda no se puede cambiar de mes ni de día', () => {
    const elegir = jest.fn()
    const cambiar = jest.fn()

    const { getByTestId } = pintar({ busy: true, onSelect: elegir, onMonthChange: cambiar })

    fireEvent.press(getByTestId('month-calendar-day-2026-09-19'))
    fireEvent.press(getByTestId('month-calendar-next'))

    expect(elegir).not.toHaveBeenCalled()
    expect(cambiar).not.toHaveBeenCalled()
  })
})
