/**
 * useProfileChecklist
 * Qué le falta al profesional por poner en su perfil.
 *
 * Se usa en Mi cuenta para señalar lo que falta al lado de cada acceso. Solo lo
 * que falta: un perfil completo no tiene por qué enseñar nada, porque la
 * información está en la excepción y no en la norma.
 */

import { useQuery } from '@tanstack/react-query'
import { prosApi, type ApiProfileChecklist } from '@/api/pros.api'

export const profileChecklistQueryKey = ['pro', 'checklist'] as const

export function useProfileChecklist(enabled = true) {
  return useQuery<ApiProfileChecklist>({
    queryKey: profileChecklistQueryKey,
    queryFn: () => prosApi.myChecklist(),
    enabled,
    /*
     * Corto a propósito: se vuelve a Mi cuenta justo después de arreglar lo que
     * faltaba, y encontrarse el mismo aviso haría dudar de si se guardó.
     */
    staleTime: 10_000,
  })
}
