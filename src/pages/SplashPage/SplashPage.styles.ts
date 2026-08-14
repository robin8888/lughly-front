/**
 * SplashPage styles
 * Según MobileApp.dc.html: fondo #04070f, imagen cover anclada arriba,
 * degradado inferior y bloque de acciones con padding 4px 20px 26px.
 */

import { StyleSheet, ViewStyle } from 'react-native'
import { theme } from '@/theme'

/** Franjas del degradado inferior: de transparente a darkBg. */
const GRADIENT_STEPS = 16
/** A partir de esta franja el degradado ya es opaco (96% en el diseño). */
const GRADIENT_OPAQUE_AT = 12

export const gradientSlices: ViewStyle[] = Array.from(
  { length: GRADIENT_STEPS },
  (_, index) => ({
    flex: 1,
    backgroundColor: theme.colors.darkBg,
    opacity: Math.min(1, index / GRADIENT_OPAQUE_AT),
  })
)

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
  },
  imageArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // El diseño arranca el degradado al 72% de la imagen
    height: '28%',
  },
  actions: {
    flexShrink: 0,
    paddingTop: theme.spacing[1],
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[8],
    gap: theme.spacing[3],
    backgroundColor: theme.colors.darkBg,
  },
  actionButton: {
    paddingVertical: theme.spacing[4],
  },
  loginButton: {
    paddingVertical: theme.spacing[4],
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: theme.colors.cardBg,
  },
})
