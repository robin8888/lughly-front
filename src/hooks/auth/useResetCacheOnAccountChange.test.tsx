/**
 * Que lo cacheado de una cuenta no se le enseñe a otra.
 *
 * Es un fallo invisible leyendo el código: cada pieza es razonable por su
 * cuenta —un `QueryClient` que vive lo que la app, claves sin el id del
 * usuario, cinco minutos de frescura— y solo juntas producen que la respuesta
 * del administrador se le sirva al siguiente que entre.
 *
 * Y lo que se ata con más cuidado es **el arranque**, que es donde esto se
 * volvió en contra: la sesión se lee de forma asíncrona, así que durante los
 * primeros renders no hay usuario porque no se sabe todavía. Contarlo como
 * cambio de cuenta vaciaba la caché y borraba los avisos ya vistos en cada
 * apertura de la app.
 */

import { renderHook } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuthStore, type User } from '@/stores/useAuthStore'
import { useSeenAnswersStore } from '@/stores/useSeenAnswersStore'
import { useResetCacheOnAccountChange } from './useResetCacheOnAccountChange'

const usuario = (id: string): User => ({
  id,
  email: `${id}@ejemplo.test`,
  name: id,
  role: 'pro',
  address: null,
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
    // `hasHydrated` en cierto: la lectura del almacén ya terminó
    useAuthStore.setState({ user: usuario('leti'), hasHydrated: true })
    useSeenAnswersStore.setState({ seen: {} })
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

  /**
   * El arranque de verdad, que es distinto del de arriba: ahí la sesión ya
   * estaba puesta al montar, y aquí se monta **antes** de que termine de
   * leerse del almacén, que es lo que pasa en la app.
   *
   * Lo que se rompía con esto no era la caché —que se recarga sola— sino los
   * avisos ya vistos: al cliente le volvía a salir el modal de "han aceptado
   * tu trabajo" en cada apertura, aunque lo hubiera visto y hubiera entrado al
   * trabajo.
   */
  it('leer la sesión al arrancar no tira la caché', () => {
    useAuthStore.setState({ user: null, hasHydrated: false })

    const { client, rerender } = montar()

    // Termina la lectura de SecureStore y aparece la sesión guardada
    useAuthStore.setState({ user: usuario('leti'), hasHydrated: true })
    rerender({})

    expect(client.getQueryData(['me', 'documents'])).toBeDefined()
  })

  /**
   * Y lo visto **ya no se toca aquí**, ni al cambiar de cuenta.
   *
   * Vaciarlo era lo que hacía que salir y volver a entrar con la misma cuenta
   * devolviera el modal de "te han aceptado el trabajo" por uno ya visto: esa
   * ida y vuelta pasa por `null` y contaba como cambio. Ahora cada cuenta
   * tiene su propio saco (`useSeenAnswersStore`) y no hay nada que vaciar.
   */
  it('no borra lo visto, ni siquiera al cambiar de cuenta', () => {
    useSeenAnswersStore.setState({ seen: { leti: { 'job-1': 'ASSIGNED' } } })

    const { rerender } = montar()

    useAuthStore.setState({ user: usuario('admin') })
    rerender({})

    expect(useSeenAnswersStore.getState().seen).toEqual({
      leti: { 'job-1': 'ASSIGNED' },
    })
  })
})
