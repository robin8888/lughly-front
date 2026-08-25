/**
 * Alta de cuenta.
 *
 * Lo que se ata aquí es que pulsar "Crear cuenta" **siempre** produzca algo
 * visible. El formulario es largo y el botón está al final: si la validación
 * local rechaza y solo se pintan errores junto a cada campo, el usuario ve la
 * pantalla quieta y da por muerto el botón. Ese fue el fallo real del 25 de
 * agosto de 2026, y no lo cazaba ningún test porque el camino que falla sale
 * antes de tocar la API.
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { ApiError } from '@/api'
import { RegisterPage } from './RegisterPage'

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

jest.mock('@/hooks/auth/useRegistrationUploads', () => ({
  useRegistrationUploads: () => ({
    uploadAll: jest.fn().mockResolvedValue({ failed: [] }),
    isUploading: false,
  }),
}))

const mockSetAuth = jest.fn()
const mockClearAuth = jest.fn()

jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ setAuth: mockSetAuth, clearAuth: mockClearAuth }),
}))

jest.mock('@/stores/useRoleStore', () => ({
  useRoleStore: (selector: (state: unknown) => unknown) =>
    selector({ setActiveRole: jest.fn() }),
}))

/** Un alta de cliente con lo mínimo que el esquema da por bueno. */
function rellenarClienteValido(screen: ReturnType<typeof render>) {
  fireEvent.changeText(screen.getByTestId('register-name'), 'Robin Ruiz')
  fireEvent.changeText(
    screen.getByTestId('register-email'),
    'robin@ejemplo.test',
  )
  fireEvent.changeText(screen.getByTestId('register-password'), 'Contrasena10')
  fireEvent.press(screen.getByTestId('register-terms'))
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset()
    mockRegister.mockResolvedValue({
      user: { id: 'u1', email: 'robin@ejemplo.test', name: 'Robin Ruiz' },
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    })
  })

  it('manda el alta cuando el formulario de cliente está completo', async () => {
    const screen = render(<RegisterPage onSuccess={jest.fn()} onLogin={jest.fn()} />)

    rellenarClienteValido(screen)
    fireEvent.press(screen.getByTestId('register-submit'))

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1))
  })

  /**
   * En el backend `trades` y `city` son `optional()`, que deja que falten pero
   * no que lleguen en blanco: el array exige un oficio y la ciudad dos letras.
   * Mandarlos vacíos hacía que el alta de un cliente muriera con un 400
   * pidiéndole cosas que su formulario no muestra.
   */
  it('omite los campos de profesional en el alta de un cliente', async () => {
    const screen = render(<RegisterPage onSuccess={jest.fn()} onLogin={jest.fn()} />)

    rellenarClienteValido(screen)
    fireEvent.press(screen.getByTestId('register-submit'))

    await waitFor(() => expect(mockRegister).toHaveBeenCalledTimes(1))

    const enviado = mockRegister.mock.calls[0]![0] as Record<string, unknown>

    expect(enviado.role).toBe('client')
    expect(enviado.trades).toBeUndefined()
    expect(enviado.city).toBeUndefined()
  })

  /**
   * El otro fallo silencioso, y el que sufrió de verdad el 25 de agosto: la
   * validación local pasa, el backend rechaza con 400, y `useAuthError` sólo
   * marcaba los campos. Siete intentos seguidos sin una sola señal en
   * pantalla, con las siete peticiones registradas en el servidor.
   */
  it('avisa en la cabecera cuando el rechazo viene del backend', async () => {
    mockRegister.mockRejectedValue(
      new ApiError(400, {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos',
        details: [
          {
            field: 'phone',
            message: 'Escribe un teléfono válido, con prefijo si es de fuera de España',
          },
        ],
      }),
    )

    const screen = render(<RegisterPage onSuccess={jest.fn()} onLogin={jest.fn()} />)

    rellenarClienteValido(screen)
    fireEvent.press(screen.getByTestId('register-submit'))

    // El mensaje del campo, repetido donde el usuario sí lo ve
    await waitFor(() =>
      expect(screen.getByTestId('auth-form-error')).toHaveTextContent(
        'Escribe un teléfono válido, con prefijo si es de fuera de España',
      ),
    )
  })

  /**
   * El caso del fallo silencioso: sin aceptar los términos el esquema rechaza
   * antes de llamar a la API, y el único aviso vivía junto a la casilla, fuera
   * de pantalla desde el botón.
   */
  it('avisa en la cabecera cuando la validación local rechaza', async () => {
    const screen = render(<RegisterPage onSuccess={jest.fn()} onLogin={jest.fn()} />)

    fireEvent.changeText(screen.getByTestId('register-name'), 'Robin Ruiz')
    fireEvent.changeText(
      screen.getByTestId('register-email'),
      'robin@ejemplo.test',
    )
    fireEvent.changeText(screen.getByTestId('register-password'), 'Contrasena10')
    // Sin marcar la casilla de términos

    fireEvent.press(screen.getByTestId('register-submit'))

    await waitFor(() =>
      expect(screen.getByTestId('auth-form-error')).toBeTruthy(),
    )
    expect(mockRegister).not.toHaveBeenCalled()
  })
})
