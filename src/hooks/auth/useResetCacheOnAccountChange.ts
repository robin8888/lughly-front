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
 */

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/stores/useAuthStore'
import { useSeenAnswersStore } from '@/stores/useSeenAnswersStore'

export function useResetCacheOnAccountChange(): void {
  const queryClient = useQueryClient()
  const userId = useUser()?.id ?? null

  /**
   * `undefined` en el primer render, para distinguirlo de "no hay sesión". Sin
   * esa distinción, arrancar sin sesión contaría como un cambio.
   */
  const previous = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const isFirstRender = previous.current === undefined

    if (!isFirstRender && previous.current !== userId) {
      /*
       * `clear` y no `invalidateQueries`: invalidar deja los datos viejos a la
       * vista mientras se recargan, y esos datos son de otra cuenta. Aquí hay
       * que tirarlos, aunque eso signifique un momento de "cargando".
       */
      queryClient.clear()

      /*
        Y lo que se ha enseñado ya. Son ids de trabajos de otra cuenta: al
        siguiente no le sirven de nada, y en el peor caso le taparían un aviso
        suyo si dos ids coincidieran.
      */
      useSeenAnswersStore.getState().clear()
    }

    previous.current = userId
  }, [queryClient, userId])
}
