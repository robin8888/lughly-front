/**
 * El aviso de confirmar el email.
 *
 * Lo que se ata es que "Ya lo he confirmado" **siempre** conteste algo. El 25
 * de agosto de 2026 el servidor estuvo unos segundos caído durante un
 * reinicio; el refresco falló, el `catch` se lo tragó y el aviso se quedó
 * igual. Desde fuera es indistinguible de un botón roto, y esa duda costó
 * media tarde.
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { VerifyEmailNotice } from './VerifyEmailNotice'

/*
 * El prefijo `mock` no es adorno: es lo unico que jest deja que una factoria
 * lea de fuera, porque `jest.mock` se eleva al principio del fichero.
 */
const mockMe = jest.fn()

jest.mock('@/api', () => {
  const actual = jest.requireActual('@/api')

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      me: () => mockMe(),
      resendVerification: jest.fn().mockResolvedValue(undefined),
    },
  }
})

const mockSinConfirmar = {
  id: 'u1',
  email: 'robin@yopmail.com',
  name: 'Robinson',
  role: 'pro' as const,
  verified: false,
  emailVerified: false,
  avatarUrl: null,
  mustChangePassword: false,
  phone: null,
}

let mockUsuario: typeof mockSinConfirmar = mockSinConfirmar

jest.mock('@/stores/useAuthStore', () => ({
  useUser: () => mockUsuario,
  useAuthStore: Object.assign(
    (selector: (state: unknown) => unknown) =>
      selector({ updateUser: (u: typeof mockSinConfirmar) => (mockUsuario = u) }),
    { getState: () => ({ isAuthenticated: true }) },
  ),
}))

describe('VerifyEmailNotice', () => {
  beforeEach(() => {
    mockUsuario = mockSinConfirmar
    mockMe.mockReset()
  })

  it('avisa cuando no se ha podido preguntar al servidor', async () => {
    mockMe.mockRejectedValue(new Error('sin red'))

    const screen = render(<VerifyEmailNotice />)
    fireEvent.press(screen.getByTestId('verify-email-check'))

    await waitFor(() =>
      expect(screen.getByTestId('verify-email-check-error')).toBeTruthy(),
    )
  })

  /**
   * El caso que más despista: la llamada va bien, pero el email sigue sin
   * constar porque no se ha abierto el enlace. Sin mensaje, el aviso se queda
   * exactamente igual que si nada hubiera pasado.
   */
  it('avisa cuando se preguntó pero el email aún no consta', async () => {
    mockMe.mockResolvedValue({ ...mockSinConfirmar, emailVerified: false })

    const screen = render(<VerifyEmailNotice />)
    fireEvent.press(screen.getByTestId('verify-email-check'))

    await waitFor(() =>
      expect(screen.getByTestId('verify-email-check-pending')).toBeTruthy(),
    )
  })
})
