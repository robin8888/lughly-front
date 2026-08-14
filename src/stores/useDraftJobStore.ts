/**
 * Draft Job Store
 * El borrador de "publicar un trabajo", que sobrevive a cerrar la app.
 *
 * Motivo: describir una avería con detalle lleva su rato, y se hace de pie
 * en la cocina mirando la fuga. Una llamada entrante o un cambio de app no
 * pueden borrar cinco minutos de escritura.
 *
 * Vive en el dispositivo y **no** en el servidor. El modelo `Job` tiene un
 * estado `DRAFT`, pero guardar cada tecleo como una fila sería mucho tráfico
 * y muchas filas basura para algo que casi siempre acaba publicándose o
 * descartándose en la misma sesión.
 *
 * Las fotos **no se persisten**: son URIs de ficheros temporales del sistema,
 * que iOS borra cuando quiere. Guardar la ruta serviría para que al volver
 * apareciesen huecos rotos, que es peor que no guardarlas. Se avisa al
 * usuario en la pantalla.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type JobDraftType = 'AUCTION' | 'INSTANT'

export interface JobDraft {
  type: JobDraftType
  tradeSlug: string
  title: string
  description: string
  city: string
  /** En euros, como texto: es lo que hay en el input hasta validarlo */
  maxBudget: string
  /** ISO corto (YYYY-MM-DD) o cadena vacía */
  preferredDate: string
  biddingEndsAt: string
}

export const EMPTY_DRAFT: JobDraft = {
  type: 'AUCTION',
  tradeSlug: '',
  title: '',
  description: '',
  city: '',
  maxBudget: '',
  preferredDate: '',
  biddingEndsAt: '',
}

interface DraftJobState {
  draft: JobDraft
  /** Cuándo se tocó por última vez, en ISO. Null si está limpio. */
  updatedAt: string | null
  update: (patch: Partial<JobDraft>) => void
  clear: () => void
  /** ¿Hay algo escrito que merezca ofrecer recuperarlo? */
  hasContent: () => boolean
}

/** Campos cuya presencia indica trabajo real del usuario, no valores por defecto. */
const CONTENT_FIELDS: (keyof JobDraft)[] = [
  'tradeSlug',
  'title',
  'description',
  'city',
  'maxBudget',
]

export const useDraftJobStore = create<DraftJobState>()(
  persist(
    (set, get) => ({
      draft: EMPTY_DRAFT,
      updatedAt: null,

      update: (patch) =>
        set((state) => ({
          draft: { ...state.draft, ...patch },
          updatedAt: new Date().toISOString(),
        })),

      clear: () => set({ draft: EMPTY_DRAFT, updatedAt: null }),

      hasContent: () => {
        const { draft } = get()
        // `type` no cuenta: viene con valor por defecto y estaría siempre
        // relleno, así que ofrecería recuperar un borrador vacío.
        return CONTENT_FIELDS.some((field) => draft[field].trim() !== '')
      },
    }),
    {
      name: 'lughly.draftJob',
      // No es sensible: descripción de una avería, ciudad y presupuesto.
      // La dirección exacta no entra aquí.
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ draft: state.draft, updatedAt: state.updatedAt }),
    },
  ),
)

export const useJobDraft = () => useDraftJobStore((s) => s.draft)
