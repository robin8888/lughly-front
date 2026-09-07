/**
 * RecurringBookingPage styles
 * Los botones de día como los del horario del profesional —son el mismo gesto
 * visto desde los dos lados del contrato— y el repaso debajo, en tarjetas.
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
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
  intro: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: '#ffffff',
  },
  /* Los siete, en una fila que cabe: son la semana entera de un vistazo */
  weekdays: {
    flexDirection: 'row',
    gap: 6,
  },
  weekday: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    backgroundColor: theme.colors.field,
  },
  weekdayOn: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent,
  },
  weekdayText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },
  weekdayTextOn: {
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  check: {
    marginTop: 8,
  },
  summary: {
    marginTop: 16,
  },
  summaryTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  summaryBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 3,
  },
  summaryNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 10,
  },
  /**
   * Un día que no cabe. Con el contorno naranja de "esto espera por ti" y no
   * con el rojo de error: no ha fallado nada, hay algo que decidir.
   */
  missCard: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.pending,
  },
  missDay: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  missReason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 2,
  },
  missOffer: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    marginTop: 10,
    marginBottom: 6,
  },
  /* Sin nada que ofrecer: se dice y se pasa, sin botones que no llevan a nada */
  missSkipped: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    backgroundColor: theme.colors.field,
    marginBottom: 6,
  },
  optionOn: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  optionText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  optionTextOn: {
    fontFamily: theme.typography.fonts.bodyBold,
    color: theme.colors.accent700,
  },
  book: {
    marginTop: 16,
  },
  footnote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    textAlign: 'center',
    marginTop: 10,
  },
})
