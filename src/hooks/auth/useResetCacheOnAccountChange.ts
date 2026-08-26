/**
 * useResetCacheOnAccountChange
 * Vacía la caché de consultas cuando cambia la cuenta.
 *
 * ## El fallo que arregla
 *
 * El `QueryClient` se crea una sola vez y vive lo que vive la app, así que
 * sobrevive a cerrar sesión. Y las claves de consulta no llevan el id del
 * usuario: son `['me','documents']`, `['pro','inbox']`, `['pro', id]`… Con las
 * dos cosas juntas, la respuesta de una cuenta se le sirve a la siguiente
 * mientras siga fresca, que por defecto son cinco minutos.
 *
 * Se vio así: alguien subió sus documentos, se salió, entró con la cuenta de
 * administrador —que no tiene ninguno—, aprobó los suyos, volvió a entrar con
 * la primera y su pantalla seguía diciendo "te falta el documento". El servidor
 * respondía bien; lo que se enseñaba era la respuesta cacheada del
 * administrador.
 *
 * No era un aviso mal puesto: eran datos de una cuenta enseñados en otra. Y no
 * afecta solo a los documentos, sino a todo lo cacheado —encargos, perfil,
 * trabajadores—.
 *
 * ## Por qué aquí y no al cerrar sesión
 *
 * Porque cerrar sesión no es el único camino. `clearAuth()` se llama también al
 * terminar el registro, y una sesión puede caducar sin pasar por el botón de
 * salir. Mirando el id del usuario se cubren todos: si cambia respecto a lo
 * último que se vio, lo cacheado es de otro.
 *
 * Añadir el id a cada clave sería la otra solución, y es peor: hay que acordarse
 * en cada consulta nueva, y olvidarlo no falla de forma visible.
 *
 * ## Hay que esperar a que la sesión se haya leído
 *
 * Y es lo que faltaba, con una consecuencia que no parecía de aquí. La sesión
 * vive en SecureStore y **se lee de forma asíncrona**: durante los primeros
 * renders de cada arranque no hay usuario porque todavía no se sabe, no porque
 * no lo haya. Sin esperar, la secuencia de cada arranque era `null` → `u1`, o
 * sea un cambio de cuenta, y esto vaciaba la caché y **borraba lo que el
 * usuario ya había visto**.
 *
 * Lo que se veía: al cliente le salía otra vez el modal de "un profesional ha
 * aceptado tu trabajo" cada vez que abría la app, aunque ya lo hubiera visto y
 * hubiera entrado al trabajo. El aviso estaba bien guardado; lo que pasaba es
 * que esto lo borraba en el arranque siguiente.
 *
 * `hasHydrated` es la bandera que dice que la lectura terminó —haya sesión o
 * no—, así que hasta entonces aquí no se compara nada.
 *
 * ## Lo que este hook ya no hace
 *
 * Vaciar los avisos ya vistos (`useSeenAnswersStore`) y los diálogos ya
 * cerrados (`useDismissedRemindersStore`). Lo hacía para que lo de una cuenta
 * no se le enseñara a la siguiente, y traía un fallo que se veía desde fuera:
 * **salir y volver a entrar con la misma cuenta contaba como cambio**, se
 * vaciaba todo, y al cliente le volvía a salir el modal de "te han aceptado el
 * trabajo" por uno que ya había visto.
 *
 * Ahora esos dos guardan un saco por cuenta y no hace falta vaciar ninguno:
 * cada quien lee el suyo. Aquí queda solo la caché de consultas, que sí se
 * tira siempre que cambie el id —incluso al cerrar sesión— porque es una caché
 * y recargarla no cuesta nada.
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useHasHydrated, useUser } from '@/stores/useAuthStore'

export function useResetCacheOnAccountChange(): void {
  const queryClient = useQueryClient()
  const hasHydrated = useHasHydrated()
  const userId = useUser()?.id ?? null

  /**
   * `undefined` en el primer render, para distinguirlo de "no hay sesión". Sin
   * esa distinción, arrancar sin sesión contaría como un cambio.
   */
  const previous = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    /*
      Mientras no se haya leído el almacén, `userId` es null porque no se sabe.
      Comparar aquí convertiría cada arranque en un cambio de cuenta.
    */
    if (!hasHydrated) return

    const isFirstRender = previous.current === undefined

    if (!isFirstRender && previous.current !== userId) {
      /*
       * `clear` y no `invalidateQueries`: invalidar deja los datos viejos a la
       * vista mientras se recargan, y esos datos son de otra cuenta. Aquí hay
       * que tirarlos, aunque eso signifique un momento de "cargando".
       */
      queryClient.clear()
    }

    previous.current = userId
  }, [queryClient, userId, hasHydrated])
}
