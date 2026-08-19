/**
 * El horario propio.
 *
 * Se atan dos cosas que fallarían en silencio: que a un empleado no se le
 * enseñe un editor que el servidor va a rechazar —su horario lo pone su
 * empresa—, y que no se pueda guardar una franja con la misma hora de inicio y
 * de fin, que es un error de dedo y no "todo el día".
 */

import { render, fireEvent } from '@testing-library/react-native'
import { AvailabilityPage } from './AvailabilityPage'

/*
 * Los dobles van dentro de las factorías a propósito: `jest.mock` se eleva al
 * principio del fichero y una constante de aquí abajo aún no existiría.
 *
 * El prefijo `mock` tampoco es adorno: es lo único que jest deja que una
 * factoría lea de fuera, justamente por lo mismo.
 */
let mockEsEmpleado = false

jest.mock('@/hooks/domain/useIsEmployee', () => ({
  useIsEmployee: () => mockEsEmpleado,
}))

jest.mock('@/hooks/domain/useMyAvailability', () => ({
  useMyAvailability: () => ({
    data: [
      { weekday: 1, from: '09:00', to: '14:00' },
      { weekday: 1, from: '16:00', to: '20:00' },
    ],
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useSetMyAvailability: () => ({
    save: () => Promise.resolve({ ok: true, error: null }),
    isSaving: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

describe('AvailabilityPage', () => {
  beforeEach(() => {
    mockEsEmpleado = false
  })

  it('pinta una tarjeta por franja', () => {
    const { getByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('slot-0')).toBeTruthy()
    expect(getByTestId('slot-1')).toBeTruthy()
  })

  it('al empleado le explica que su horario lo pone su empresa', () => {
    /*
     * Sin esto vería el editor, guardaría, y el servidor le devolvería un 403
     * después de la espera. El mensaje es el mismo pero llega antes y sin cara
     * de error.
     */
    mockEsEmpleado = true

    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    expect(getByTestId('availability-employee')).toBeTruthy()
    expect(queryByTestId('availability-add')).toBeNull()
  })

  it('quitar una franja la quita de la lista', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('slot-1-remove'))

    expect(queryByTestId('slot-1')).toBeNull()
    expect(getByTestId('slot-0')).toBeTruthy()
  })

  it('el atajo de oficina solo aparece con el horario vacío', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    // Con dos franjas puestas no estorba
    expect(queryByTestId('availability-preset')).toBeNull()

    fireEvent.press(getByTestId('slot-1-remove'))
    fireEvent.press(getByTestId('slot-0-remove'))

    expect(getByTestId('availability-preset')).toBeTruthy()
  })

  it('el atajo pone cinco días de lunes a viernes', () => {
    const { getByTestId, queryByTestId } = render(<AvailabilityPage onBack={() => {}} />)

    fireEvent.press(getByTestId('slot-1-remove'))
    fireEvent.press(getByTestId('slot-0-remove'))
    fireEvent.press(getByTestId('availability-preset'))

    expect(getByTestId('slot-4')).toBeTruthy()
    expect(queryByTestId('slot-5')).toBeNull()
  })

  it('no deja guardar si las dos horas son la misma', () => {
    const { getByTestId, getByText } = render(<AvailabilityPage onBack={() => {}} />)

    // El selector de hora devuelve una fecha; se fuerza a la hora de inicio
    const inicio = new Date()
    inicio.setHours(9, 0, 0, 0)
    fireEvent(getByTestId('slot-0-to'), 'onChange', inicio)

    expect(getByTestId('availability-save')).toBeDisabled()
    expect(getByText(/no pueden ser la misma/)).toBeTruthy()
  })
})

/**
 * Y el otro camino: la empresa editando el horario de un trabajador.
 *
 * Lo que se ata es que el aviso de "te lo pone tu empresa" **no** salga
 * entonces. Es la misma pantalla y el mismo `useIsEmployee`, así que sin
 * distinguirlo la empresa se encontraría el mensaje de su propio empleado y no
 * podría editar nada, que es justo el agujero que esto viene a tapar.
 */
describe('AvailabilityPage con un trabajador', () => {
  beforeEach(() => {
    mockEsEmpleado = false
  })

  it('deja editar el horario de un trabajador', () => {
    const { getByTestId, queryByTestId } = render(
      <AvailabilityPage onBack={() => {}} employeeId="u2" employeeName="Ana" />,
    )

    expect(getByTestId('availability-add')).toBeTruthy()
    expect(queryByTestId('availability-employee')).toBeNull()
  })

  it('encabeza con su nombre, para no confundirlo con el propio', () => {
    const { getByText } = render(
      <AvailabilityPage onBack={() => {}} employeeId="u2" employeeName="Ana" />,
    )

    expect(getByText('Ana')).toBeTruthy()
  })
})
