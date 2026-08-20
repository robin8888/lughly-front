/**
 * HomePagePro styles
 *
 * Fondo claro, como el directorio y la ficha del profesional. La home del
 * cliente es la excepción oscura del diseño (#04070f, HOME_MOBILE.md); esta
 * pantalla no la sigue porque su contenido son tarjetas de datos, y una
 * rejilla de tarjetas claras sobre negro pesa demasiado.
 *
 * Al ir sobre claro, los rótulos de sección van en `accent700` —el tono que
 * pide el diseño— y no en `accent400`, que es el apaño para leerse sobre el
 * negro de la otra home.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingHorizontal: 12,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  state: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  stateCard: {
    marginTop: 16,
  },
  stateTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 4,
  },
  stateBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.8,
  },

  retry: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },

  /**
   * Los encargos van en el color de urgencia, no en el de la app: son lo
   * único de esta pantalla con un plazo corriendo, y tienen que distinguirse
   * del botón de trabajadores, que puede esperar.
   */
  inbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    marginTop: 12,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
    backgroundColor: 'rgba(163, 69, 58, 0.08)',
  },
  inboxTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
  inboxBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 3,
  },
  inboxArrow: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.urgency,
  },

  /**
   * Trabajadores: un botón de verdad, azul y relleno.
   *
   * Antes era un recuadro con borde y fondo casi blanco (`accent100`), que se
   * leía como un aviso más que como algo que se pulsa. Ahora lleva el azul de
   * la app, las esquinas redondeadas del átomo `Button` y el texto en blanco.
   *
   * `accent700` y no `accent`: el blanco sobre el azul de marca se queda en
   * 4,15:1 y aquí el texto va a 16 y a 13,5 px, así que WCAG pide 4,5:1. Con
   * el 700 sube a 6,48:1. Es además el mismo azul que rellena los botones
   * primarios desde que se corrigió el contraste, así que ahora pegan.
   */
  employees: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    marginTop: 12,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.accent700,
  },
  /** Un escalón más de la rampa al pulsarlo, como hace `Button` */
  employeesPressed: {
    backgroundColor: theme.colors.accent800,
  },
  employeesText: {
    flex: 1,
  },
  employeesTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  employeesBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: '#ffffff',
    // Blanco al 80% sobre el 700 da 4,83:1: se apaga sin dejar de cumplir
    opacity: 0.8,
    marginTop: 3,
  },
  employeesArrow: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    color: theme.colors.accent700,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },

  availability: {
    marginTop: 6,
    marginBottom: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  availabilityText: {
    flex: 1,
  },
  availabilityTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 3,
  },
  availabilityBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
  },
  availabilityNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },

  reviews: {
    paddingHorizontal: 4,
  },
  pendingCard: {
    marginTop: 4,
  },
})
