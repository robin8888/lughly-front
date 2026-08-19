/**
 * Los días que el profesional no está.
 *
 * Se atan tres cosas que fallarían sin ruido: que un empleado no vea un editor
 * que el servidor va a rechazar, que no se pueda guardar un tramo al revés, y
 * que el día suelto se lea como un día y no como un rango de uno a uno.
 */

import { render, fireEvent } from '@testing-library/react-native'
import { AbsencesPage } from './AbsencesPage'

/*
 * El prefijo `mock` no es adorno: es lo único que jest deja que una factoría
 * lea de fuera, porque `jest.mock` se eleva al principio del fichero.
 */
let mockEsEmpleado = false

jest.mock('@/hooks/domain/useIsEmployee', () => ({
  useIsEmployee: () => mockEsEmpleado,
}))

jest.mock('@/hooks/domain/useMyAbsences', () => ({
  useMyAbsences: () => ({
    data: [
      { id: 'a1', startsOn: '2026-08-17', endsOn: '2026-08-25', reason: 'Vacaciones' },
      { id: 'a2', startsOn: '2026-09-08', endsOn: '2026-09-08', reason: null },
    ],
    isPending: false,
    isError: false,
    refetch: () => {},
  }),
  useManageMyAbsences: () => ({
    add: () => Promise.resolve({ ok: true, error: null }),
    remove: () => Promise.resolve({ ok: true, error: null }),
    isWorking: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

describe('AbsencesPage', () => {
  beforeEach(() => {
    mockEsEmpleado = false
  })

  it('lista los tramos marcados', () => {
    const { getByTestId } = render(<AbsencesPage onBack={() => {}} />)

    expect(getByTestId('absence-a1')).toBeTruthy()
    expect(getByTestId('absence-a2')).toBeTruthy()
  })

  it('un solo día se lee como un día, no como un rango', () => {
    /*
     * "Del 8 de septiembre al 8 de septiembre" es correcto y suena a error de
     * la app. Quien marca un día suelto tiene que leer un día suelto.
     */
    const { getByText } = render(<AbsencesPage onBack={() => {}} />)

    // `formatDate` da 08/09/2026, que es como se escribe una fecha en la app
    expect(getByText('El 08/09/2026')).toBeTruthy()
  })

  it('el motivo se ve aquí, que es de quien lo escribió', () => {
    const { getByText } = render(<AbsencesPage onBack={() => {}} />)

    expect(getByText('Vacaciones')).toBeTruthy()
  })

  it('no deja marcar un tramo que termina antes de empezar', () => {
    const { getByTestId, getByText } = render(<AbsencesPage onBack={() => {}} />)

    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 3)
    fireEvent(getByTestId('absence-to'), 'onChange', ayer)

    expect(getByTestId('absences-add')).toBeDisabled()
    expect(getByText(/no puede ser anterior/)).toBeTruthy()
  })

  it('al empleado le explica que sus días los lleva su empresa', () => {
    mockEsEmpleado = true

    const { getByTestId, queryByTestId } = render(<AbsencesPage onBack={() => {}} />)

    expect(getByTestId('absences-employee')).toBeTruthy()
    expect(queryByTestId('absences-add')).toBeNull()
  })
})
