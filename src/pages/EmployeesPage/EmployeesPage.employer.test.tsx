/**
 * El alta como empleador, y por qué no deja continuar.
 *
 * Son cinco requisitos —forma jurídica, nombre fiscal, clase de documento,
 * número válido y la casilla— y el botón se apagaba sin decir cuál faltaba.
 * Con un formulario largo eso es un callejón: la casilla queda debajo del
 * identificador y el selector de documento se pasa por alto.
 */

import { render, screen, fireEvent } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { EmployeesPage } from './EmployeesPage'

jest.mock('@/hooks/domain/useEmployees', () => ({
  useEmployer: () => ({ data: { employer: null }, isPending: false, isError: false }),
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
    create: () => Promise.resolve(null),
    isCreating: false,
    fieldErrors: {},
    formError: null,
    reset: () => {},
  }),
  useRemoveEmployee: () => ({ remove: () => Promise.resolve({ ok: true }), isRemoving: false }),
}))

jest.mock('@/hooks/domain/usePaymentAccount', () => ({
  useAccountStatus: () => ({ data: null }),
  useRefreshAccountStatusOnForeground: () => {},
  useRequestOnboardingLink: () => ({ start: () => Promise.resolve({ ok: true }), isStarting: false }),
}))

jest.mock('@/hooks/ui/useCompactNav', () => ({ useNavScrollHandler: () => undefined }))

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => ({ id: 'u1', name: 'Felipe Riaño' }),
  useAccessToken: () => 'token',
}))

jest.mock('@/components/molecules/InfoCard', () => {
  const { View } = require('react-native')
  return { InfoCard: ({ children }: { children: ReactNode }) => <View>{children}</View> }
})

const pantalla = () =>
  render(
    <EmployeesPage
      onBack={() => {}}
      onUrgencySchedule={() => {}}
      onEmployeeSetting={() => {}}
    />,
  )

describe('EmployeesPage: alta como empleador', () => {
  it('dice qué falta en vez de dejar el botón muerto', () => {
    pantalla()

    expect(screen.getByTestId('employer-submit')).toBeDisabled()

    const faltan = screen.getByTestId('employer-missing')
    expect(faltan).toBeTruthy()
    expect(screen.getByText(/Elige si trabajas como autónomo/)).toBeTruthy()
    expect(screen.getByText(/Elige con qué documento/)).toBeTruthy()
    expect(screen.getByText(/Marca que respondes ante los clientes/)).toBeTruthy()
  })

  /**
   * El nombre fiscal viene puesto con el de la cuenta: para un autónomo son el
   * mismo dato, y pedirlo otra vez es pedir que se copie algo ya dado.
   */
  it('trae el nombre fiscal de la cuenta, así que ese no falta', () => {
    pantalla()

    expect(screen.getByTestId('employer-legal-name').props.value).toBe('Felipe Riaño')
    expect(screen.queryByText(/Escribe tu nombre fiscal/)).toBeNull()
  })

  /** Y el aviso se va campo a campo, no de golpe al final */
  it('el aviso de la casilla desaparece al marcarla', () => {
    pantalla()

    expect(screen.getByText(/Marca que respondes ante los clientes/)).toBeTruthy()

    fireEvent.press(screen.getByTestId('employer-responsibility'))

    expect(screen.queryByText(/Marca que respondes ante los clientes/)).toBeNull()
  })
})
