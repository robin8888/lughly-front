/**
 * usePros
 * Listado de profesionales del directorio.
 *
 * Usa TanStack Query: nos da cargando, error y caché sin escribirlos a mano,
 * y al volver a un oficio ya visitado la lista aparece al instante mientras
 * se refresca por detrás.
 */

import { useQuery } from '@tanstack/react-query'
import { prosApi, type ProsFilters, type ProsPage } from '@/api/pros.api'

/** Clave de caché: dos filtros distintos son dos listas distintas. */
export function prosQueryKey(filters: ProsFilters) {
  return ['pros', filters] as const
}

export interface UseProsOptions {
  /**
   * A falso no se pregunta nada. Lo usa la home del cliente, que solo tiene
   * oficio que consultar después de una búsqueda; sin esto pediría el
   * directorio entero nada más abrir la app.
   */
  enabled?: boolean
}

export function usePros(filters: ProsFilters = {}, { enabled = true }: UseProsOptions = {}) {
  return useQuery<ProsPage>({
    queryKey: prosQueryKey(filters),
    queryFn: () => prosApi.list(filters),
    // El directorio cambia poco en una sesión: medio minuto de margen evita
    // repetir la misma petición al ir y volver entre pantallas.
    staleTime: 30_000,
    enabled,
  })
}
