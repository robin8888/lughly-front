/**
 * ImagePickerField Molecule
 * Recuadro para adjuntar una imagen: foto de perfil, documento o certificado.
 *
 * Solo compone UI; la selección, compresión y limpieza de metadatos viven
 * en `usePickImage`.
 */

import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { usePickImage, type PickedImage } from '@/hooks/media/usePickImage'
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
  testID,
}: ImagePickerFieldProps) {
  const { pick, isProcessing } = usePickImage()
  const isBusy = isProcessing || disabled

  const handlePick = async (source: 'library' | 'camera') => {
    const image = await pick(source)
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
      {isProcessing ? (
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
        <Pressable
          onPress={() => void handlePick('camera')}
          disabled={isBusy}
          testID={testID ? `${testID}-camera` : undefined}
          accessibilityRole="button"
        >
          <Text style={styles.action}>Hacer foto</Text>
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
