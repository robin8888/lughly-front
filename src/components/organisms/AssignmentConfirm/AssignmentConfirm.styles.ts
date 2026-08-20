/**
 * AssignmentConfirm styles
 * Lo poco que el diálogo no pone ya: el campo del motivo y el error.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  field: {
    width: '100%',
    marginTop: 14,
  },
  /**
   * Sobre el cristal de color, el error va en blanco y en negrita: el rojo de
   * error encima de un fondo rojo no se leería, y aquí lo que falla no es el
   * campo sino el envío.
   */
  error: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.4,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 10,
  },
})
