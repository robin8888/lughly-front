/**
 * Loading Store
 * Control del velo de carga global desde cualquier punto de la app.
 *
 * Lleva un contador, no un booleano: si dos operaciones lentas se solapan,
 * la primera en terminar no debe destapar la pantalla mientras la otra sigue.
 * El velo se retira cuando acaban todas.
 *
 * No se persiste: describe lo que ocurre ahora mismo.
 */

import { create } from 'zustand'

interface LoadingState {
  /** Operaciones en curso */
  pending: number
  message: string | null

  start: (message?: string) => void
  stop: () => void
  /** Cambia el texto sin abrir ni cerrar el velo (evita parpadeos) */
  setMessage: (message: string | null) => void
  /** Corta en seco: para cuando se cierra sesión o hay que forzar limpieza */
  reset: () => void
}

export const useLoadingStore = create<LoadingState>()((set) => ({
  pending: 0,
  message: null,

  start: (message) =>
    set((state) => ({
      pending: state.pending + 1,
      message: message ?? state.message,
    })),

  stop: () =>
    set((state) => {
      const pending = Math.max(0, state.pending - 1)
      return { pending, message: pending === 0 ? null : state.message }
    }),

  setMessage: (message) => set({ message }),

  reset: () => set({ pending: 0, message: null }),
}))

export const useIsLoading = () => useLoadingStore((s) => s.pending > 0)
export const useLoadingMessage = () => useLoadingStore((s) => s.message)

/**
 * Envuelve una promesa mostrando el velo mientras dure.
 * Se retira pase lo que pase, también si la operación falla.
 */
export async function withLoading<T>(
  promise: Promise<T>,
  message?: string,
): Promise<T> {
  useLoadingStore.getState().start(message)

  try {
    return await promise
  } finally {
    useLoadingStore.getState().stop()
  }
}
