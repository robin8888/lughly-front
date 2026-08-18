/**
 * useAdminDocuments
 * La cola de revisión de documentos y las dos acciones sobre ella.
 *
 * Al revisar se invalidan también los documentos propios: si el administrador
 * se revisa a sí mismo —que puede pasar, es un usuario más— su pantalla de
 * "Mis documentos" tiene que dejar de decir "pendiente de revisar".
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/admin.api'
import { myDocumentsQueryKey } from './useMyDocuments'

export const pendingDocumentsQueryKey = ['admin', 'documents', 'pending'] as const

export function usePendingDocuments(enabled = true) {
  const query = useQuery({
    queryKey: pendingDocumentsQueryKey,
    queryFn: () => adminApi.pendingDocuments(),
    enabled,
  })

  return {
    documents: query.data?.items ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useReviewDocument() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      documentId,
      approve,
      rejectionReason,
    }: {
      documentId: string
      approve: boolean
      rejectionReason?: string
    }) => adminApi.review(documentId, approve, rejectionReason),

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pendingDocumentsQueryKey })
      void queryClient.invalidateQueries({ queryKey: myDocumentsQueryKey })
    },
  })

  return { review: mutation.mutateAsync, isReviewing: mutation.isPending }
}
