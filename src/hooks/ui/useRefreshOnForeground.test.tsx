/**
 * Que volver a la app la ponga al día.
 *
 * Es la red por debajo de los avisos: un aviso se pierde por muchos motivos
 * —permiso denegado, el móvil sin servicios, Expo con un mal minuto— y quien
 * vuelve de otra app no puede encontrarse lo de hace media hora.
 *
 * Lo que se ata con más cuidado es que **se invalide y no solo se refresque**:
 * el `staleTime` por defecto de la app son cinco minutos, así que pedir sin
 * marcar caducado no traería nada en el rato en el que a uno le contestan un
 * mensaje. Es un fallo que no se ve: la app funciona, solo que enseñando lo
 * viejo.
 */

import { renderHook } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppState } from 'react-native'
import type { ReactNode } from 'react'
import { useRefreshOnForeground } from './useRefreshOnForeground'

/** El oyente de `AppState`, para poder simular que la app vuelve */
let onChange: ((state: string) => void) | null = null
let removed = 0

function montar(keys: unknown[][], enabled = true) {
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((
    _event: string,
    listener: (state: string) => void,
  ) => {
    onChange = listener
    return { remove: () => (removed += 1) }
  }) as unknown as typeof AppState.addEventListener)

  const client = new QueryClient()
  const invalidated: unknown[] = []
  client.invalidateQueries = jest.fn(({ queryKey }: { queryKey: unknown }) => {
    invalidated.push(queryKey)
    return Promise.resolve()
  }) as unknown as QueryClient['invalidateQueries']

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  const view = renderHook(() => useRefreshOnForeground(keys as never, enabled), { wrapper })

  return { invalidated, ...view }
}

describe('useRefreshOnForeground', () => {
  beforeEach(() => {
    onChange = null
    removed = 0
    jest.restoreAllMocks()
  })

  it('pide al montar: entrar en la pantalla es volver a ella', () => {
    const { invalidated } = montar([['jobs'], ['chat']])

    expect(invalidated).toEqual([['jobs'], ['chat']])
  })

  it('vuelve a pedir cuando la app regresa a primer plano', () => {
    const { invalidated } = montar([['jobs']])
    invalidated.length = 0

    onChange!('active')

    expect(invalidated).toEqual([['jobs']])
  })

  it('no pide al irse a segundo plano', () => {
    const { invalidated } = montar([['jobs']])
    invalidated.length = 0

    onChange!('background')

    expect(invalidated).toEqual([])
  })

  it('apagado no escucha ni pide', () => {
    const { invalidated } = montar([['jobs']], false)

    expect(invalidated).toEqual([])
    expect(onChange).toBeNull()
  })

  /**
   * Quien lo llama escribe el array en el cuerpo del componente
   * —`useRefreshOnForeground([['jobs']])`— y con la identidad se volvería a
   * suscribir en cada pintado, pidiendo de nuevo cada vez. Sería un bucle de
   * peticiones difícil de ver: la app va lenta y nadie sabe por qué.
   */
  it('un array nuevo con el mismo contenido no vuelve a pedir', () => {
    const client = new QueryClient()
    const invalidated: unknown[] = []
    client.invalidateQueries = jest.fn(({ queryKey }: { queryKey: unknown }) => {
      invalidated.push(queryKey)
      return Promise.resolve()
    }) as unknown as QueryClient['invalidateQueries']

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const { rerender } = renderHook(() => useRefreshOnForeground([['jobs']]), { wrapper })
    expect(invalidated).toHaveLength(1)

    rerender({})

    expect(invalidated).toHaveLength(1)
  })

  it('suelta el oyente al desmontarse', () => {
    const { unmount } = montar([['jobs']])

    unmount()

    expect(removed).toBe(1)
  })
})
