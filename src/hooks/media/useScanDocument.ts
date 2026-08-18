/**
 * useScanDocument
 * Captura un documento con el escáner nativo del sistema.
 *
 * **No es la cámara normal.** Usa `VNDocumentCameraViewController` en iOS y el
 * escáner de documentos de ML Kit en Android: los dos detectan el rectángulo
 * del documento, guían al usuario, y recortan y corrigen la perspectiva. La
 * consecuencia importante es que **no se puede fotografiar cualquier cosa**: si
 * no encuentra un documento, no deja capturar.
 *
 * Eso resuelve el problema en el origen, que es donde se resuelve bien. La
 * alternativa era juzgar la foto después con OCR, y se probó: sobre una imagen
 * de césped y cielo, el OCR devolvió 983 caracteres de basura, mientras que
 * sobre un logotipo con una palabra real devolvió 6. Contar texto no distingue
 * un documento de una textura.
 *
 * El fichero que devuelve el escáner pasa por `prepareForUpload`, el mismo aro
 * que las imágenes de la galería: se recomprime y se le quitan los metadatos
 * EXIF, que en el iPhone llevan las coordenadas GPS.
 *
 * ## Por qué el módulo se carga en diferido
 *
 * Porque un `import` arriba del fichero **tumbaba la app entera**, no solo esta
 * pantalla. El módulo llama a `TurboModuleRegistry.getEnforcing('DocumentScanner')`
 * en su propio cuerpo, y eso lanza al importarse si el binario no lo trae. El
 * fallo subía por `ImagePickerField` → `MyDocumentsPage` → `_layout` y se
 * llevaba el router: pantalla en blanco antes de llegar a ninguna parte.
 *
 * Pasa siempre que el JavaScript va por delante del binario, que es lo normal
 * en desarrollo: se añade la dependencia, Metro recarga, y el módulo nativo no
 * está hasta el siguiente `eas build`. Pero también valdría en producción con
 * un aparato raro, y una app que no arranca es lo peor que puede pasar.
 *
 * Cargándolo dentro de la función, quien no lo tenga se queda sin escáner y con
 * la galería, que es una degradación y no una caída.
 */

import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import { prepareForUpload, type PickedImage } from './usePickImage'

interface ScannerModule {
  scanDocument(options?: {
    croppedImageQuality?: number
    maxNumDocuments?: number
    responseType?: string
  }): Promise<{ scannedImages?: string[]; status?: string }>
}

/**
 * `undefined` = todavía sin intentar, `null` = intentado y no está.
 * Se recuerda para no repetir un `require` que ya falló en cada pulsación.
 */
let cached: ScannerModule | null | undefined

function loadScanner(): ScannerModule | null {
  if (cached !== undefined) return cached

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('react-native-document-scanner-plugin') as {
      default?: ScannerModule
    }

    cached = module.default ?? null
  } catch {
    // El binario no lo trae. No es un error del que informar aquí.
    cached = null
  }

  return cached
}

/** Si este aparato puede escanear. La interfaz lo usa para no ofrecer lo que no hay. */
export function isScannerAvailable(): boolean {
  return loadScanner() !== null
}

export function useScanDocument() {
  const [isScanning, setIsScanning] = useState(false)

  const scan = useCallback(async (): Promise<PickedImage | null> => {
    const scanner = loadScanner()

    if (!scanner) {
      Alert.alert(
        'El escáner no está disponible',
        'Esta versión de la app todavía no lo incluye. Puedes subir la foto desde la galería.',
      )
      return null
    }

    setIsScanning(true)

    try {
      const { scannedImages } = await scanner.scanDocument({
        // Una cara por captura: cada una se sube con su tipo (frontal, trasera)
        maxNumDocuments: 1,
        responseType: 'imageFilePath',
        // El recorte ya lo hace el escáner; comprimir es cosa nuestra después
        croppedImageQuality: 100,
      })

      const first = scannedImages?.[0]

      // Cancelar no es un fallo: se sale sin decir nada
      if (!first) return null

      return await prepareForUpload(first)
    } catch (error) {
      /**
       * Aquí llegan los fallos del escáner ya cargado: sin permiso de cámara, o
       * un Android sin Play Services. Se dice qué hacer en vez de dejar un
       * "algo ha fallado": la galería sigue estando ahí.
       */
      Alert.alert(
        'No hemos podido abrir el escáner',
        error instanceof Error && error.message
          ? `${error.message}\n\nPuedes subir la foto desde la galería.`
          : 'Inténtalo de nuevo, o sube la foto desde la galería.',
      )

      return null
    } finally {
      setIsScanning(false)
    }
  }, [])

  return { scan, isScanning, isAvailable: isScannerAvailable() }
}
