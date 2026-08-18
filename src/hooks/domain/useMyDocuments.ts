/**
 * useMyDocuments
 * Los documentos de la cuenta, y la puerta que abren.
 *
 * `GET /v1/me/documents` existía desde agosto sin que lo llamara nadie: los
 * documentos se pedían en el alta y ahí se perdía su rastro. Si aquella subida
 * fallaba —y el registro está hecho para no tumbarse si falla—, la cuenta se
 * quedaba sin ellos y sin forma de saberlo.
 *
 * `hasIdentity` repite a propósito la regla del servidor
 * (`common/identity-documents.ts`): pasaporte solo, o DNI/NIE por sus dos
 * caras. Repetirla tiene un coste —hay que cambiarla en dos sitios— y a cambio
 * la app puede avisar ANTES en vez de dejar que el usuario descubra la puerta
 * al pulsar. Manda el servidor: si discrepan, gana su 403.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meApi, type ApiDocument } from '@/api/me.api'
import { uploadApi, type DocumentType, type IdentityKind } from '@/api/upload.api'
import { useAuthStore } from '@/stores/useAuthStore'

export const myDocumentsQueryKey = ['me', 'documents'] as const

/** Los que acreditan identidad; la habilitación profesional es otra cosa. */
export function hasIdentityDocuments(documents: ApiDocument[]): boolean {
  const types = new Set(documents.map((document) => document.type))

  return (
    types.has('PASSPORT') ||
    (types.has('IDENTITY_FRONT') && types.has('IDENTITY_BACK'))
  )
}

export function useMyDocuments() {
  const query = useQuery({
    queryKey: myDocumentsQueryKey,
    queryFn: () => meApi.documents(),
  })

  const documents = query.data?.items ?? []

  return {
    documents,
    hasIdentity: hasIdentityDocuments(documents),
    /**
     * Mientras carga no se sabe, y no es lo mismo que "no tiene". Quien avise
     * tiene que distinguirlo o enseñará "te faltan documentos" durante medio
     * segundo a alguien que los tiene todos.
     */
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
  }
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: ({
      file,
      type,
      identityKind,
    }: {
      file: Parameters<typeof uploadApi.document>[0]
      type: DocumentType
      identityKind?: IdentityKind
    }) => {
      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) throw new Error('Sin sesión')

      return uploadApi.document(file, type, accessToken, identityKind)
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: myDocumentsQueryKey })
    },
  })

  return { upload: mutation.mutateAsync, isUploading: mutation.isPending }
}
