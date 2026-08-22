/**
 * MessagesFab styles
 * Mismo cristal y sombra que la píldora de abajo (BottomTabBar.styles.ts),
 * en redondo: la app ya tiene ese lenguaje para "flota encima de todo".
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

const SIZE = 54

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: SIZE,
    height: SIZE,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    zIndex: 70,
    shadowColor: 'rgba(4, 7, 15, 1)',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
})
