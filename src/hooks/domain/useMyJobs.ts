/**
 * useMyJobs
 * Los trabajos publicados por el cliente en sesión.
 *
 * `staleTime` corto, cinco segundos: se vuelve a esta pantalla justo después
 * de publicar, y ahí lo que importa es ver el trabajo recién creado, no
 * ahorrar una petición. La invalidación de `usePublishJob` ya lo fuerza,
 * pero esto cubre el caso de volver por la pestaña.
 */

import { useQuery } from '@tanstack/react-query'
import { jobsApi, type MyJobsPage } from '@/api/jobs.api'
import { myJobsQueryKey } from './usePublishJob'

export function useMyJobs(enabled = true) {
  return useQuery<MyJobsPage>({
    queryKey: myJobsQueryKey(),
    queryFn: () => jobsApi.mine(),
    /* Es del cliente: en modo profesional el servidor no tiene qué contestar */
    enabled,
    staleTime: 5_000,
  })
}
