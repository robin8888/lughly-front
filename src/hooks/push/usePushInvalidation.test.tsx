/**
 * Que un aviso recibido mueva la pantalla.
 *
 * Es el arreglo entero de "hay que salir y volver a entrar para enterarse":
 * los avisos ya se mandaban y el móvil ya registraba el token, pero nadie
 * escuchaba. Lo que se ata aquí es que se escuche —con la app abierta y al
 * tocar la notificación— y que **no** se escuche sin sesión, que es cuando las
 * peticiones saldrían sin con qué autenticarse.
 */

import { renderHook } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePushInvalidation } from './usePushInvalidation'

/** Los oyentes que el hook deja puestos, para poder dispararlos a mano */
let onReceived: ((notification: unknown) => void) | null = null
let onTapped: ((response: unknown) => void) | null = null
const removed: string[] = []

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: (listener: (n: unknown) => void) => {
    onReceived = listener
    return { remove: () => removed.push('received') }
  },
  addNotificationResponseReceivedListener: (listener: (r: unknown) => void) => {
    onTapped = listener
    return { remove: () => removed.push('tapped') }
  },
}))

/** Un aviso tal y como lo entrega Expo */
const aviso = (data: unknown) => ({ request: { content: { data } } })

function montar({ authenticated = true } = {}) {
  useAuthStore.setState({
    user: authenticated
      ? {
          id: 'u1',
          email: 'u1@ejemplo.test',
          name: 'Quien sea',
          role: 'pro',
          address: null,
          verified: false,
          emailVerified: true,
          avatarUrl: null,
          mustChangePassword: false,
          phone: null,
        }
      : null,
    accessToken: authenticated ? 'token' : null,
    isAuthenticated: authenticated,
  })

  const client = new QueryClient()
  const invalidated: unknown[] = []
  client.invalidateQueries = jest.fn(({ queryKey }: { queryKey: unknown }) => {
    invalidated.push(queryKey)
    return Promise.resolve()
  }) as unknown as QueryClient['invalidateQueries']

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  const view = renderHook(() => usePushInvalidation(), { wrapper })

  return { invalidated, ...view }
}

const contiene = (keys: unknown[], key: unknown[]) =>
  keys.some((candidate) => JSON.stringify(candidate) === JSON.stringify(key))

describe('usePushInvalidation', () => {
  beforeEach(() => {
    onReceived = null
    onTapped = null
    removed.length = 0
  })

  it('un aviso con la app abierta recarga lo que toca', () => {
    const { invalidated } = montar()

    onReceived!(aviso({ screen: 'jobs', jobId: 'job-1' }))

    expect(contiene(invalidated, ['jobs'])).toBe(true)
  })

  /**
   * Tocar la notificación abre o devuelve la app, y lo que enseñe tiene que
   * estar al día en ese primer pintado. Sin este segundo oyente, quien entra
   * desde el aviso ve justo lo viejo que el aviso le acaba de contradecir.
   */
  it('tocar la notificación también recarga', () => {
    const { invalidated } = montar()

    onTapped!({ notification: aviso({ screen: 'chat', threadId: 'hilo-1' }) })

    expect(invalidated).toEqual([['chat']])
  })

  it('sin sesión no escucha nada', () => {
    montar({ authenticated: false })

    expect(onReceived).toBeNull()
    expect(onTapped).toBeNull()
  })

  it('suelta los dos oyentes al desmontarse', () => {
    const { unmount } = montar()

    unmount()

    expect(removed).toEqual(['received', 'tapped'])
  })
})
