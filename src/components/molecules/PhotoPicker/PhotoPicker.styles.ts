/**
 * PhotoPicker styles
 * Rejilla de cuatro columnas, según el diseño `isPublicar`.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    flex: 1,
    // Cuadrados: la miniatura recorta al centro y así la rejilla no baila
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.fieldBorder,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.field,
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.accent,
  },
  /** Huecos posteriores al primero libre: visibles pero apagados */
  slotDisabled: {
    opacity: 0.45,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  remove: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  removeIcon: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 15,
  },
})
