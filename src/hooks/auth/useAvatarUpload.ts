/**
 * useAvatarUpload
 * Elegir y subir la foto de perfil desde Mi cuenta.
 *
 * Reutiliza `usePickImage`, así que la foto se comprime y se le quitan los
 * metadatos EXIF —incluidas las coordenadas GPS— antes de salir del móvil.
 *
 * Al terminar actualiza el usuario del store: la clave del fichero cambia en
 * cada subida, así que la nueva URL es distinta y la imagen se refresca sin
 * pelearse con la caché.
 */

import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { ApiError, NetworkError, uploadApi, API_BASE_URL } from '@/api'
import { usePickImage, type PickSource } from '@/hooks/media/usePickImage'
import { useAuthStore } from '@/stores/useAuthStore'

export function useAvatarUpload() {
  const { pick } = usePickImage()
  const updateUser = useAuthStore((s) => s.updateUser)
  const [isUploading, setIsUploading] = useState(false)

  const upload = useCallback(
    async (source: PickSource): Promise<boolean> => {
      const image = await pick(source)
      if (!image) return false

      const accessToken = useAuthStore.getState().accessToken
      if (!accessToken) return false

      setIsUploading(true)

      try {
        const { avatarUrl } = await uploadApi.avatar(image, accessToken)
        updateUser({ avatarUrl })
        return true
      } catch (error) {
        /**
         * El motivo se muestra tal cual: "no se pudo subir" a secas no deja
         * saber si es la red, el formato o el tamaño, y el usuario repite el
         * mismo intento fallido. El detalle también sale por consola, que en
         * desarrollo aparece en la terminal de Metro.
         */
        const detail =
          error instanceof ApiError
            ? `${error.message} (${error.code})`
            : error instanceof NetworkError
              ? `${error.message}\n\nServidor: ${API_BASE_URL}`
              : error instanceof Error
                ? error.message
                : 'Error desconocido'

        console.error('[avatar] fallo al subir:', detail, error)
        Alert.alert('No se pudo subir la foto', detail)

        return false
      } finally {
        setIsUploading(false)
      }
    },
    [pick, updateUser],
  )

  /** Pregunta de dónde sacar la foto y la sube. */
  const chooseAndUpload = useCallback(
    (hasPhoto: boolean) => {
      Alert.alert(
        hasPhoto ? 'Cambiar foto de perfil' : 'Añadir foto de perfil',
        'Se mostrará en tu perfil público.',
        [
          { text: 'Hacer una foto', onPress: () => void upload('camera') },
          { text: 'Elegir de la galería', onPress: () => void upload('library') },
          { text: 'Cancelar', style: 'cancel' },
        ],
      )
    },
    [upload],
  )

  return { chooseAndUpload, isUploading }
}
