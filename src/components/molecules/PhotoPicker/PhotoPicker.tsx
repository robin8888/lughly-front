/**
 * PhotoPicker Molecule
 * Rejilla de cuatro huecos para las fotos del trabajo (diseño `isPublicar`).
 *
 * Distinto de `ImagePickerField`, que es para una sola imagen con su
 * etiqueta: aquí lo que importa es la rejilla, el orden y poder quitar una
 * del medio sin tocar las demás.
 *
 * La selección, la compresión y el borrado de metadatos EXIF —incluidas las
 * coordenadas GPS— los hace `usePickImage`. Es importante en esta pantalla:
 * la foto de una fuga se hace en casa del cliente, y su ubicación no tiene
 * por qué viajar con la imagen.
 */

import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import { usePickImage, type PickedImage } from '@/hooks/media/usePickImage'
import { theme } from '@/theme'
import { styles } from './PhotoPicker.styles'

/** El diseño enseña cuatro huecos. */
/**
 * Huecos por defecto: los cuatro que enseña el diseño para un trabajo.
 *
 * Las fotos del profesional son cinco, así que el máximo se puede pasar. Cada
 * tope tiene su motivo y los dos los hace cumplir el servidor: cuatro en un
 * trabajo porque más no aporta para valorar una avería, cinco en un perfil
 * porque caben en la tira de la tarjeta y obligan a elegir las mejores.
 */
export const MAX_PHOTOS = 4

export interface PhotoPickerProps {
  value: PickedImage[]
  onChange: (photos: PickedImage[]) => void
  /** Cuántas caben. Por defecto las cuatro de un trabajo. */
  max?: number
  disabled?: boolean
  testID?: string
}

export function PhotoPicker({
  value,
  onChange,
  max = MAX_PHOTOS,
  disabled = false,
  testID,
}: PhotoPickerProps) {
  const { pick, isProcessing } = usePickImage()
  const isBusy = isProcessing || disabled

  const handleAdd = async () => {
    const image = await pick('library')
    if (image) onChange([...value, image].slice(0, max))
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, position) => position !== index))
  }

  /** Siempre cuatro huecos: los llenos primero y el resto vacíos. */
  const slots = Array.from({ length: max }, (_, index) => value[index] ?? null)

  return (
    <View style={styles.grid} testID={testID ?? 'photo-picker'}>
      {slots.map((photo, index) => {
        // El primer hueco vacío es el que añade; los siguientes no hacen nada,
        // para que no se puedan crear huecos en medio.
        const isNextEmpty = photo === null && index === value.length

        return (
          <Pressable
            key={index}
            onPress={() =>
              photo ? handleRemove(index) : isNextEmpty ? void handleAdd() : undefined
            }
            disabled={isBusy || (!photo && !isNextEmpty)}
            accessibilityRole="button"
            accessibilityLabel={
              photo ? `Quitar foto ${index + 1}` : 'Añadir foto del trabajo'
            }
            style={[
              styles.slot,
              photo !== null && styles.slotFilled,
              !photo && !isNextEmpty && styles.slotDisabled,
            ]}
            testID={`photo-slot-${index}`}
          >
            {photo ? (
              <>
                <Image source={{ uri: photo.uri }} style={styles.thumb} />
                <View style={styles.remove}>
                  <Text style={styles.removeIcon}>×</Text>
                </View>
              </>
            ) : isProcessing && isNextEmpty ? (
              <ActivityIndicator size="small" color={theme.colors.accent} />
            ) : (
              <Text style={styles.slotLabel}>{isNextEmpty ? '+' : ''}</Text>
            )}
          </Pressable>
        )
      })}
    </View>
  )
}
