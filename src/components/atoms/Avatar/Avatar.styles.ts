/**
 * Avatar styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: theme.colors.accent200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: theme.typography.fonts.heading,
    color: theme.colors.accent800,
    textTransform: 'uppercase',
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 48,
    height: 48,
  },
  large: {
    width: 72,
    height: 72,
  },
  smallText: {
    fontSize: 13.5,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 27,
  },
})
