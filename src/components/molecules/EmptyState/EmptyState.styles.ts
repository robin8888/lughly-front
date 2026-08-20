/**
 * EmptyState styles
 * Tarjeta blueprint clara, tipografía y colores del sistema.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /**
   * Centrado en el hueco que le quede.
   *
   * `flex: 1` lo centra cuando cuelga de una pantalla, que es lo normal. El
   * `minHeight` es para el otro caso: dentro del contenido de un scroll, un
   * `flex: 1` se queda en cero y el vacío desaparecería del todo. Con los dos
   * puestos, o llena la pantalla o mide eso, pero nunca nada.
   */
  container: {
    flex: 1,
    minHeight: 380,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  illustration: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.cardText,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.75,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 18,
  },
})
