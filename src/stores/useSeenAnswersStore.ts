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
 *
 * ## Por qué va por cuenta
 *
 * Porque lo visto es de quien lo vio. Estuvo en un solo saco, y para que lo de
 * una cuenta no se le enseñara a la siguiente había que **vaciarlo** al
 * cambiar de usuario. Eso traía el fallo que se ve desde fuera: cerrar sesión
 * y volver a entrar con la misma cuenta contaba como cambio, se vaciaba el
 * saco, y el modal de "te han aceptado el trabajo" volvía a salir por un
 * trabajo ya visto.
 *
 * Con un saco por cuenta no hay nada que vaciar: cada quien lee el suyo y el
 * del otro sigue donde estaba, intacto para cuando vuelva.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

/** Id del trabajo → estado con el que se le enseñó la última vez */
type SeenByJob = Record<string, string>

interface SeenAnswersState {
  /** Id de usuario → lo que ha visto esa cuenta */
  seen: Record<string, SeenByJob>
  /**
   * Devuelve la promesa de la escritura en AsyncStorage (así lo entrega el
   * `persist` de zustand). Quien navega justo después de marcar visto debe
   * esperarla: si la app se cierra antes de que la escritura llegue a disco,
   * el aviso vuelve a salir en la siguiente apertura.
   */
  markSeen: (userId: string, jobId: string, status: string) => Promise<void>
}

export const useSeenAnswersStore = create<SeenAnswersState>()(
  persist(
    (set) => ({
      seen: {},

      markSeen: (userId, jobId, status) =>
        // El tipo público de `set` no lo expone, pero `persist` lo envuelve
        // en runtime para devolver la promesa de `storage.setItem(...)`.
        set((state) => ({
          seen: {
            ...state.seen,
            [userId]: { ...(state.seen[userId] ?? {}), [jobId]: status },
          },
        })) as unknown as Promise<void>,
    }),
    {
      name: 'lughly.seen-answers',
      // No es sensible —solo ids de trabajos propios—: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      /**
       * La versión 0 guardaba un solo saco, sin cuenta. **Se tira**, y no se
       * puede hacer otra cosa: esos ids no dicen de quién eran, y adjudicarlos
       * a quien entre primero sería taparle un aviso suyo.
       *
       * Cuesta un modal repetido, una vez, a quien tuviera alguno pendiente.
       */
      version: 1,
      migrate: () => ({ seen: {} }),
    },
  ),
)

/**
 * Lo que ha visto esa cuenta. Sin sesión, nada: mejor enseñar un aviso de más
 * que leer el saco de otro.
 */
export const useSeenAnswers = (userId: string | undefined): SeenByJob =>
  useSeenAnswersStore((s) => (userId ? (s.seen[userId] ?? EMPTY) : EMPTY))

export const useMarkAnswerSeen = () => useSeenAnswersStore((s) => s.markSeen)

/**
 * Uno y siempre el mismo. Devolver `{}` recién hecho en cada llamada haría que
 * el selector diese un objeto distinto cada vez y la pantalla se repintara sin
 * parar.
 */
const EMPTY: SeenByJob = {}
