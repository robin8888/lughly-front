/**
 * TradeRatesField styles
 * Un bloque por oficio: nombre y hora normal arriba, la hora en urgencia
 * debajo y el qué haces al final.
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
   * Sin línea propia: la del bloque ya separa un oficio del siguiente, y con
   * tres partes dentro una raya en medio parecía el final de algo.
   */
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 6,
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
  /** Ancho fijo: los precios alineados se comparan de un vistazo */
  rateColumn: {
    // 112 y no 92: dentro del campo va ahora la unidad, y antes se apretaba
    width: 112,
  },
  /*
   * Con rótulo desde que hay dos precios. Sin él, el de urgencia se leía como
   * una corrección del de arriba en vez de como otra tarifa.
   */
  rateLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    textAlign: 'right',
    marginBottom: 3,
  },
  /*
   * El número pegado a su unidad. A la izquierda quedaba un hueco entre la
   * cifra y el "€/h" que hacía dudar de si formaban parte de lo mismo.
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
  add: {
    marginTop: 10,
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
   * La tarifa de urgencia. Debajo y con su rótulo, no como un segundo campo
   * sin nombre: es otra decisión, y vacía significa que no atiende urgencias
   * de ese oficio.
   */
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 2,
  },
  urgencyLabel: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  urgencyInput: {
    width: 128,
    textAlign: 'right',
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
