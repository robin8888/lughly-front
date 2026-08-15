/**
 * useOpenJobs
 * Subastas abiertas a las que este profesional puede pujar.
 *
 * `staleTime` corto: en una subasta la puja más baja cambia sola mientras
 * miras, y ver un número viejo te hace pujar mal.
 */

import { useQuery } from '@tanstack/react-query'
import { bidsApi, type OpenJobsFilters, type OpenJobsPage } from '@/api/bids.api'

export function openJobsQueryKey(filters: OpenJobsFilters) {
  return ['jobs', 'open', filters] as const
}

export function useOpenJobs(filters: OpenJobsFilters = {}, enabled = true) {
  return useQuery<OpenJobsPage>({
    queryKey: openJobsQueryKey(filters),
    queryFn: () => bidsApi.open(filters),
    enabled,
    staleTime: 10_000,
  })
}
