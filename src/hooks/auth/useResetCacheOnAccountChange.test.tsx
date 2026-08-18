/**
 * Que lo cacheado de una cuenta no se le enseñe a otra.
 *
 * Es un fallo invisible leyendo el código: cada pieza es razonable por su
 * cuenta —un `QueryClient` que vive lo que la app, claves sin el id del
 * usuario, cinco minutos de frescura— y solo juntas producen que la respuesta
 * del administrador se le sirva al siguiente que entre.
 */

import { renderHook } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useResetCacheOnAccountChange } from './useResetCacheOnAccountChange'

const usuario = (id: string): User => ({
  id,
  email: `${id}@ejemplo.test`,
  name: id,
  role: 'pro',
  verified: false,
  emailVerified: true,
  avatarUrl: null,
  mustChangePassword: false,
  phone: null,
})

function montar() {
  const client = new QueryClient()
  client.setQueryData(['me', 'documents'], { items: ['algo'] })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )

  const view = renderHook(() => useResetCacheOnAccountChange(), { wrapper })

  return { client, ...view }
}

describe('useResetCacheOnAccountChange', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: usuario('leti') })
  })

  it('no tira nada mientras no cambie la cuenta', () => {
    const { client, rerender } = montar()

    rerender({})

    expect(client.getQueryData(['me', 'documents'])).toBeDefined()
  })

  it('vacía la caché al entrar con otra cuenta', () => {
    const { client, rerender } = montar()

    // Sale Leti, entra el administrador
    useAuthStore.setState({ user: usuario('admin') })
    rerender({})

    expect(client.getQueryData(['me', 'documents'])).toBeUndefined()
  })

  it('también al cerrar sesión, no solo al cambiar de una a otra', () => {
    const { client, rerender } = montar()

    useAuthStore.setState({ user: null })
    rerender({})

    expect(client.getQueryData(['me', 'documents'])).toBeUndefined()
  })

  it('arrancar con sesión guardada no cuenta como cambio', () => {
    /*
     * Al abrir la app con sesión restaurada, el primer render ve un usuario
     * donde antes no había ninguno. Si eso contara como cambio, se tiraría la
     * caché en cada arranque sin motivo.
     */
    const { client, rerender } = montar()

    rerender({})

    expect(client.getQueryData(['me', 'documents'])).toBeDefined()
  })
})
