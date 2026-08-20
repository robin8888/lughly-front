/**
 * useJob
 * La ficha completa de un trabajo.
 *
 * Sirve a los dos lados: el servidor decide qué enseña según quién pregunte,
 * así que aquí no hay dos hooks ni dos rutas.
 */

import { useQuery } from '@tanstack/react-query'
import { jobsApi, type ApiJobDetail } from '@/api/jobs.api'

export function jobQueryKey(jobId: string) {
  return ['jobs', 'detail', jobId] as const
}

export function useJob(jobId: string | undefined) {
  return useQuery<ApiJobDetail>({
    queryKey: jobQueryKey(jobId ?? ''),
    queryFn: () => jobsApi.detail(jobId as string),
    // Sin id no se pide nada: Expo Router entrega los parámetros de la ruta
    // en el segundo render, y el primero llegaría aquí con `undefined`.
    enabled: Boolean(jobId),
    /**
     * Corto: es la pantalla donde se mira si ya han contestado, y volver a
     * ella para ver lo mismo de hace diez minutos es justo lo que no se
     * espera.
     */
    staleTime: 15_000,
  })
}
