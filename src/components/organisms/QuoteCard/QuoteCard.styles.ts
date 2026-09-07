/**
 * QuoteCard styles
 * Un presupuesto se lee como una factura: columna de conceptos, columna de
 * importes, y el total separado por una línea.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  version: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  /**
   * El estado, en etiqueta y con palabras. El color acompaña, no informa solo:
   * uno de cada doce hombres no distingue el verde del rojo.
   */
  status: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
  },
  open: {
    color: theme.colors.pendingText,
  },
  done: {
    color: theme.colors.availableText,
  },
  closed: {
    color: theme.colors.textSoft,
  },
  lines: {
    marginTop: 12,
    gap: 8,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  /* Que el concepto largo parta y no empuje al importe fuera de la tarjeta */
  lineText: {
    flex: 1,
  },
  concept: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  detail: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.textSoft,
    marginTop: 1,
  },
  amount: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  subtotalLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  subtotal: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  /* El descuento en verde: es lo único de la columna que resta */
  credit: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.availableText,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  totalLabel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  total: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.cardText,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 10,
  },
  noteExpired: {
    color: theme.colors.unavailable,
  },
  /**
   * El motivo del rechazo, entrecomillado y en cursiva: son las palabras del
   * cliente, no un rótulo de la app, y confundirlos haría que un reproche
   * pareciera nuestro.
   */
  reason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    fontStyle: 'italic',
    color: theme.colors.cardText,
    marginTop: 10,
  },
})
