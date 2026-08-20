/**
 * InfoCard styles
 *
 * **Reescrito el 20 Agosto 2026.** La tarjeta era cuadrada, con contorno azul
 * y una cuadrícula de plano detrás. Las tres cosas juntas se leían como un
 * plano de obra, y en un sitio donde se elige a una persona eso aleja.
 *
 * Ahora es blanca, redondeada y sin marco: se separa de la página y de la
 * siguiente por aire y una sombra muy baja. La cuadrícula se fue con el
 * contorno; el átomo `CardGrid` sigue existiendo por si alguna vez vuelve.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  base: {
    position: 'relative',
    padding: 14,
    borderRadius: theme.radius.card,
    ...theme.shadows.card,
  },
  light: {
    backgroundColor: theme.colors.cardBg,
  },
  dark: {
    backgroundColor: theme.colors.darkBg,
  },
})
