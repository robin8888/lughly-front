/**
 * Avatar styles
 *
 * Mismos valores que el avatar de Mi cuenta, que es el patrón que ya seguían
 * los cuatro hechos a mano: círculo con velo del acento y contorno fino, para
 * que la reserva sin foto no sea un agujero.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
