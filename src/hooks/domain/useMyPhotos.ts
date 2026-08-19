/**
 * useMyPhotos
 * Las fotos de trabajo propias: verlas, añadir y quitar.
 *
 * Al contrario que los oficios, aquí **no** se guarda la lista entera: cada
 * foto es una petición suelta. Es lo correcto porque son ficheros, no campos.
 * Subir cinco de golpe y que fallara la cuarta obligaría a repetir las cuatro,
 * y con datos móviles eso es media galería reenviada por nada.
 *
 * A cambio, el orden lo lleva el servidor: al quitar una del medio recoloca
 * las que quedan, así que después de cada cambio se vuelve a pedir la lista en
 * vez de arreglarla aquí a mano y arriesgarse a que no coincidan.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { prosApi, type ApiMyProPhoto } from '@/api/pros.api'
import { uploadApi } from '@/api/upload.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'

/**
 * El tope que hace cumplir el servidor, y va **por oficio**.
 *
 * Con cinco para todo, quien ejerce tres oficios se quedaría con una o dos por
 * listado. La tarjeta del directorio enseña las de un oficio concreto, así que
 * el tope se cuenta igual.
 */
export const MAX_WORK_PHOTOS = 5

export function myPhotosQueryKey() {
  return ['pro', 'photos'] as const
}

export function useMyPhotos(enabled = true) {
  return useQuery<ApiMyProPhoto[]>({
    queryKey: myPhotosQueryKey(),
    queryFn: () => prosApi.myPhotos(),
    enabled,
    staleTime: 60_000,
  })
}

export function useManageMyPhotos() {
  const queryClient = useQueryClient()

  /**
   * Cualquier cambio afecta a lo que ve un cliente: las fotos salen en la
   * tarjeta del directorio y en la ficha. Si no se invalidan las dos, quien
   * acaba de borrar una la seguiría viendo en su propio listado.
   */
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: myPhotosQueryKey() })
    void queryClient.invalidateQueries({ queryKey: ['pro'] })
    void queryClient.invalidateQueries({ queryKey: ['pros'] })
  }

  const add = useMutation({
    mutationFn: async ({ photo, tradeSlug }: { photo: PickedImage; tradeSlug: string }) => {
      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) throw new Error('Vuelve a entrar para subir fotos.')

      return uploadApi.proPhoto(photo, tradeSlug, accessToken)
    },
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: string) => prosApi.removePhoto(id),
    onSuccess: refresh,
  })

  const message = (error: unknown) =>
    error instanceof NetworkError || error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : null

  return {
    /**
     * Devuelven el motivo del fallo con la respuesta y no solo en `formError`:
     * quien las llama está dentro de un `onPress` que ya capturó el estado
     * anterior, así que leería el error de la vez pasada. Es el mismo trato que
     * en el resto de hooks que guardan algo.
     */
    add: async (
      photo: PickedImage,
      tradeSlug: string,
    ): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await add.mutateAsync({ photo, tradeSlug })
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    remove: async (id: string): Promise<{ ok: boolean; error: string | null }> => {
      try {
        await remove.mutateAsync(id)
        return { ok: true, error: null }
      } catch (error) {
        return { ok: false, error: message(error) }
      }
    },
    isWorking: add.isPending || remove.isPending,
    /** El del último intento, sea de subir o de quitar. */
    formError: message(add.error) ?? message(remove.error),
    reset: () => {
      add.reset()
      remove.reset()
    },
  }
}
