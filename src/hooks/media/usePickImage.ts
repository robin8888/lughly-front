/**
 * usePickImage
 * Selección de imagen desde galería o cámara, lista para subir.
 *
 * Antes de devolverla se redimensiona y recomprime. Eso hace tres cosas:
 * - Una foto de iPhone pasa de 3-5 MB a 200-400 KB sin pérdida visible.
 * - La subida con datos móviles deja de tardar una eternidad.
 * - Al reescribir el fichero se **eliminan los metadatos EXIF**, que en el
 *   iPhone incluyen las coordenadas GPS de dónde se hizo la foto. No queremos
 *   guardar sin querer el domicilio de nuestros usuarios.
 */

import { useCallback, useState } from 'react'
import { Alert, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

/** Suficiente para leer un DNI o ver una cara con nitidez. */
const MAX_WIDTH = 1400
const JPEG_QUALITY = 0.7

export interface PickedImage {
  uri: string
  name: string
  mimeType: string
}

export type PickSource = 'library' | 'camera'

async function compress(uri: string): Promise<PickedImage> {
  const image = await ImageManipulator.manipulate(uri)
    .resize({ width: MAX_WIDTH })
    .renderAsync()

  const result = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: JPEG_QUALITY,
  })

  return {
    uri: result.uri,
    name: `imagen-${Date.now()}.jpg`,
    mimeType: 'image/jpeg',
  }
}

function warnAboutPermission(source: PickSource): void {
  const what = source === 'camera' ? 'la cámara' : 'tus fotos'

  Alert.alert(
    'Permiso necesario',
    `Lughly necesita acceso a ${what} para continuar. Puedes concederlo desde los ajustes del sistema.`,
    [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: () => void Linking.openSettings() },
    ],
  )
}

export function usePickImage() {
  const [isProcessing, setIsProcessing] = useState(false)

  const pick = useCallback(
    async (source: PickSource = 'library'): Promise<PickedImage | null> => {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permission.granted) {
        warnAboutPermission(source)
        return null
      }

      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 1, // se comprime después, con control nuestro
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options)

      const asset = result.assets?.[0]
      if (result.canceled || !asset) return null

      setIsProcessing(true)
      try {
        return await compress(asset.uri)
      } catch {
        Alert.alert(
          'No se pudo procesar la imagen',
          'Inténtalo con otra foto.',
        )
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [],
  )

  return { pick, isProcessing }
}
