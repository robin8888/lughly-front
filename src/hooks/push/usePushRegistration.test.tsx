/**
 * A nombre de quién queda este móvil para los avisos.
 *
 * El token que da Expo es **del aparato, no de la persona**, así que mientras
 * esté guardado a nombre de una cuenta es ella la que recibe todo. Eso hace
 * que cambiar de cuenta tenga que volver a registrarlo, y es justo lo que no
 * pasaba: el efecto colgaba de «hay sesión», un booleano que no se mueve
 * cuando se pasa de una cuenta a otra sin salir por el medio. El móvil se
 * quedaba a nombre del anterior y el nuevo no recibía **nada**.
 *
 * Se prueba porque el fallo es mudo por los dos lados: la app no da ningún
 * error —los avisos son un extra y todo va envuelto— y el servidor tampoco,
 * que busca los aparatos de esa persona, no encuentra ninguno y calla. Desde
 * fuera es idéntico a que el servidor no esté mandando nada, y se arregla en
 * el sitio contrario.
 */

import { renderHook, waitFor } from '@testing-library/react-native'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { usePushRegistration } from './usePushRegistration'

const registrados: { token: string; platform: string }[] = []

jest.mock('@/api/me.api', () => ({
  meApi: {
    registerDevice: (token: string, platform: string) => {
      registrados.push({ token, platform })
      return Promise.resolve({ ok: true })
    },
  },
}))

/* Un aparato de verdad, con permiso dado y su token */
jest.mock('expo-device', () => ({ isDevice: true }))
jest.mock('expo-notifications', () => ({
  setNotificationHandler: () => {},
  setNotificationChannelAsync: () => Promise.resolve(),
  getPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  requestPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  getExpoPushTokenAsync: () => Promise.resolve({ data: 'ExponentPushToken[xxx]' }),
  AndroidImportance: { HIGH: 4 },
}))
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'proyecto-1' } } } },
}))

const comoUsuario = (id: string | null) => {
  useAuthStore.setState(
    id === null
      ? { user: null, isAuthenticated: false }
      : { user: { id, name: 'Alguien' } as unknown as User, isAuthenticated: true },
  )
}

beforeEach(() => {
  registrados.length = 0
  comoUsuario(null)
})

describe('usePushRegistration', () => {
  it('registra el móvil a nombre de quien entra', async () => {
    comoUsuario('leticia')
    renderHook(() => usePushRegistration())

    await waitFor(() => expect(registrados).toHaveLength(1))
  })

  /**
   * El caso que fallaba. Sin pasar por «sin sesión» por el medio: es lo que
   * ocurre al entrar desde una pantalla con sesión viva, o si el refresco
   * devuelve otra cuenta.
   */
  it('vuelve a registrarlo cuando cambia la cuenta', async () => {
    comoUsuario('leticia')
    const { rerender } = renderHook(() => usePushRegistration())

    await waitFor(() => expect(registrados).toHaveLength(1))

    comoUsuario('robinson')
    rerender(undefined)

    await waitFor(() => expect(registrados).toHaveLength(2))
  })

  it('sin sesión no registra nada', async () => {
    renderHook(() => usePushRegistration())

    /* Un respiro por si lo hiciera tarde, que es como se colaría el fallo */
    await new Promise((listo) => setTimeout(listo, 20))

    expect(registrados).toEqual([])
  })
})
