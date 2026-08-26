/**
 * El horario de urgencias, y por qué no se puede guardar.
 *
 * Una franja recién añadida nace sin tarifa, así que el botón está apagado
 * desde el primer momento. El aviso existía —dentro de la franja, junto al
 * campo— pero la lista crece hacia abajo: con tres días puestos, el que falla
 * se queda fuera de pantalla y desde el botón solo se ve un botón muerto.
 *
 * Es el mismo fallo que ya se corrigió en el alta de cuenta: validación
 * correcta, cero señales donde se mira.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'
import type { ApiUrgencyWindow } from '@/api/employees.api'
import { UrgencySchedulePage } from './UrgencySchedulePage'

/** Lo que se le manda al servidor al guardar */
const guardado: ApiUrgencyWindow[][] = []

jest.mock('@/hooks/domain/useUrgencyWindows', () => ({
  useUrgencyWindows: () => ({
    data: [],
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useSetUrgencyWindows: () => ({
    save: (windows: unknown) => {
      guardado.push(windows as never)
      return Promise.resolve({ ok: true, error: null })
    },
    isSaving: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

/** Añade `n` franjas, que nacen de lunes a viernes y sin tarifa */
const anadir = (n: number) => {
  for (let i = 0; i < n; i += 1) {
    fireEvent.press(screen.getByTestId('urgency-schedule-add'))
  }
}

describe('UrgencySchedulePage', () => {
  beforeEach(() => {
    guardado.length = 0
  })

  it('sin franjas se puede guardar: es "no atiendo urgencias"', () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    expect(screen.getByTestId('urgency-schedule-save')).not.toBeDisabled()
    expect(screen.queryByTestId('urgency-schedule-missing')).toBeNull()
  })

  /**
   * El caso que se reportó: tres días puestos y el botón apagado. Lo que
   * faltaba no era la validación sino decirlo donde se mira.
   */
  it('dice qué falta cuando el botón está apagado', () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    anadir(3)

    expect(screen.getByTestId('urgency-schedule-save')).toBeDisabled()

    expect(screen.getByTestId('urgency-schedule-missing')).toBeTruthy()
    // Una línea por franja, nombrando sus días
    expect(
      screen.getAllByText(/Falta lo que cobras por hora en la franja de lunes/),
    ).toHaveLength(3)
  })

  /**
   * Lo que se pidió: una guardia de lunes a viernes se escribe **una vez**.
   * Antes había que rellenar cinco franjas con la misma hora y la misma
   * tarifa, y cambiar el precio obligaba a repasar las cinco.
   */
  it('una sola franja cubre varios días y se guarda como uno por día', async () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    anadir(1)
    fireEvent.changeText(screen.getByTestId('window-0-rate'), '60')
    fireEvent.press(screen.getByTestId('urgency-schedule-save'))

    await waitFor(() => expect(guardado).toHaveLength(1))

    // Cinco filas, una por día laborable, con el mismo horario y tarifa
    expect(guardado[0]).toHaveLength(5)
    expect(guardado[0]!.map((w) => w.weekday)).toEqual([1, 2, 3, 4, 5])
    expect(guardado[0]!.every((w) => w.hourlyRate === 60 && w.from === '22:00')).toBe(true)
  })

  it('los atajos ponen los días de un toque', () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    anadir(1)
    fireEvent.press(screen.getByTestId('window-0-days-weekend'))
    fireEvent.changeText(screen.getByTestId('window-0-rate'), '60')

    expect(screen.getByTestId('urgency-schedule-save')).not.toBeDisabled()
  })

  /** Sin ningún día no hay franja que guardar, y se dice cuál es */
  it('avisa de la franja que se ha quedado sin días', () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    anadir(1)
    fireEvent.changeText(screen.getByTestId('window-0-rate'), '60')

    for (const weekday of [1, 2, 3, 4, 5]) {
      fireEvent.press(screen.getByTestId(`window-0-day-${weekday}`))
    }

    expect(screen.getByText(/no tiene ningún día elegido/)).toBeTruthy()
    expect(screen.getByTestId('urgency-schedule-save')).toBeDisabled()
  })

  it('en cuanto se ponen todas las tarifas, deja guardar', () => {
    render(<UrgencySchedulePage employeeId={undefined} onBack={() => {}} />)

    anadir(2)

    fireEvent.changeText(screen.getByTestId('window-0-rate'), '45')
    fireEvent.changeText(screen.getByTestId('window-1-rate'), '60')

    expect(screen.queryByTestId('urgency-schedule-missing')).toBeNull()
    expect(screen.getByTestId('urgency-schedule-save')).not.toBeDisabled()
  })
})
