/**
 * PhotoViewer styles
 * Fondo casi negro y la foto ocupando lo que pueda: aquí no compite nada.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4, 7, 15, 0.94)',
  },
  photo: {
    width: '100%',
    height: '78%',
  },
  pager: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  /** Grandes: se tocan con el pulgar y con el móvil en una mano */
  pagerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerIcon: {
    fontSize: 30,
    lineHeight: 34,
    color: '#ffffff',
  },
  pagerCount: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  hint: {
    position: 'absolute',
    bottom: 28,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
    opacity: 0.6,
  },
})
