/**
 * useIdentityGate
 * Convierte el 403 de "te falta el documento" en una salida.
 *
 * El servidor cierra tres puertas —adjudicar, encargar y pedir una
 * urgencia— con el código `IDENTITY_DOCUMENTS_MISSING`. Sin esto, ese 403
 * aterriza como cualquier otro fallo: una línea roja en un formulario o un
 * aviso de "no se ha podido", que deja al usuario adivinando qué ha hecho mal.
 * No ha hecho nada mal; le falta un papel y hay una pantalla para subirlo.
 *
 * Se engancha en el `onError` de las mutaciones y no en cada pantalla, para
 * que ninguna se quede sin él por olvido.
 *
 * El bloqueo de verdad lo pone el servidor, siempre. Esto es solo el cartel
 * que dice por dónde se sale.
 */

import { useCallback } from 'react'
import { Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { ApiError } from '@/api'

/** El código que devuelve el backend. Debe coincidir con `domain.error.ts`. */
export const IDENTITY_DOCUMENTS_MISSING = 'IDENTITY_DOCUMENTS_MISSING'

export function isIdentityGateError(error: unknown): boolean {
  return error instanceof ApiError && error.code === IDENTITY_DOCUMENTS_MISSING
}

export function useIdentityGate() {
  const router = useRouter()

  /**
   * Devuelve `true` si el error era este y ya se ha atendido, para que quien
   * llama no enseñe además su propio mensaje de fallo encima.
   */
  const handle = useCallback(
    (error: unknown): boolean => {
      if (!isIdentityGateError(error)) return false

      Alert.alert(
        'Te falta el documento de identidad',
        // El servidor ya explica qué acción y por qué; no se reescribe aquí
        (error as ApiError).message,
        [
          { text: 'Ahora no', style: 'cancel' },
          {
            text: 'Subir documento',
            onPress: () => router.push('/mis-documentos'),
          },
        ],
      )

      return true
    },
    [router],
  )

  return handle
}
