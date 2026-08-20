/**
 * PublishPage styles
 * Formulario de publicar, según MobileApp.dc.html (`isPublicar`).
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
  kicker: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 0.66,
    color: theme.colors.accent700,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    gap: 4,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  /**
   * La emergencia, como botón: relleno en el rojo de urgencia y redondeado
   * como el resto. Antes era un recuadro con un velo del 7% que se leía como
   * un aviso más de la pantalla, y es lo único de aquí que lleva a otro sitio.
   */
  urgent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginTop: 14,
    marginBottom: 14,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.urgency,
  },
  urgentText: {
    flex: 1,
  },
  urgentTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  urgentBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  /** Blanco sobre el rojo: es la acción, y tiene que verse como tal */
  urgentButton: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: theme.radius.pill,
    backgroundColor: '#ffffff',
  },
  urgentButtonText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.urgency,
  },

  /** El texto que explica los dos modos, sobre el azul */
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
    opacity: 0.92,
    marginTop: 10,
  },
  noteStrong: {
    fontFamily: theme.typography.fonts.bodyBold,
    opacity: 1,
  },

  /** Las fotos, con presencia: son lo que decide si alguien puja */
  photosCard: {
    marginTop: 4,
    marginBottom: 14,
  },
  photosHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  photosTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  photosTag: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent100,
  },
  photosTagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  photosHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginBottom: 12,
  },
  /** Lo de la ubicación, al pie: importa, pero no es lo primero que se lee */
  photosPrivacy: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 10,
  },

  modes: {
    flexDirection: 'row',
    gap: 6,
  },
  mode: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  modeActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  modeText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  modeTextActive: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.accent700,
  },
  modeHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 12,
  },

  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  surcharges: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 12,
  },
  submit: {
    marginTop: 14,
  },
  draftNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 10,
  },
})
