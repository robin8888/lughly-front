/**
 * usePickDocument
 * Elegir un PDF del sistema, listo para subir.
 *
 * Solo PDF: es lo único que admite un adjunto "documento" del chat
 * (`FileValidator.validateChatAttachment` en el backend, junto a imagen y
 * vídeo). Restringir el selector a ese tipo evita que se elija algo que el
 * servidor va a rechazar de todos modos.
 *
 * ## Por qué el módulo se carga en diferido, y en dos pasos
 *
 * Un `import` de `expo-document-picker` arriba del fichero tumba la app
 * entera —no solo esta pantalla— en cualquier build que no lleve ya
 * compilado el módulo nativo `ExpoDocumentPicker`. Añadir la dependencia y
 * recargar con Metro no basta; hace falta una compilación nativa nueva, y
 * hasta que exista, cualquier pantalla que importe este fichero se queda en
 * blanco.
 *
 * Cargarlo con `require()` dentro de una función, como aquí, evita esa
 * caída. Pero no basta con envolverlo en un `try/catch`: `expo-document-
 * picker` resuelve su módulo nativo con `requireNativeModule` de
 * `expo-modules-core`, que **lanza** si no lo encuentra, y aunque el
 * `catch` de aquí abajo lo capture, Metro ya enseña el aviso en rojo antes
 * de que le llegue —comprobado en el móvil, no es solo teoría—. Por eso se
 * comprueba antes con `requireOptionalNativeModule`, la variante hermana
 * que **nunca lanza** y solo devuelve `null`: si dice que no está, no se
 * llega a tocar el paquete entero, y el aviso rojo no llega a aparecer.
 */

import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { requireOptionalNativeModule } from 'expo-modules-core'

interface DocumentPickerModule {
  getDocumentAsync(options?: { type?: string }): Promise<
    | { canceled: true; assets: null }
    | { canceled: false; assets: { uri: string; name: string; mimeType?: string }[] }
  >
}

/**
 * `undefined` = todavía sin intentar, `null` = intentado y no está.
 * Se recuerda para no repetir la comprobación en cada pulsación.
 */
let cached: DocumentPickerModule | null | undefined

function loadDocumentPicker(): DocumentPickerModule | null {
  if (cached !== undefined) return cached

  // Sin esto, `require('expo-document-picker')` de abajo lanzaría igual
  if (requireOptionalNativeModule('ExpoDocumentPicker') === null) {
    cached = null
    return cached
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('expo-document-picker') as DocumentPickerModule
  } catch {
    // Por si acaso: no debería llegar aquí tras la comprobación de arriba
    cached = null
  }

  return cached
}

/** Si este aparato puede elegir documentos. La interfaz lo usa para no ofrecer lo que no hay. */
export function isDocumentPickerAvailable(): boolean {
  return loadDocumentPicker() !== null
}

export interface PickedDocument {
  uri: string
  name: string
  mimeType: string
}

export function usePickDocument() {
  const [isPicking, setIsPicking] = useState(false)

  const pick = useCallback(async (): Promise<PickedDocument | null> => {
    const documentPicker = loadDocumentPicker()

    if (!documentPicker) {
      Alert.alert(
        'No disponible',
        'Esta versión de la app todavía no incluye el selector de documentos. Puedes adjuntar una foto.',
      )
      return null
    }

    setIsPicking(true)

    try {
      const result = await documentPicker.getDocumentAsync({ type: 'application/pdf' })
      if (result.canceled) return null

      const asset = result.assets[0]
      if (!asset) return null

      return { uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/pdf' }
    } finally {
      setIsPicking(false)
    }
  }, [])

  return { pick, isPicking, isAvailable: isDocumentPickerAvailable() }
}
