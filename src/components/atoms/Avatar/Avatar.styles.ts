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
  /**
   * El anillo de disponibilidad, con su hueco de aire por dentro.
   *
   * El tamaño se lo pone quien lo usa, con el del avatar más el grosor y el
   * hueco. Va medido y no con `padding`, porque un `View` con borde y sin
   * medidas se estira a lo ancho del padre, y con `alignSelf` para evitarlo se
   * descolocaba donde el padre centra —que es justo el caso de la cabecera de
   * la home—.
   */
  ring: {
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringAvailable: {
    borderColor: theme.colors.available,
  },
  ringUnavailable: {
    borderColor: theme.colors.unavailable,
  },
  image: {
    width: '100%',
    height: '100%',
  },
})
