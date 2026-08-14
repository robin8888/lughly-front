/**
 * useProReviews
 * Valoraciones de un profesional, paginadas.
 *
 * Se usa `useInfiniteQuery` en vez de `useQuery`: la ficha muestra las
 * primeras y va añadiendo con "Ver más valoraciones". Con `useQuery` habría
 * que acumular las páginas a mano en un estado propio, que es exactamente el
 * trabajo que este hook ya hace.
 */

import { useInfiniteQuery } from '@tanstack/react-query'
import { prosApi, type ProReviewsPage } from '@/api/pros.api'

/** Cuántas se piden por página. Suficiente para llenar la pantalla una vez. */
export const REVIEWS_PAGE_SIZE = 5

export function proReviewsQueryKey(id: string) {
  return ['pro', id, 'reviews'] as const
}

export function useProReviews(id: string | undefined) {
  return useInfiniteQuery<ProReviewsPage>({
    queryKey: proReviewsQueryKey(id ?? ''),
    queryFn: ({ pageParam }) =>
      prosApi.reviews(id as string, {
        limit: REVIEWS_PAGE_SIZE,
        offset: pageParam as number,
      }),
    enabled: Boolean(id),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((count, page) => count + page.items.length, 0)
      return loaded < lastPage.total ? loaded : undefined
    },
    staleTime: 30_000,
  })
}
