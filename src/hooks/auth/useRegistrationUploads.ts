/**
 * useRegistrationUploads
 * Sube los adjuntos del registro (avatar, identidad, habilitación).
 *
 * Se ejecuta DESPUÉS de crear la cuenta, porque subir exige estar autenticado.
 * Es deliberadamente tolerante a fallos: si una subida falla, la cuenta ya
 * existe y el usuario puede reintentar desde su perfil. Bloquear el alta
 * porque una foto no subió sería peor experiencia y no aporta seguridad.
 */

import { useCallback, useState } from 'react'
import { uploadApi, type IdentityKind } from '@/api'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLoadingStore } from '@/stores/useLoadingStore'
import type { PickedImage } from '@/hooks/media/usePickImage'

export interface RegistrationAttachments {
  avatar: PickedImage | null
  identityFront: PickedImage | null
  identityBack: PickedImage | null
  license: PickedImage | null
  /**
   * Fotos de trabajos hechos, por oficio: hasta cinco de cada uno. Se suben de
   * una en una y en orden, porque el servidor las numera por orden de llegada.
   */
  workPhotos: WorkPhotoGroup[]
  identityKind: IdentityKind
}

/** Las fotos de un oficio concreto. */
export interface WorkPhotoGroup {
  tradeSlug: string
  /** Para el mensaje del velo: "la foto 2 de Fontanería" */
  tradeLabel: string
  photos: PickedImage[]
}

export interface UploadOutcome {
  /** Nombres legibles de lo que no se pudo subir */
  failed: string[]
}

export function useRegistrationUploads() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadAll = useCallback(
    async (attachments: RegistrationAttachments): Promise<UploadOutcome> => {
      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) return { failed: [] }

      setIsUploading(true)
      const failed: string[] = []

      const isPassport = attachments.identityKind === 'PASSPORT'

      const jobs: { label: string; run: () => Promise<unknown> }[] = []

      if (attachments.avatar) {
        jobs.push({
          label: 'la foto de perfil',
          run: () => uploadApi.avatar(attachments.avatar!, accessToken),
        })
      }

      if (attachments.identityFront) {
        jobs.push({
          label: isPassport ? 'el pasaporte' : 'la cara frontal del documento',
          run: () =>
            uploadApi.document(
              attachments.identityFront!,
              isPassport ? 'PASSPORT' : 'IDENTITY_FRONT',
              accessToken,
              attachments.identityKind,
            ),
        })
      }

      if (!isPassport && attachments.identityBack) {
        jobs.push({
          label: 'la cara trasera del documento',
          run: () =>
            uploadApi.document(
              attachments.identityBack!,
              'IDENTITY_BACK',
              accessToken,
              attachments.identityKind,
            ),
        })
      }

      /**
       * Cada foto va como un trabajo aparte: si falla la tercera, las dos
       * primeras se quedan puestas. Perder las cinco por un corte de red a
       * mitad sería peor, y volver a elegirlas cuesta.
       */
      attachments.workPhotos.forEach((group) => {
        group.photos.forEach((photo, index) => {
          jobs.push({
            label: `la foto ${index + 1} de ${group.tradeLabel}`,
            run: () => uploadApi.proPhoto(photo, group.tradeSlug, accessToken),
          })
        })
      })

      if (attachments.license) {
        jobs.push({
          label: 'la habilitación profesional',
          run: () =>
            uploadApi.document(
              attachments.license!,
              'PROFESSIONAL_LICENSE',
              accessToken,
            ),
        })
      }

      const { start, stop, setMessage } = useLoadingStore.getState()

      if (jobs.length === 0) {
        setIsUploading(false)
        return { failed }
      }

      // El velo se abre UNA vez y solo cambia el texto: abrirlo y cerrarlo
      // por cada fichero lo haría parpadear.
      start('Subiendo documentos…')

      try {
        // En serie a propósito: en datos móviles, cuatro subidas a la vez
        // compiten por el ancho de banda y acaban tardando más.
        for (const [index, job] of jobs.entries()) {
          setMessage(`Subiendo ${job.label} (${index + 1} de ${jobs.length})…`)

          try {
            await job.run()
          } catch {
            failed.push(job.label)
          }
        }
      } finally {
        stop()
        setIsUploading(false)
      }

      return { failed }
    },
    [],
  )

  return { uploadAll, isUploading }
}
