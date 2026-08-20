/**
 * useRequestPro
 * El cliente encarga un trabajo a un profesional concreto del directorio.
 *
 * Al enviarlo se invalida la lista de trabajos: el encargo aparece ahí como
 * uno más, esperando respuesta, y es donde el cliente va a mirar si le han
 * contestado.
 *
 * **Con fotos, como al publicar** (20 Agosto 2026). Antes no las admitía, y
 * eso dejaba al encargo directo peor que la subasta justo en lo que más
 * decide: en oficios se valora mirando, y el profesional que recibe un encargo
 * sin fotos tiene que preguntar por chat lo que se ve en un vistazo.
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError } from '@/api'
import { uploadApi } from '@/api/upload.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  assignmentsApi,
  type ApiDirectRequest,
  type RequestProPayload,
} from '@/api/assignments.api'
import type { FieldErrors } from '@/utils/formErrors'
import { useIdentityGate } from './useIdentityGate'

export interface RequestOutcome {
  request: ApiDirectRequest
  /** Cuántas fotos no llegaron. El encargo se hace igual */
  photosFailed: number
}

export function useRequestPro(proId: string | undefined) {
  const queryClient = useQueryClient()
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)

  const identityGate = useIdentityGate()

  const mutation = useMutation({
    mutationFn: (payload: RequestProPayload) =>
      assignmentsApi.request(proId as string, payload),

    /*
     * Falta el documento: no es un fallo, es una puerta con salida. El aviso
     * lo pone el gate, con el botón que lleva a subirlo.
     */
    onError: (error) => {
      identityGate(error)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })

  const error = mutation.error

  return {
    request: async (
      payload: RequestProPayload,
      photos: PickedImage[] = [],
    ): Promise<RequestOutcome | null> => {
      let request: ApiDirectRequest

      try {
        request = await mutation.mutateAsync(payload)
      } catch {
        return null
      }

      // A partir de aquí el encargo EXISTE: nada de lo que siga puede
      // devolver null, sería mentirle al cliente sobre lo que ha pasado.
      let photosFailed = 0

      if (photos.length > 0) {
        setIsUploadingPhotos(true)
        const accessToken = useAuthStore.getState().accessToken

        if (accessToken) {
          /*
            En serie: el servidor las numera por orden de llegada, y en
            paralelo el orden que ve el profesional no sería el que eligió el
            cliente.
          */
          for (const photo of photos) {
            try {
              await uploadApi.jobPhoto(request.id, photo, accessToken)
            } catch {
              photosFailed += 1
            }
          }
        } else {
          photosFailed = photos.length
        }

        setIsUploadingPhotos(false)
      }

      return { request, photosFailed }
    },
    isRequesting: mutation.isPending || isUploadingPhotos,
    fieldErrors:
      error instanceof ApiError
        ? error.toFieldErrors<RequestProPayload>()
        : ({} as FieldErrors<RequestProPayload>),
    /**
     * El mensaje suelto: un oficio que no ejerce o un profesional que ya no
     * está no son errores de un campo del formulario, son motivos por los
     * que este encargo concreto no puede salir.
     */
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
