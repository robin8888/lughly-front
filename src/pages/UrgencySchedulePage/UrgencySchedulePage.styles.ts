/**
 * UrgencySchedulePage styles
 * Una tarjeta por franja: día, horas, tarifa y su botón de quitar.
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

  /*
   * La tarjeta de arriba es lo que explica para qué sirve la pantalla, así que
   * va en el tamaño de texto normal y no en el pequeño de las notas al pie.
   */
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  rateNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },

  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
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
  /**
   * Botón y no un enlace suelto: es la única acción destructiva de la tarjeta
   * y con la forma de las demás se ve dónde termina el área que se pulsa.
   * Va perfilado en vez de relleno para que no compita con guardar.
   */
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
  save: {
    marginTop: 10,
  },
})
