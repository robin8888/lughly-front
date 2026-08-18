/**
 * ImagePickerField Molecule
 * Recuadro para adjuntar una imagen: foto de perfil, documento o certificado.
 *
 * Solo compone UI; la selección, compresión y limpieza de metadatos viven
 * en `usePickImage`.
 */

import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { usePickImage, type PickedImage } from '@/hooks/media/usePickImage'
import { useScanDocument } from '@/hooks/media/useScanDocument'
import { theme } from '@/theme'
import { styles } from './ImagePickerField.styles'

export interface ImagePickerFieldProps {
  value: PickedImage | null
  onChange: (image: PickedImage | null) => void
  /** `avatar` es un cuadro pequeño con texto al lado; `box` ocupa el ancho */
  variant?: 'avatar' | 'box'
  placeholder?: string
  /** Texto a la derecha, solo en variante avatar */
  sideText?: string
  /**
   * Para documentos de identidad: sustituye "Hacer foto" por el escáner nativo
   * del sistema, que solo captura cuando reconoce un documento.
   *
   * Va como prop y no como componente aparte porque el aspecto es el mismo y lo
   * único que cambia es de dónde sale la imagen. La galería se queda: hay quien
   * ya tiene la foto hecha, y en un aparato sin escáner es la única salida.
   */
  document?: boolean
  error?: boolean
  disabled?: boolean
  testID?: string
}

export function ImagePickerField({
  value,
  onChange,
  variant = 'box',
  placeholder = 'Subir',
  sideText,
  error = false,
  disabled = false,
  document = false,
  testID,
}: ImagePickerFieldProps) {
  const { pick, isProcessing } = usePickImage()
  const { scan, isScanning, isAvailable: canScan } = useScanDocument()
  const isBusy = isProcessing || isScanning || disabled

  const handlePick = async (source: 'library' | 'camera') => {
    const image = await pick(source)
    if (image) onChange(image)
  }

  const handleScan = async () => {
    const image = await scan()
    if (image) onChange(image)
  }

  const slot = (
    <Pressable
      onPress={() => void handlePick('library')}
      disabled={isBusy}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={value ? 'Cambiar imagen' : placeholder}
      style={[
        variant === 'avatar' ? styles.avatarSlot : styles.box,
        value && styles.filled,
        error && styles.error,
        isBusy && styles.disabled,
      ]}
    >
      {isProcessing || isScanning ? (
        <ActivityIndicator size="small" color={theme.colors.accent} />
      ) : value ? (
        <Image
          source={{ uri: value.uri }}
          style={variant === 'avatar' ? styles.preview : styles.boxPreview}
          resizeMode="cover"
        />
      ) : (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </Pressable>
  )

  return (
    <View>
      {variant === 'avatar' ? (
        <View style={styles.row}>
          {slot}
          {sideText && <Text style={styles.sideText}>{sideText}</Text>}
        </View>
      ) : (
        slot
      )}

      <View style={styles.actions}>
        {/*
          Con `document`, la captura la hace el escáner del sistema. No es una
          cámara con otro nombre: detecta el documento, recorta y endereza, y no
          deja disparar si no ve uno. Ahí está lo que impide subir cualquier otra
          cosa, y está en el origen y no en una comprobación posterior.

          `canScan` es falso cuando el binario no trae el módulo nativo, lo que
          pasa siempre que el JavaScript va por delante del build. Entonces se
          ofrece la cámara normal: se pierde la garantía, pero se puede seguir.
          Prometer "Escanear documento" y que no haga nada sería peor.
        */}
        <Pressable
          onPress={() =>
            void (document && canScan ? handleScan() : handlePick('camera'))
          }
          disabled={isBusy}
          testID={testID ? `${testID}-camera` : undefined}
          accessibilityRole="button"
        >
          <Text style={styles.action}>
            {document && canScan ? 'Escanear documento' : 'Hacer foto'}
          </Text>
        </Pressable>

        {value && (
          <Pressable
            onPress={() => onChange(null)}
            disabled={isBusy}
            testID={testID ? `${testID}-remove` : undefined}
            accessibilityRole="button"
          >
            <Text style={[styles.action, styles.actionDanger]}>Quitar</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
