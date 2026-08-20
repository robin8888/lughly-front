/**
 * EmployeesPage styles
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
    borderBottomColor: theme.colors.divider,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  employerCard: {
    marginBottom: 14,
  },
  employerName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h6,
    color: theme.colors.cardText,
  },
  employerMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 2,
  },
  employerTrades: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 8,
  },

  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
    marginBottom: 10,
  },
  list: {
    gap: 10,
  },
  employeeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  employeeName: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  employeeMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 3,
  },
  employeeContact: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.55,
    marginTop: 2,
  },
  pending: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.accent700,
    marginTop: 8,
  },
  unverified: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 6,
  },

  /**
   * Los cuatro ajustes que la empresa le lleva, con forma de botón.
   *
   * Eran cuatro líneas de texto seguidas y no se leían como cuatro cosas que se
   * pueden tocar, sino como un párrafo con flechas. Con forma de botón se ve
   * dónde empieza y termina cada uno, y se acierta con el pulgar.
   *
   * Perfilados y no rellenos: son cuatro, y cuatro botones sólidos seguidos
   * pesan más que la ficha del trabajador, que es lo que se ha venido a mirar.
   */
  settings: {
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  setting: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
  },
  settingText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    textAlign: 'center',
  },

  /**
   * La baja va aparte y abajo del todo, separada de los ajustes: es la única
   * que no se deshace, y no debe quedar al lado de las que sí.
   */
  remove: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
    alignItems: 'center',
  },
  removeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },

  add: {
    marginTop: 16,
  },
  form: {
    marginTop: 16,
  },
  formTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.cardText,
  },
  formIntro: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 4,
    marginBottom: 10,
  },
  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 8,
  },
  responsibility: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 4,
    marginBottom: 12,
  },
  cancel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 10,
  },
})
