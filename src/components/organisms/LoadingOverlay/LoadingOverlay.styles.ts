/**
 * LoadingOverlay styles
 * Según Home.dc.html:
 *   inset:0; background: accent-900 al 70%; backdrop-filter: blur(10px);
 *   flex column centrado, gap 24px; la mascota al 88% del ancho
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[8],
  },
  /**
   * El velo va SOBRE el desenfoque, no en su lugar: el diseño usa
   * `color-mix(accent-900 70%, transparent)` encima de `backdrop-filter`.
   */
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(29, 45, 61, 0.7)',
  },
  mascot: {
    width: '88%',
    height: '45%',
  },
  message: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.bg,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[8],
    opacity: 0.9,
  },
})
