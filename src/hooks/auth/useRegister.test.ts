/**
 * Alta: el modo de cobro de cada oficio.
 *
 * Un oficio se cobra por hora **o** por visita para presupuestar, nunca de las
 * dos formas: `proTradeSchema` en el servidor rechaza tanto los dos a la vez
 * como ninguno. Hasta el 25 de agosto de 2026 el alta no dejaba elegir, y su
 * esquema ni siquiera nombraba `pricingMode`, así que `safeParse` lo
 * descartaba en silencio.
 */

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { useRegister } from './useRegister'

const mockRegister = jest.fn()

jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api')

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      register: (...args: unknown[]) => mockRegister(...args),
    },
  }
})

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ setAuth: jest.fn() }),
}))

jest.mock('@/stores/useRoleStore', () => ({
  useRoleStore: (selector: (state: unknown) => unknown) =>
    selector({ setActiveRole: jest.fn() }),
}))

/** Elegida del autocompletado, o sea con coordenadas: el alta la exige así */
const direccion = {
  label: 'Calle Virgen del Puig 4, Valencia',
  lat: 39.4699,
  lng: -0.3763,
  city: 'Valencia',
  postcode: '46013',
}

const proBase = {
  name: 'Robinson Rodriguez',
  email: 'robin@yopmail.com',
  password: 'Contrasena10',
  phone: '699189483',
  role: 'pro' as const,
  address: direccion,
  city: 'Madrid',
  acceptTerms: true,
  acceptComms: false,
  hasStaff: false,
  acceptsStaffResponsibility: false,
}

/** Los oficios llegan del formulario como texto, con la coma que se teclee */
function oficio(overrides: Record<string, unknown>) {
  return {
    slug: 'fontaneria',
    pricingMode: 'HOURLY' as const,
    hourlyRate: '',
    visitFee: '',
    urgencyRate: '',
    description: '',
    ...overrides,
  }
}

describe('useRegister — modo de cobro', () => {
  beforeEach(() => {
    mockRegister.mockReset()
    mockRegister.mockResolvedValue({
      user: { id: 'u1', email: proBase.email, name: proBase.name, role: 'pro' },
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    })
  })

  it('manda visitFee y deja hourlyRate a null cuando se cobra por visita', async () => {
    const { result } = renderHook(() => useRegister())

    await act(async () => {
      await result.current.register({
        ...proBase,
        trades: [oficio({ pricingMode: 'VISIT', visitFee: '45,50' })],
      } as never)
    })

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1))

    const enviado = mockRegister.mock.calls[0]![0] as {
      trades: { hourlyRate: number | null; visitFee: number | null }[]
    }

    expect(enviado.trades[0]!.visitFee).toBe(45.5)
    expect(enviado.trades[0]!.hourlyRate).toBeNull()
  })

  it('manda hourlyRate y deja visitFee a null cuando se cobra por hora', async () => {
    const { result } = renderHook(() => useRegister())

    await act(async () => {
      await result.current.register({
        ...proBase,
        trades: [oficio({ pricingMode: 'HOURLY', hourlyRate: '25' })],
      } as never)
    })

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1))

    const enviado = mockRegister.mock.calls[0]![0] as {
      trades: { hourlyRate: number | null; visitFee: number | null }[]
    }

    expect(enviado.trades[0]!.hourlyRate).toBe(25)
    expect(enviado.trades[0]!.visitFee).toBeNull()
  })

  /**
   * Se exige la tarifa del modo elegido y solo esa: quien cobra por visita
   * deja vacío el campo de la hora a propósito, y pedírsela sería pedirle un
   * dato que ha decidido no tener.
   */
  it('exige la tarifa de visita, no la de hora, cuando el modo es visita', async () => {
    const { result } = renderHook(() => useRegister())

    await act(async () => {
      await result.current.register({
        ...proBase,
        trades: [oficio({ pricingMode: 'VISIT', hourlyRate: '25' })],
      } as never)
    })

    expect(mockRegister).not.toHaveBeenCalled()
    expect(result.current.formError).toBeTruthy()
  })
})
