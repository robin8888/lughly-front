/**
 * usePickDocument
 * Elegir un PDF del sistema, listo para subir.
 *
 * Solo PDF: es lo único que admite un adjunto "documento" del chat
 * (`FileValidator.validateChatAttachment` en el backend, junto a imagen y
 * vídeo). Restringir el selector a ese tipo evita que se elija algo que el
 * servidor va a rechazar de todos modos.
 */

import { useCallback, useState } from 'react'
import * as DocumentPicker from 'expo-document-picker'

export interface PickedDocument {
  uri: string
  name: string
  mimeType: string
}

export function usePickDocument() {
  const [isPicking, setIsPicking] = useState(false)

  const pick = useCallback(async (): Promise<PickedDocument | null> => {
    setIsPicking(true)

    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' })
      if (result.canceled) return null

      const asset = result.assets[0]
      if (!asset) return null

      return { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf' }
    } finally {
      setIsPicking(false)
    }
  }, [])

  return { pick, isPicking }
}
