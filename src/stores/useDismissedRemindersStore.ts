/**
 * Dismissed Reminders Store
 * Qué avisos del profesional ha cerrado ya con "Ahora no".
 *
 * `askedAboutInbox`/`askedAboutUrgency`/`askedToConfirm`, en `HomePagePro`,
 * vivían solo en memoria: bastaba cerrar la app y volver a abrirla para que
 * los tres diálogos —urgencias, encargos sin responder, asignación
 * pendiente— salieran otra vez, aunque nada hubiera cambiado desde que se
 * cerraron. Mismo fallo que ya se corrigió del lado del cliente con
 * `useSeenAnswersStore`, y misma solución: recordarlo en el dispositivo.
 *
 * Por id suelto y no por lote —"ya avisé de estos 3 encargos"—: si aparece
 * uno nuevo entre los pendientes, ese sí tiene que avisar, y comparar solo el
 * recuento no distingue "llegó uno nuevo" de "se resolvió uno de los viejos".
 *
 * Y **por cuenta**, por lo mismo que el del cliente: estuvo en un solo saco
 * que había que vaciar al cambiar de usuario, y eso hacía que salir y volver a
 * entrar con la misma cuenta contase como cambio y devolviera los tres
 * diálogos ya cerrados. Con un saco por cuenta no hay nada que vaciar.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type DismissedIds = Record<string, true>

interface DismissedRemindersState {
  /** Id de usuario → avisos que esa cuenta ya cerró */
  dismissed: Record<string, DismissedIds>
  markDismissed: (userId: string, id: string) => void
}

export const useDismissedRemindersStore = create<DismissedRemindersState>()(
  persist(
    (set) => ({
      dismissed: {},

      markDismissed: (userId, id) =>
        set((state) => ({
          dismissed: {
            ...state.dismissed,
            [userId]: { ...(state.dismissed[userId] ?? {}), [id]: true },
          },
        })),
    }),
    {
      name: 'lughly.dismissed-reminders',
      // No es sensible —solo ids de trabajos propios—: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      /** La versión 0 no tenía cuenta; se tira, igual que en el del cliente */
      version: 1,
      migrate: () => ({ dismissed: {} }),
    },
  ),
)

/** Lo que ya cerró esa cuenta. Sin sesión, nada. */
export const useDismissedReminders = (userId: string | undefined): DismissedIds =>
  useDismissedRemindersStore((s) => (userId ? (s.dismissed[userId] ?? EMPTY) : EMPTY))

export const useMarkReminderDismissed = () =>
  useDismissedRemindersStore((s) => s.markDismissed)

/** Uno y siempre el mismo, para no repintar en cada llamada */
const EMPTY: DismissedIds = {}
