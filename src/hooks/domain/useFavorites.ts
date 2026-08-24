/**
 * useFavorites
 * Los profesionales que el cliente ha marcado como favoritos
 * (COMO_SE_CONTRATA.md §11): encontrarlos la próxima vez sin rebuscar en el
 * directorio.
 *
 * Misma forma que el listado del directorio (`usePros`): la lista de
 * favoritos se pinta con la misma `ProDirectoryCard`, sin un componente ni
 * un tipo aparte.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import { meApi } from '@/api/me.api'
import type { ApiPro, ProsPage } from '@/api/pros.api'

export const FAVORITES_QUERY_KEY = ['favorites'] as const

export function useFavorites() {
  return useQuery<ProsPage>({
    queryKey: FAVORITES_QUERY_KEY,
    queryFn: () => meApi.favorites(),
  })
}

/**
 * Solo los ids, para pintar el corazón lleno en el directorio y en la ficha
 * sin pedir la lista entera en cada tarjeta: todas comparten esta misma
 * consulta cacheada.
 */
export function useFavoriteIds(): Set<string> {
  const { data } = useFavorites()
  return new Set((data?.items ?? []).map((pro) => pro.id))
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({ pro, isFavorite }: { pro: ApiPro; isFavorite: boolean }) =>
      isFavorite ? meApi.removeFavorite(pro.id) : meApi.addFavorite(pro.id),

    /*
     * Optimista: un corazón que tarda en llenarse se toca varias veces. Se
     * pinta el cambio al instante y, si el servidor lo rechaza, vuelve a su
     * sitio.
     */
    onMutate: async ({ pro, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_QUERY_KEY })
      const previous = queryClient.getQueryData<ProsPage>(FAVORITES_QUERY_KEY)

      queryClient.setQueryData<ProsPage>(FAVORITES_QUERY_KEY, (current) => {
        if (!current) return current

        return isFavorite
          ? {
              items: current.items.filter((item) => item.id !== pro.id),
              total: current.total - 1,
            }
          : { items: [pro, ...current.items], total: current.total + 1 }
      })

      return { previous }
    },

    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITES_QUERY_KEY, context.previous)
      }
      Alert.alert('No se ha podido cambiar', 'Inténtalo de nuevo en un momento.')
    },

    /**
     * El servidor no promete el mismo orden que el optimista —la lista de
     * favoritos ordena igual que el directorio, no por cuándo se marcó—, así
     * que se refresca de verdad al terminar en vez de quedarse con el hueco
     * optimista para siempre.
     */
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY })
    },
  })

  return {
    toggle: (pro: ApiPro, isFavorite: boolean) => mutation.mutate({ pro, isFavorite }),
    isSaving: mutation.isPending,
  }
}
