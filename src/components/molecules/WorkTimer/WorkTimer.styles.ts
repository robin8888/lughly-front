/**
 * WorkTimer styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /*
    Una tarjeta pequeña, no una línea de texto. El tiempo trabajado es lo que
    se acaba pagando en un trabajo por horas: tiene que poder mirarse de reojo
    desde el otro lado de una habitación, no buscarse entre párrafos.
  */
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceSoft,
  },
  /* Corriendo se distingue por el fondo, no por un punto que parpadee */
  running: {
    backgroundColor: theme.colors.accent100,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginBottom: theme.spacing[1],
  },
  /*
    Tabular a propósito: sin ancho fijo por cifra, el número entero baila a
    cada segundo porque el 1 es más estrecho que el 8, y un contador que se
    mueve solo se lee peor que uno quieto.
  */
  time: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 30,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  timeRunning: {
    color: theme.colors.accent700,
  },
})
