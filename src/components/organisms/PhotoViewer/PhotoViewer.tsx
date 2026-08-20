/**
 * PhotoViewer Organism
 * Una foto a pantalla completa, para mirarla de cerca.
 *
 * Existe porque una miniatura de 90 px no sirve para lo que se usan las fotos
 * de un trabajo: quien va a arreglar algo necesita ver **el detalle** —qué
 * modelo de grifo es, por dónde sale el agua— antes de salir de casa con las
 * herramientas.
 *
 * Se cierra tocando en cualquier parte y con el botón de atrás del móvil, que
 * es lo que todo el mundo intenta. No hay botón de cerrar: ocuparía sitio de
 * la foto para hacer lo que ya hace un toque.
 *
 * Con varias, se pasa de una a otra sin salir: volver a la lista para abrir la
 * siguiente convierte mirar cuatro fotos en doce toques.
 */

import { useEffect, useState } from 'react'
import { Modal, View, Text, Pressable, Image } from 'react-native'
import { styles } from './PhotoViewer.styles'

export interface PhotoViewerProps {
  /** Las fotos a tamaño completo, en su orden */
  photos: string[]
  /** Por cuál se abre. `null` la mantiene cerrada */
  openAt: number | null
  onClose: () => void
  testID?: string
}

export function PhotoViewer({
  photos,
  openAt,
  onClose,
  testID,
}: PhotoViewerProps) {
  const [index, setIndex] = useState(openAt ?? 0)

  /* Al abrir por otra foto, empieza por esa y no por donde se quedó */
  useEffect(() => {
    if (openAt !== null) setIndex(openAt)
  }, [openAt])

  if (openAt === null || photos.length === 0) return null

  const current = photos[Math.min(index, photos.length - 1)]
  if (!current) return null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} testID={testID}>
        <Image
          source={{ uri: current }}
          style={styles.photo}
          /* `contain`: recortar una foto que se abre para ver el detalle sería
             quitar justo lo que se ha venido a mirar */
          resizeMode="contain"
          accessibilityLabel="Foto del trabajo"
        />

        {photos.length > 1 && (
          <View style={styles.pager}>
            <Pressable
              onPress={() => setIndex((n) => (n - 1 + photos.length) % photos.length)}
              accessibilityRole="button"
              accessibilityLabel="Foto anterior"
              style={styles.pagerButton}
              testID="photo-viewer-prev"
            >
              <Text style={styles.pagerIcon}>‹</Text>
            </Pressable>

            <Text style={styles.pagerCount}>
              {index + 1} de {photos.length}
            </Text>

            <Pressable
              onPress={() => setIndex((n) => (n + 1) % photos.length)}
              accessibilityRole="button"
              accessibilityLabel="Foto siguiente"
              style={styles.pagerButton}
              testID="photo-viewer-next"
            >
              <Text style={styles.pagerIcon}>›</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.hint}>Toca para cerrar</Text>
      </Pressable>
    </Modal>
  )
}
