/**
 * Qué le falta a cada trabajador, visto desde la lista.
 *
 * Un trabajador dado de alta y dejado ahí **no aparece en ninguna búsqueda**:
 * sin punto en el mapa no entra en las listas por cercanía, sin horario nadie
 * puede reservarle una hora y sin franjas de guardia no le llega ninguna
 * urgencia. Y la ficha se veía exactamente igual con todo puesto que con nada.
 *
 * Por eso el color, y por eso también las palabras: el rojo lo tiene que poder
 * leer quien no distingue el rojo del verde.
 */

import { render, screen, within } from '@testing-library/react-native'
import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native'
import type { ReactNode } from 'react'
import type { ApiEmployee } from '@/api/employees.api'
import { theme } from '@/theme'
import { EmployeesPage } from './EmployeesPage'

jest.mock('@/hooks/domain/useEmployees', () => {
  const soporte = { items: [] as unknown[] }

  return {
    soporte,
    useEmployer: () => ({
      data: {
        employer: {
          legalForm: 'COMPANY',
          taxIdKind: 'CIF',
          taxId: 'B12345678',
          legalName: 'Reformas Aguas SL',
          employeeCount: soporte.items.length,
          trades: ['fontaneria'],
          acceptedResponsibilityAt: '2026-09-01T09:00:00.000Z',
        },
      },
      isPending: false,
      isError: false,
    }),
    useEmployees: () => ({
      data: { items: soporte.items },
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
      create: () => Promise.resolve(null),
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
  useAccountStatus: () => ({ data: { hasAccount: true, transfersEnabled: true } }),
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

/** Un trabajador recién dado de alta: sin nada de lo suyo puesto */
function trabajador(cambios: Partial<ApiEmployee> = {}): ApiEmployee {
  return {
    id: 'emp-1',
    name: 'Tomás Cerrajero',
    email: 'tomas@example.com',
    phone: '600123123',
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    trades: [{ slug: 'fontaneria', label: 'Fontanería' }],
    city: 'Madrid',
    identityVerified: false,
    pendingFirstLogin: true,
    setup: {
      urgencyWindows: 0,
      availabilityWindows: 0,
      hasLocation: false,
      hasPostcode: false,
      absences: 0,
      ...cambios.setup,
    },
    createdAt: '2026-09-04T09:00:00.000Z',
    ...cambios,
  }
}

const pantalla = () =>
  render(
    <EmployeesPage
      onBack={() => {}}
      onUrgencySchedule={() => {}}
      onEmployeeSetting={() => {}}
    />,
  )

/** El contorno de uno de los botones de ajuste */
const bordeDe = (testID: string): string | undefined =>
  (StyleSheet.flatten(screen.getByTestId(testID).props.style as never) as ViewStyle)
    .borderColor as string | undefined

/** El color con el que se pinta un texto de la ficha */
const colorDe = (testID: string): string | undefined =>
  (StyleSheet.flatten(screen.getByTestId(testID).props.style as never) as TextStyle)
    .color as string | undefined

describe('EmployeesPage: lo que le falta al trabajador', () => {
  it('sin nada puesto, los cuatro que hacen falta salen en rojo', () => {
    soporte.items = [trabajador()]

    pantalla()

    for (const boton of [
      'employee-schedule-emp-1',
      'employee-availability-emp-1',
      'employee-coverage-emp-1',
      'employee-holidays-emp-1',
    ]) {
      expect(within(screen.getByTestId(boton)).getByText(/· falta$/)).toBeTruthy()
    }

    expect(bordeDe('employee-coverage-emp-1')).toBe(theme.colors.urgency)

    // Y se dice con palabras para qué son, no solo con colores
    expect(
      screen.getByText(/Te falta configurarle esto para que pueda trabajar/),
    ).toBeTruthy()
  })

  it('con todo puesto, salen en verde y el aviso cambia', () => {
    soporte.items = [
      trabajador({
        setup: {
          urgencyWindows: 3,
          availabilityWindows: 5,
          hasLocation: true,
          hasPostcode: true,
          absences: 0,
        },
      }),
    ]

    pantalla()

    for (const boton of [
      'employee-schedule-emp-1',
      'employee-availability-emp-1',
      'employee-coverage-emp-1',
      'employee-holidays-emp-1',
    ]) {
      expect(within(screen.getByTestId(boton)).getByText(/· listo$/)).toBeTruthy()
    }

    expect(bordeDe('employee-coverage-emp-1')).toBe(theme.colors.available)
    expect(screen.getByText(/Ya lo tienes configurado/)).toBeTruthy()
  })

  /**
   * Los recargos nacen con los de la ley puestos y no tener días fuera es lo
   * normal: en rojo serían dos casillas que no se pueden completar nunca.
   */
  it('los recargos y los días fuera no se marcan ni en rojo ni en verde', () => {
    soporte.items = [trabajador()]

    pantalla()

    expect(
      within(screen.getByTestId('employee-surcharges-emp-1')).queryByText(/·/),
    ).toBeNull()
    expect(
      within(screen.getByTestId('employee-absences-emp-1')).queryByText(/·/),
    ).toBeNull()
  })

  /** Los dos avisos de que esa persona no está entera, en rojo */
  it('el correo sin validar y el DNI sin subir van en rojo', () => {
    soporte.items = [trabajador()]

    pantalla()

    expect(colorDe('employee-pending-login-emp-1')).toBe(theme.colors.urgency)
    expect(colorDe('employee-unverified-emp-1')).toBe(theme.colors.urgency)
  })
})
