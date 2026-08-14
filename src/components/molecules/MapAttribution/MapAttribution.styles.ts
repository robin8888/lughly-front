/**
 * MapAttribution styles
 * Texto de 10 px en la esquina inferior sobre fondo semitransparente
 * (MAPS_MOBILE.md §2).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    // Encima de las capas del mapa y de los marcadores
    zIndex: 30,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(253, 253, 251, 0.75)',
  },
  text: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 10,
    color: theme.colors.cardText,
  },
})
