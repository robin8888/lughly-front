/**
 * usePlaceBid
 * Enviar o corregir una puja.
 *
 * Al confirmar se invalida la lista: la propia puja cambia el recuento y
 * puede cambiar la más baja, así que dejar el listado como estaba enseñaría
 * datos que uno mismo acaba de dejar viejos.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { bidsApi, type ApiBid, type PlaceBidPayload } from '@/api/bids.api'
import { useIdentityGate } from './useIdentityGate'

export function usePlaceBid() {
  const queryClient = useQueryClient()

  const identityGate = useIdentityGate()

  const mutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: PlaceBidPayload }) =>
      bidsApi.place(jobId, payload),

    /*
     * Falta el documento: no es un fallo, es una puerta con salida. El aviso
     * lo pone el gate, con el botón que lleva a subirlo.
     */
    onError: (error) => {
      identityGate(error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'open'] })
    },
  })

  const error = mutation.error

  return {
    place: async (jobId: string, payload: PlaceBidPayload): Promise<ApiBid | null> => {
      try {
        return await mutation.mutateAsync({ jobId, payload })
      } catch {
        return null
      }
    },
    isPlacing: mutation.isPending,
    fieldErrors:
      error instanceof ApiError ? error.toFieldErrors<PlaceBidPayload>() : {},
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
