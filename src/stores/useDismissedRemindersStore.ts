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
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface DismissedRemindersState {
  dismissed: Record<string, true>
  markDismissed: (id: string) => void
  /** Al cambiar de cuenta: lo de uno no es asunto del siguiente */
  clear: () => void
}

export const useDismissedRemindersStore = create<DismissedRemindersState>()(
  persist(
    (set) => ({
      dismissed: {},

      markDismissed: (id) =>
        set((state) => ({ dismissed: { ...state.dismissed, [id]: true } })),

      clear: () => set({ dismissed: {} }),
    }),
    {
      name: 'lughly.dismissed-reminders',
      // No es sensible —solo ids de trabajos propios—: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export const useDismissedReminders = () =>
  useDismissedRemindersStore((s) => s.dismissed)
export const useMarkReminderDismissed = () =>
  useDismissedRemindersStore((s) => s.markDismissed)
