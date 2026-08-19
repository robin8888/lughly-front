/**
 * RemotePhoto styles
 * El hueco de una foto que no ha cargado: se ve que es una foto que falta, no
 * un espacio vacío del diseño.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  failed: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.accent500,
  },
  failedText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    textAlign: 'center',
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  failedReason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    textAlign: 'center',
    color: theme.colors.error,
  },
})
