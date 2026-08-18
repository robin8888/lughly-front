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
 * Sobre la compatibilidad: el README de la librería no menciona la Nueva
 * Arquitectura, pero su módulo declara `interface Spec extends TurboModule` y
 * trae `codegenConfig`, así que es nativo de ella. Con React Native 0.86 eso
 * importa: la arquitectura antigua ya no existe.
 */

import { useCallback, useState } from 'react'
import { Alert } from 'react-native'
import DocumentScanner, {
  ResponseType,
} from 'react-native-document-scanner-plugin'
import { prepareForUpload, type PickedImage } from './usePickImage'

export function useScanDocument() {
  const [isScanning, setIsScanning] = useState(false)

  const scan = useCallback(async (): Promise<PickedImage | null> => {
    setIsScanning(true)

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        // Una cara por captura: cada una se sube con su tipo (frontal, trasera)
        maxNumDocuments: 1,
        responseType: ResponseType.ImageFilePath,
        // El recorte ya lo hace el escáner; comprimir es cosa nuestra después
        croppedImageQuality: 100,
      })

      const first = scannedImages?.[0]

      // Cancelar no es un fallo: se sale sin decir nada
      if (!first) return null

      return await prepareForUpload(first)
    } catch (error) {
      /**
       * El fallo esperable es que el aparato no tenga escáner —Android sin
       * Play Services, o un iPhone muy antiguo—. Se dice qué hacer en vez de
       * dejar un "algo ha fallado": la galería sigue estando ahí.
       */
      Alert.alert(
        'No hemos podido abrir el escáner',
        error instanceof Error && error.message
          ? `${error.message}\n\nPuedes subir la foto desde la galería.`
          : 'Tu teléfono no admite el escáner de documentos. Puedes subir la foto desde la galería.',
      )

      return null
    } finally {
      setIsScanning(false)
    }
  }, [])

  return { scan, isScanning }
}
