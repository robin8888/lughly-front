/**
 * HomePage styles
 *
 * Fondo claro, igual que la home del profesional y que el resto de la app.
 *
 * HOME_MOBILE.md especifica #04070f para esta pantalla, pero el fondo oscuro
 * la dejaba como la única pantalla negra de la aplicación: se entraba desde
 * el directorio o la ficha, ambos claros, y el salto se notaba. Las secciones
 * 03 y 05 siguen siendo tarjetas oscuras, así que la alternancia clara/oscura
 * que usa el diseño para separar bloques se mantiene.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingBottom: 88,
  },
})
