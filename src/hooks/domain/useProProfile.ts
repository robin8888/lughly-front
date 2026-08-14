/**
 * useProProfile
 * Ficha de un profesional del directorio.
 *
 * Igual que `usePros`, con dos diferencias:
 * - `enabled`: sin id no se pide nada. Expo Router entrega los parámetros de
 *   ruta en el primer render, pero si alguna vez llega vacío no queremos una
 *   petición a `/v1/pros/undefined`.
 * - No se reintenta un 404. El perfil no existe o su cuenta no está activa;
 *   insistir tres veces solo retrasa el mensaje al usuario.
 */

import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/api'
import { prosApi, type ApiProDetail } from '@/api/pros.api'

export function proProfileQueryKey(id: string) {
  return ['pro', id] as const
}

export function useProProfile(id: string | undefined) {
  return useQuery<ApiProDetail>({
    queryKey: proProfileQueryKey(id ?? ''),
    queryFn: () => prosApi.get(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })
}
