/**
 * UrgencyPage styles
 * Cabecera en rojo de urgencia, según MobileApp.dc.html (`isUrgencia`).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  /*
    Cabecera en el azul oscuro de los formularios (`AuthShell`), con el título
    en blanco (25 Agosto 2026). Se hizo en las treinta pantallas a la vez: una
    cabecera clara aquí y otra oscura allá no es una variante, es un descuido.
  */
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
    // El rojo del diseño: esta pantalla no se abre por gusto
    color: '#ffffff',
  },
  content: {
    /*
     * Arriba y no centrado, aunque sobre sitio: aquí se escribe, y al abrirse
     * el teclado el hueco visible se encoge. Con el contenido centrado, los
     * campos dan un salto justo mientras se teclea.
     */
    flexGrow: 1,
    padding: 16,
  },
  /** La tarjeta azul del texto que explica */
  introCard: {
    marginBottom: 14,
  },
  intro: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.55,
    color: '#ffffff',
  },
  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 10,
  },
  textarea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  /** La salida de quien no sabe su dirección: con forma de botón */
  share: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  shareLink: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  shareNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 5,
  },
  shareError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.error,
    marginTop: 5,
  },
  alternative: {
    marginTop: 10,
    marginBottom: 4,
  },
  /**
   * El aviso del recargo. Redondeado y con el rojo de urgencia de verdad, no
   * un velo del 7% sobre un recuadro cuadrado: es lo último que se lee antes
   * de avisar a media ciudad, y tiene que verse.
   */
  surcharge: {
    marginTop: 16,
    padding: 14,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
    backgroundColor: 'rgba(163, 69, 58, 0.06)',
  },
  surchargeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  surchargeDot: {
    width: 9,
    height: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.urgency,
  },
  surchargeTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },

  /** Las fotos, con presencia: en una urgencia se decide con lo que se ve */
  photosCard: {
    marginTop: 4,
    marginBottom: 4,
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
  surchargeBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.text,
    opacity: 0.85,
  },
  submit: {
    marginTop: 14,
    backgroundColor: theme.colors.urgency,
    borderColor: theme.colors.urgency,
  },
  /*
    Lo que falta para poder seguir, justo encima del botón apagado. En el
    naranja de "te falta algo" y no en el rojo de error: no ha hecho nada mal,
    todavía no ha terminado.
  */
  missing: {
    backgroundColor: theme.colors.pendingSoft,
    borderRadius: theme.radius.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    gap: 4,
  },
  missingItem: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.pendingText,
  },
})
