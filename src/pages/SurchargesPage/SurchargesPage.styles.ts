/**
 * SurchargesPage styles
 * Arriba lo que dice la ley, debajo los tres campos.
 *
 * La nota legal va en su propia tarjeta y no como texto suelto a propósito:
 * es lo que hace que cambiar un número sea una decisión y no un descuido.
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
     * Si el contenido no llena la pantalla, se centra en vez de quedarse
     * pegado arriba con un desierto debajo. Cuando sí la llena, `flexGrow`
     * deja el contenedor a la altura del contenido y el centrado no hace
     * nada: por eso no hay que decidir a mano cuál es corta y cuál no.
     */
    flexGrow: 1,
    justifyContent: 'center',
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

  legal: {
    marginTop: 12,
  },
  legalTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 10,
  },
  legalLine: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginBottom: 8,
  },
  legalTerm: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    opacity: 1,
  },
  /** La distinción entre lo que se cobra y lo que se paga: separada y visible */
  legalNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 4,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
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
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 14,
  },
  save: {
    marginTop: 8,
  },
})
