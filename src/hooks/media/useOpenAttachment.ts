/**
 * useOpenAttachment
 * Bajar un adjunto del chat (con sesión) y abrirlo con la hoja de compartir
 * del sistema.
 *
 * No hay atajo más corto: la ruta que sirve un adjunto de chat exige
 * `Authorization` (es una conversación privada, no algo público como un
 * avatar), así que un enlace directo del sistema —o un `Linking.openURL` a
 * secas— llegaría sin la cabecera y se encontraría un 401. Hay que bajarlo
 * primero con el token puesto y solo entonces ofrecer abrirlo.
 *
 * `expo-sharing` es un módulo nativo nuevo (como `expo-document-picker`):
 * se comprueba con `requireOptionalNativeModule` antes de tocar el paquete,
 * mismo motivo que `usePickDocument.ts` — un `require` a secas, aunque esté
 * en un `try/catch`, deja el aviso de desarrollo en pantalla igual.
 */

import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { File, Paths } from 'expo-file-system'
import { requireOptionalNativeModule } from 'expo-modules-core'
import { useAuthStore } from '@/stores/useAuthStore'

interface SharingModule {
  shareAsync(url: string, options?: { dialogTitle?: string }): Promise<void>
}

let cached: SharingModule | null | undefined

function loadSharing(): SharingModule | null {
  if (cached !== undefined) return cached

  if (requireOptionalNativeModule('ExpoSharing') === null) {
    cached = null
    return cached
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-sharing') as SharingModule
  } catch {
    cached = null
  }

  return cached
}

export function useOpenAttachment() {
  const [isOpening, setIsOpening] = useState(false)

  const open = useCallback(async (url: string, fileName: string) => {
    const sharing = loadSharing()

    if (!sharing) {
      Alert.alert(
        'No disponible',
        'Esta versión de la app todavía no incluye cómo abrir adjuntos.',
      )
      return
    }

    const accessToken = useAuthStore.getState().accessToken
    if (!accessToken) return

    setIsOpening(true)

    try {
      const destination = new File(Paths.cache, fileName)

      const downloaded = await File.downloadFileAsync(url, destination, {
        headers: { Authorization: `Bearer ${accessToken}` },
        // El mismo adjunto puede abrirse más de una vez en la misma sesión
        idempotent: true,
      })

      await sharing.shareAsync(downloaded.uri)
    } catch (error) {
      Alert.alert(
        'No se ha podido abrir',
        error instanceof Error ? error.message : 'Inténtalo de nuevo.',
      )
    } finally {
      setIsOpening(false)
    }
  }, [])

  return { open, isOpening }
}
