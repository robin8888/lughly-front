/**
 * TradeRatesField styles
 * Un bloque por oficio: el nombre arriba con su cruz, los dos precios a la
 * par debajo y el qué haces al final.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /** Cada oficio entero, separado del siguiente por una línea y aire */
  trade: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
    paddingBottom: 14,
    marginBottom: 14,
  },
  /*
   * El último, sin línea: la de abajo separa un oficio del siguiente, y
   * después del último no hay ninguno. Dejada ahí, colgaba de él lo que viene
   * después —añadir otro— como si fuera un campo suyo más.
   */
  tradeLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 0,
  },
  /*
   * El nombre del oficio y la cruz de quitarlo. Sin línea propia: la del
   * bloque ya separa un oficio del siguiente, y con tres partes dentro una
   * raya en medio parecía el final de algo.
   */
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelColumn: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  primary: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent600,
    marginTop: 1,
  },
  /** El elige-por-hora-o-visita entero, con su etiqueta encima */
  modesGroup: {
    marginBottom: 10,
  },
  /**
   * El elige-por-hora-o-visita: los mismos `Button` de siempre, uno relleno
   * —el modo activo— y uno con borde, en vez de una píldora propia que no se
   * pareciera a ningún otro botón de la app.
   */
  modes: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 5,
  },
  modeButton: {
    flex: 1,
  },
  /**
   * Los dos precios a la par.
   *
   * En columna, el de urgencia se leía como una corrección del de arriba; al
   * lado se comparan, que es como se decide el recargo.
   */
  rates: {
    flexDirection: 'row',
    gap: 16,
  },
  /**
   * `flex: 1` a propósito, no un ancho fijo: un número fijo de píxeles
   * —probado y roto— no sabe cuánto sitio hay de verdad en la tarjeta y se
   * sale por el lado en cuanto la pantalla es más estrecha de lo calculado.
   * `flex: 1` siempre cabe, sea cual sea el ancho real.
   */
  rateField: {
    flex: 1,
  },
  /** La fila del mínimo: la misma rejilla de arriba, con la derecha vacía */
  minHoursRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  /*
   * El número pegado a su unidad. A la izquierda quedaba un hueco entre la
   * cifra y el "€/h" que hacía dudar de si formaban parte de lo mismo.
   *
   * Sin ancho propio: llena su columna (`rateField`, `flex: 1`), así que
   * mide lo que de verdad hay disponible y no un número inventado.
   */
  rateInput: {
    textAlign: 'right',
  },
  remove: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
    opacity: 0.55,
  },
  /**
   * Añadir otro oficio: fuera del bloque de arriba y con su propia línea.
   *
   * Pegado a él con diez píxeles se leía como el último campo del oficio que
   * se acababa de rellenar, y no como la puerta para poner el siguiente.
   */
  add: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  addLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 6,
  },
  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 8,
  },

  /**
   * Qué hace en este oficio.
   *
   * Una por oficio: la ficha del directorio responde siempre a un oficio, y
   * con una sola descripción un carpintero que además hace limpieza salía en
   * el listado de limpieza hablando de armarios a medida.
   */
  descriptionRow: {
    marginTop: 10,
  },
  fieldLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    marginBottom: 5,
  },
  descriptionInput: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  fieldHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.textSoft,
    marginTop: 5,
  },
})
