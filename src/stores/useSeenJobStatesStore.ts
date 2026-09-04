/**
 * Seen Job States Store
 * En qué estado se vio cada trabajo la última vez que el cliente lo abrió.
 *
 * Es lo que permite marcar **qué ha cambiado**. Sin esto, quien tiene ocho
 * trabajos repartidos en dos pestañas tiene que entrar en las dos y leerlas
 * enteras para descubrir cuál se ha movido: el aviso al móvil llega una vez y
 * la lista, de un vistazo, pinta igual lo de siempre que lo de hace un minuto.
 *
 * Se guarda el **estado**, no un simple "visto", por la misma razón que en
 * [[useSeenAnswersStore]]: el mismo trabajo se acepta, se empieza y se
 * termina, y cada cosa es una noticia distinta.
 *
 * ## Por qué aquí y no en el servidor
 *
 * Porque "lo he mirado" es de este móvil y de este momento, y llevarlo al
 * servidor costaría una columna, una migración y una escritura en cada lectura
 * de la ficha. Lo que se pierde es que un cliente con dos teléfonos ve el
 * punto en los dos y tiene que quitarlo en los dos. Se acepta a sabiendas.
 *
 * ## Por qué por cuenta
 *
 * Lo mismo que en `useSeenAnswersStore`: lo visto es de quien lo vio, y un
 * saco único obligaría a vaciarlo al cambiar de usuario —lo que convierte un
 * "cerrar sesión y volver a entrar" en "todo vuelve a ser nuevo"—.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

/** Id del trabajo → firma del estado con el que se le vio */
type StatesByJob = Record<string, string>

interface SeenJobStatesState {
  /** Id de usuario → lo que ha visto esa cuenta */
  states: Record<string, StatesByJob>
  /** Lo ha abierto: desde ahora, novedad es lo que cambie a partir de aquí */
  markSeen: (userId: string, jobId: string, signature: string) => void
  /**
   * Apuntar trabajos que todavía no estaban en el saco, **sin marcarlos como
   * novedad**.
   *
   * Hace falta para que la primera vez —cuenta nueva, móvil nuevo, app
   * reinstalada— no salga la lista entera con puntos rojos. De un trabajo que
   * no habíamos visto nunca no sabemos qué cambió; lo honesto es tomar este
   * momento como la primera mirada y avisar de lo siguiente.
   *
   * No pisa lo que ya hay: quien tiene una novedad sin ver la conserva aunque
   * la lista se recargue veinte veces.
   */
  learn: (userId: string, states: StatesByJob) => void
}

export const useSeenJobStatesStore = create<SeenJobStatesState>()(
  persist(
    (set) => ({
      states: {},

      markSeen: (userId, jobId, signature) =>
        set((state) => ({
          states: {
            ...state.states,
            [userId]: { ...(state.states[userId] ?? {}), [jobId]: signature },
          },
        })),

      learn: (userId, nuevos) =>
        set((state) => {
          const mios = state.states[userId] ?? {}

          const faltan = Object.entries(nuevos).filter(
            ([jobId]) => mios[jobId] === undefined,
          )

          /*
            Si no falta ninguno se devuelve el estado tal cual, **el mismo
            objeto**: un `set` con un objeto nuevo en cada pasada repintaría la
            lista sin parar, porque quien llama a esto lo hace en un efecto que
            depende de la propia lista.
          */
          if (faltan.length === 0) return state

          return {
            states: {
              ...state.states,
              [userId]: { ...mios, ...Object.fromEntries(faltan) },
            },
          }
        }),
    }),
    {
      name: 'lughly.seen-job-states',
      // No es sensible —solo ids de trabajos propios—: va en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

/**
 * Lo que ha visto esa cuenta. Sin sesión, nada: el saco de otro no se lee.
 */
export const useSeenJobStates = (userId: string | undefined): StatesByJob =>
  useSeenJobStatesStore((s) => (userId ? (s.states[userId] ?? EMPTY) : EMPTY))

export const useMarkJobStateSeen = () => useSeenJobStatesStore((s) => s.markSeen)
export const useLearnJobStates = () => useSeenJobStatesStore((s) => s.learn)

/**
 * Uno y siempre el mismo: devolver `{}` recién hecho en cada llamada haría que
 * el selector diese un objeto distinto cada vez y la pantalla se repintara sin
 * parar.
 */
const EMPTY: StatesByJob = {}
