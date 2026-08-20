/**
 * AbsencesPage styles
 * Arriba se marcan los días, debajo los que ya están marcados.
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
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  note: {
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

  /** Lo que ha pasado con lo último, dentro de la pantalla y no en una ventana */
  notice: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.4,
    marginTop: 14,
  },
  noticeOk: {
    color: theme.colors.accent700,
  },
  noticeError: {
    color: theme.colors.error,
  },

  form: {
    marginTop: 16,
  },
  /** Desde y hasta, uno al lado del otro: se leen como un rango */
  days: {
    flexDirection: 'row',
    gap: 10,
  },
  day: {
    flex: 1,
  },
  invalid: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginBottom: 10,
  },
  save: {
    marginTop: 8,
  },

  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 20,
  },

  list: {
    gap: 12,
    marginTop: 20,
  },
  absence: {
    gap: 0,
  },
  range: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  reason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 2,
  },
  /** Botón, como en el horario: se ve dónde termina lo que se pulsa */
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
})
