/**
 * BookHoursPage styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    backgroundColor: theme.colors.accent900,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: '#ffffff',
  },
  content: {
    flexGrow: 1,
    padding: 16,
    gap: 14,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  /** La cara, el nombre y la tarifa, en una línea */
  whoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  /** El nombre y el oficio: lo que sobra entre la foto y el precio */
  whoText: {
    flex: 1,
    gap: 2,
  },
  proName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.cardText,
  },
  /** El precio, al otro extremo y en grande: es lo que se viene a comprobar */
  proRate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.accent700,
  },
  trade: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
  /*
    En naranja, el de "esto espera por ti": el importe queda retenido
    esperando una respuesta. No es un error —no hay nada roto— ni una nota al
    pie: es lo que va a pasar con su dinero.
  */
  whoNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.pendingText,
    marginTop: 8,
  },

  /* Los huecos del día: una rejilla de horas que se tocan */
  slots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    backgroundColor: theme.colors.field,
  },
  /*
    La hora elegida, en el azul de la app y con la letra en blanco. Antes era
    un fondo casi blanco con el borde azul: al lado de las otras nueve píldoras
    apenas se distinguía cuál estaba elegida.

    `accent700` y no `accent`: el blanco encima de este llega a 6,3:1, y encima
    del azul claro se queda en 2,6:1 —lo dice la propia ficha del color—.
  */
  slotChosen: {
    borderColor: theme.colors.accent700,
    backgroundColor: theme.colors.accent700,
  },
  slotText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  slotTextChosen: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: '#ffffff',
  },
  /*
    En rojo, y no en gris de aviso: es un "no" a lo que el cliente acaba de
    pedir, y lo que hay debajo son alternativas que solo se entienden si se ha
    leído primero que lo pedido no cabe.
  */
  slotsEmpty: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  /** Lo que sí tiene libre ese día, para poder pedir menos */
  ranges: {
    marginTop: 10,
    gap: 6,
  },
  rangeText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  suggest: {
    marginTop: 6,
  },
  /** Lo más pronto que puede, cuando el día pedido no le cabe */
  nextDay: {
    marginTop: 10,
    gap: 8,
  },
  nextDayLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },

  /* El desglose */
  /** Cuándo, arriba del todo: es lo que se está comprando */
  when: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lineLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
    flexShrink: 1,
    paddingRight: 12,
  },
  lineAmount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  lineFree: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.65,
  },
  minNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  totalLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  total: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.accent700,
  },
  terms: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 10,
  },
  quoting: {
    paddingVertical: 12,
    alignItems: 'center',
  },

  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  paymentCard: {
    gap: 4,
  },
  paymentTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  paymentBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginBottom: 8,
  },
  submit: {
    marginTop: 4,
  },
  missing: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    textAlign: 'center',
  },
})
