/**
 * Seen Answers Store
 * Qué respuestas de un profesional ya ha visto el cliente.
 *
 * El aviso al móvil llega en el momento, pero llega una vez: si el teléfono
 * estaba silenciado, boca abajo o sin batería, nadie se entera de que alguien
 * ha aceptado su urgencia. Por eso al abrir la app se lo decimos otra vez con
 * un modal —igual que al profesional se le dice lo que tiene sin responder.
 *
 * Y por eso hace falta recordar qué se ha enseñado ya. Sin esto, el mismo
 * "van de camino" saldría cada vez que abre la app hasta que el trabajo se
 * cierre, y un aviso que se repite deja de leerse a la tercera.
 *
 * Se guarda el **estado** con el que se vio, no un simple "visto": el mismo
 * trabajo puede ser rechazado, reasignado y aceptado, y cada respuesta es una
 * noticia distinta que merece su aviso.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface SeenAnswersState {
  /** Id del trabajo → estado con el que se le enseñó la última vez */
  seen: Record<string, string>
  /**
   * Devuelve la promesa de la escritura en AsyncStorage (así lo entrega el
   * `persist` de zustand). Quien navega justo después de marcar visto debe
   * esperarla: si la app se cierra antes de que la escritura llegue a disco,
   * el aviso vuelve a salir en la siguiente apertura.
   */
  markSeen: (jobId: string, status: string) => Promise<void>
  /** Al cambiar de cuenta: lo de uno no es asunto del siguiente */
  clear: () => void
}

export const useSeenAnswersStore = create<SeenAnswersState>()(
  persist(
    (set) => ({
      seen: {},

      markSeen: (jobId, status) =>
        // El tipo público de `set` no lo expone, pero `persist` lo envuelve
        // en runtime para devolver la promesa de `storage.setItem(...)`.
        set((state) => ({
          seen: { ...state.seen, [jobId]: status },
        })) as unknown as Promise<void>,

      clear: () => set({ seen: {} }),
    }),
    {
      name: 'lughly.seen-answers',
      // No es sensible —solo ids de trabajos propios—: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export const useSeenAnswers = () => useSeenAnswersStore((s) => s.seen)
export const useMarkAnswerSeen = () => useSeenAnswersStore((s) => s.markSeen)
