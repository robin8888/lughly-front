/**
 * Contratar cuando el banco pide autenticación.
 *
 * Es el camino que estuvo roto hasta el 29 de agosto de 2026: el servidor
 * confirma el cobro con la tarjeta guardada, el banco exige 3D Secure y, sin
 * esto, ahí se acababa la contratación para siempre con esa tarjeta.
 *
 * Lo que se ata aquí es que el reto se abra, que después se **pregunte al
 * servidor** cómo acabó —no se da por bueno que el reto se cerrara— y que
 * cerrarlo a medias no acabe con un encargo dado por contratado.
 */

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-native'
import { useBookServices } from './useBookServices'

const mockBookServices = jest.fn()
const mockConfirmPayment = jest.fn()
const mockHandleNextAction = jest.fn()

jest.mock('@/api/assignments.api', () => ({
  assignmentsApi: {
    bookServices: (...args: unknown[]) => mockBookServices(...args),
    confirmPayment: (...args: unknown[]) => mockConfirmPayment(...args),
  },
}))

jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: () => ({ handleNextAction: (...args: unknown[]) => mockHandleNextAction(...args) }),
}))

const PAYLOAD = {
  tradeSlug: 'peluqueria',
  serviceIds: [],
  city: 'Madrid',
  addressLine: 'Calle Mayor 1',
  paymentMethodId: 'pm_1',
}

const RETENIDO = {
  jobId: 'job-1',
  amount: 77,
  status: 'booked' as const,
  charge: null,
  clientSecret: null,
}

const PIDE_AUTENTICACION = {
  jobId: 'job-1',
  amount: 77,
  status: 'requires_action' as const,
  charge: null,
  clientSecret: 'pi_1_secret',
}

function montar() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })

  return renderHook(() => useBookServices('pro-1'), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
}

beforeEach(() => {
  mockBookServices.mockReset()
  mockConfirmPayment.mockReset()
  mockHandleNextAction.mockReset()
})

describe('useBookServices', () => {
  it('camino normal: ni se abre ningún reto', async () => {
    mockBookServices.mockResolvedValue(RETENIDO)

    const { result } = montar()
    const booked = await result.current.book(PAYLOAD)

    expect(booked).toMatchObject({ jobId: 'job-1', status: 'booked' })
    expect(mockHandleNextAction).not.toHaveBeenCalled()
  })

  it('si el banco pide autenticación: reto, y después se lo preguntamos al servidor', async () => {
    mockBookServices.mockResolvedValue(PIDE_AUTENTICACION)
    mockHandleNextAction.mockResolvedValue({})
    mockConfirmPayment.mockResolvedValue(RETENIDO)

    const { result } = montar()
    const booked = await result.current.book(PAYLOAD)

    expect(mockHandleNextAction).toHaveBeenCalledWith('pi_1_secret')
    expect(mockConfirmPayment).toHaveBeenCalledWith('job-1')
    expect(booked).toMatchObject({ status: 'booked' })
  })

  it('si el cliente cierra el reto, no hay contrato y se dice por qué', async () => {
    mockBookServices.mockResolvedValue(PIDE_AUTENTICACION)
    mockHandleNextAction.mockResolvedValue({ error: { message: 'Autenticación cancelada' } })

    const { result, rerender } = montar()
    const booked = await result.current.book(PAYLOAD)
    rerender({})

    expect(booked).toBeNull()
    expect(mockConfirmPayment).not.toHaveBeenCalled()
    expect(result.current.formError).toBe('Autenticación cancelada')
  })

  it('si el servidor dice que el banco aún no ha confirmado, tampoco hay contrato', async () => {
    mockBookServices.mockResolvedValue(PIDE_AUTENTICACION)
    mockHandleNextAction.mockResolvedValue({})
    // El reto se cerró, pero Stripe sigue esperando: no se da por contratado
    mockConfirmPayment.mockResolvedValue(PIDE_AUTENTICACION)

    const { result, rerender } = montar()
    const booked = await result.current.book(PAYLOAD)
    rerender({})

    expect(booked).toBeNull()
    expect(result.current.formError).toContain('todavía no ha confirmado')
  })
})
