/**
 * AvailabilityPage styles
 * Una tarjeta por franja: día y las dos horas. Sin tarifa, que es lo que la
 * distingue del horario de urgencias.
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
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  intro: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },

  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 16,
  },

  list: {
    gap: 12,
    marginTop: 16,
  },
  window: {
    gap: 0,
  },
  /** Desde y hasta, uno al lado del otro: se leen como un rango */
  hours: {
    flexDirection: 'row',
    gap: 10,
  },
  hour: {
    flex: 1,
  },
  overnight: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  invalid: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginBottom: 10,
  },
  /** Botón, como en el horario de urgencias: se ve dónde se pulsa */
  remove: {
    marginTop: 10,
    paddingVertical: 9,
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
  preset: {
    marginTop: 10,
  },
  save: {
    marginTop: 10,
  },
})
