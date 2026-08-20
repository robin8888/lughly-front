/**
 * TradeRatesField styles
 * Una fila por oficio: nombre, precio y la cruz de quitarlo.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /** Cada oficio: su fila de siempre y debajo la de urgencias */
  trade: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.hairline,
    paddingBottom: 10,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
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
})
