/**
 * WorkTimer styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /*
    Una tarjeta ancha y centrada, no una línea de texto. El tiempo trabajado es
    lo que se acaba pagando en un trabajo por horas: tiene que poder mirarse de
    reojo desde el otro lado de una habitación, no buscarse entre párrafos.

    `alignSelf: 'stretch'` es lo que lo centra de verdad. Sin él la caja mide
    lo que mide el número —y un número que cambia de ancho al pasar de 59:59 a
    1:00:00 se descoloca solo—; ocupando el ancho entero, el contenido cae en
    el centro y ahí se queda.
  */
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: theme.colors.neutral200,
    marginVertical: theme.spacing[2],
  },
  /**
   * Corriendo se distingue por el fondo, no por un punto que parpadee.
   *
   * Y en el **verde de «en curso»**, el mismo de la etiqueta del trabajo y del
   * fondo de su tarjeta en la agenda. Era azul, que en esta app es el color de
   * la marca y no significa nada por sí solo; el verde ya quiere decir "esto
   * está en marcha" en todas las demás pantallas.
   */
  running: {
    backgroundColor: theme.colors.availableSoft,
    borderColor: theme.colors.available,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: theme.colors.textSoft,
    marginBottom: theme.spacing[1],
  },
  labelRunning: {
    color: theme.colors.availableText,
  },
  /*
    Tabular a propósito: sin ancho fijo por cifra, el número entero baila a
    cada segundo porque el 1 es más estrecho que el 8, y un contador que se
    mueve solo se lee peor que uno quieto.
  */
  time: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 40,
    lineHeight: 46,
    color: theme.colors.text,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  timeRunning: {
    color: theme.colors.availableText,
  },
  /** Debajo del número, para lo que haya que matizar: «desde las 10:15» */
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: theme.spacing[1],
    textAlign: 'center',
  },
})
