/**
 * usePublishJob
 * Publica el trabajo (hoy, solo urgencias: `UrgencyPage`) y sube sus fotos.
 *
 * Son dos pasos contra el servidor porque no hay otra: las fotos se asocian
 * al trabajo por su id, y hasta que no se crea no hay id al que asociarlas.
 *
 * De ahí la decisión importante de este hook: **si una foto falla, el
 * trabajo sigue publicado**. Deshacer la publicación por una imagen sería
 * peor —el usuario ya ha escrito todo y quiere que se vea—, así que se
 * publica, se informa de cuántas no subieron y se le deja seguir. Añadirlas
 * después es un toque; volver a escribirlo todo, no.
 */

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError, NetworkError, uploadApi } from '@/api'
import { jobsApi, type ApiJob, type CreateJobPayload } from '@/api/jobs.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'
import { useIdentityGate } from './useIdentityGate'

export function myJobsQueryKey() {
  return ['jobs', 'mine'] as const
}

export interface PublishOutcome {
  job: ApiJob
  /** Cuántas fotos no llegaron. El trabajo está publicado igualmente. */
  photosFailed: number
}

export interface PublishJobResult {
  publish: (
    payload: CreateJobPayload,
    photos: PickedImage[],
  ) => Promise<PublishOutcome | null>
  isPublishing: boolean
  /** Cierto mientras suben las fotos, ya con el trabajo creado */
  isUploadingPhotos: boolean
  fieldErrors: Partial<Record<keyof CreateJobPayload, string>>
  formError: string | null
  reset: () => void
}

export function usePublishJob(): PublishJobResult {
  const queryClient = useQueryClient()
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false)

  const identityGate = useIdentityGate()

  const mutation = useMutation({
    mutationFn: (payload: CreateJobPayload) => jobsApi.create(payload),

    /*
     * Falta el documento: no es un fallo, es una puerta con salida. El aviso
     * lo pone el gate, con el botón que lleva a subirlo.
     */
    onError: (error) => {
      identityGate(error)
    },
  })

  const error = mutation.error

  const publish = async (
    payload: CreateJobPayload,
    photos: PickedImage[],
  ): Promise<PublishOutcome | null> => {
    let job: ApiJob

    try {
      job = await mutation.mutateAsync(payload)
    } catch {
      // El error queda en `mutation.error`; quien llama mira `formError`.
      return null
    }

    // A partir de aquí el trabajo EXISTE. Nada de lo que siga puede
    // devolver null: sería mentirle al usuario sobre lo que ha pasado.
    let photosFailed = 0

    if (photos.length > 0) {
      setIsUploadingPhotos(true)

      const accessToken = useAuthStore.getState().accessToken

      if (accessToken) {
        /**
         * En serie y no en paralelo: el servidor numera las fotos por orden
         * de llegada, y lanzándolas a la vez el orden que ve el profesional
         * no sería el que eligió el cliente.
         */
        for (const photo of photos) {
          try {
            await uploadApi.jobPhoto(job.id, photo, accessToken)
          } catch {
            photosFailed += 1
          }
        }
      } else {
        photosFailed = photos.length
      }

      setIsUploadingPhotos(false)
    }

    void queryClient.invalidateQueries({ queryKey: myJobsQueryKey() })

    return { job, photosFailed }
  }

  return {
    publish,
    isPublishing: mutation.isPending,
    isUploadingPhotos,
    fieldErrors:
      error instanceof ApiError ? error.toFieldErrors<CreateJobPayload>() : {},
    formError:
      error instanceof NetworkError
        ? error.message
        : error instanceof ApiError && error.details.length === 0
          ? error.message
          : null,
    reset: () => mutation.reset(),
  }
}
