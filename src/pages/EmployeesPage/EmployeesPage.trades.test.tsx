/**
 * Los oficios de un trabajador se ponen como los propios.
 *
 * Es el mismo dato en la misma tabla —lo que cambia es quién lo escribe—, y
 * hasta el 4 de septiembre de 2026 el alta de un trabajador solo sabía poner
 * precios por hora: una empresa de reformas no podía dar de alta a los suyos
 * como lo que son, gente a la que se llama para que vaya a ver y presupueste.
 *
 * Y lo que se pide se manda: el mínimo y la tarifa de urgencia estaban en el
 * formulario y se caían al enviar.
 */

import { render, screen, fireEvent } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { EmployeesPage } from './EmployeesPage'

jest.mock('@/hooks/domain/useEmployees', () => {
  const soporte = { creados: [] as unknown[] }

  return {
    soporte,
    useEmployer: () => ({
      data: {
        employer: {
          legalForm: 'COMPANY',
          taxIdKind: 'CIF',
          taxId: 'B12345678',
          legalName: 'Reformas Aguas SL',
          employeeCount: 0,
          trades: [],
          acceptedResponsibilityAt: '2026-09-01T09:00:00.000Z',
        },
      },
      isPending: false,
      isError: false,
    }),
    useEmployees: () => ({
      data: { items: [] },
      isPending: false,
      isError: false,
      refetch: () => {},
    }),
    useBecomeEmployer: () => ({
      declare: () => Promise.resolve({ ok: true }),
      isDeclaring: false,
      fieldErrors: {},
      formError: null,
      reset: () => {},
    }),
    useCreateEmployee: () => ({
      create: (payload: unknown) => {
        soporte.creados.push(payload)
        return Promise.resolve(null)
      },
      isCreating: false,
      fieldErrors: {},
      formError: null,
      reset: () => {},
    }),
    useRemoveEmployee: () => ({
      remove: () => Promise.resolve({ ok: true }),
      isRemoving: false,
    }),
  }
})

jest.mock('@/hooks/domain/usePaymentAccount', () => ({
  useAccountStatus: () => ({ data: null }),
  useRefreshAccountStatusOnForeground: () => {},
  useRequestOnboardingLink: () => ({
    start: () => Promise.resolve({ ok: true }),
    isStarting: false,
  }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => ({ id: 'u1', name: 'Felipe Riaño' }),
  useAccessToken: () => 'token',
}))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return {
    InfoCard: ({ children, testID }: { children: ReactNode; testID?: string }) => (
      <View testID={testID}>{children}</View>
    ),
  }
})

const { soporte } = jest.requireMock('@/hooks/domain/useEmployees')

/** Todo lo que no es el oficio: los datos de la persona */
function rellenarPersona() {
  fireEvent.changeText(screen.getByTestId('employee-name'), 'Tomás Cerrajero')
  fireEvent.changeText(screen.getByTestId('employee-email'), 'tomas@example.com')
  fireEvent.changeText(screen.getByTestId('employee-phone'), '600123123')
  fireEvent.changeText(screen.getByTestId('employee-national-id'), '12345678Z')
  fireEvent.changeText(screen.getByTestId('employee-city'), 'Madrid')
}

function abrirFormulario() {
  render(
    <EmployeesPage
      onBack={() => {}}
      onUrgencySchedule={() => {}}
      onEmployeeSetting={() => {}}
    />,
  )

  fireEvent.press(screen.getByTestId('employees-open-form'))
}

/** Añade fontanería, que es de los que se pueden cobrar yendo a ver */
function añadirFontaneria() {
  fireEvent.press(screen.getByTestId('trade-add'))
  fireEvent.press(screen.getByTestId('trade-add-option-fontaneria'))
}

beforeEach(() => {
  soporte.creados = []
})

describe('EmployeesPage: el oficio de un trabajador', () => {
  it('deja elegir cómo se cobra ese oficio, como en Mis oficios', () => {
    abrirFormulario()
    añadirFontaneria()

    expect(screen.getByTestId('trade-mode-fontaneria')).toBeTruthy()
    expect(screen.getByTestId('trade-mode-hourly-fontaneria')).toBeTruthy()
    expect(screen.getByTestId('trade-mode-visit-fontaneria')).toBeTruthy()
  })

  /**
   * Y el precio que se pide es el del modo elegido. Con la validación de
   * antes —que exigía siempre la hora— elegir "visita y presupuesto" dejaba
   * el botón apagado para siempre, sin decir por qué.
   */
  it('en visita pide la tarifa de visita, y con ella se puede dar de alta', () => {
    abrirFormulario()
    rellenarPersona()
    añadirFontaneria()

    fireEvent.press(screen.getByTestId('trade-mode-visit-fontaneria'))

    // Sin precio no se puede, y se dice cuál falta
    expect(screen.getByTestId('employee-submit')).toBeDisabled()
    expect(screen.getByText('Pon la tarifa de visita de fontanería.')).toBeTruthy()

    fireEvent.changeText(screen.getByTestId('trade-visit-fee-fontaneria'), '35')

    expect(screen.queryByTestId('employee-missing')).toBeNull()
    expect(screen.getByTestId('employee-submit')).not.toBeDisabled()

    fireEvent.press(screen.getByTestId('employee-submit'))

    expect(soporte.creados).toHaveLength(1)
    expect((soporte.creados[0] as { trades: unknown[] }).trades).toEqual([
      {
        slug: 'fontaneria',
        hourlyRate: null,
        visitFee: 35,
        minHours: null,
        urgencyHourlyRate: null,
        description: '',
      },
    ])
  })

  /** Lo que se pide se manda: el mínimo y la urgencia se caían al enviar */
  it('manda el mínimo y la tarifa de urgencia que escribió la empresa', () => {
    abrirFormulario()
    rellenarPersona()
    añadirFontaneria()

    fireEvent.changeText(screen.getByTestId('trade-rate-fontaneria'), '22')
    fireEvent.changeText(screen.getByTestId('trade-min-hours-fontaneria'), '2')
    fireEvent.changeText(screen.getByTestId('trade-urgency-fontaneria'), '40')

    fireEvent.press(screen.getByTestId('employee-submit'))

    expect((soporte.creados[0] as { trades: unknown[] }).trades).toEqual([
      {
        slug: 'fontaneria',
        hourlyRate: 22,
        visitFee: null,
        minHours: 2,
        urgencyHourlyRate: 40,
        description: '',
      },
    ])
  })

  /**
   * Y cuando no se puede dar de alta, se dice qué falta. El botón apagado sin
   * explicación es el callejón de siempre: hay cinco datos de la persona más
   * el precio de cada oficio, y el que se atasca —el precio recién añadido,
   * que nace vacío— queda arriba y fuera de vista.
   */
  it('dice qué falta en vez de dejar el botón muerto', () => {
    abrirFormulario()

    expect(screen.getByTestId('employee-submit')).toBeDisabled()

    const faltan = screen.getByTestId('employee-missing')
    expect(faltan).toBeTruthy()
    expect(screen.getByText('Escribe su nombre completo.')).toBeTruthy()
    expect(
      screen.getByText('Añade al menos un oficio: es por donde le busca el cliente.'),
    ).toBeTruthy()
    expect(screen.getByText('Escribe la ciudad donde trabaja.')).toBeTruthy()
  })
})
