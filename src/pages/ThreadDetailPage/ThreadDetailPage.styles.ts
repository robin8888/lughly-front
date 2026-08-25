/**
 * ThreadDetailPage styles
 * Burbujas a los dos lados, y la composición fija abajo. Sin la píldora de
 * navegación encima —se esconde en esta ruta, ver `BottomTabBar`— así que el
 * hueco de abajo es todo para escribir.
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
    gap: 10,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    backgroundColor: theme.colors.accent900,
  },
  back: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  otherName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  jobTitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent300,
    marginTop: 1,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },
  retry: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },

  content: {
    flexGrow: 1,
    padding: 16,
    gap: 8,
  },
  empty: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 40,
  },

  daySeparator: {
    alignItems: 'center',
    marginVertical: 4,
  },
  daySeparatorPill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
  },
  daySeparatorText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },

  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: theme.radius.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceSoft,
    borderBottomLeftRadius: theme.radius.sm,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.accent,
    borderBottomRightRadius: theme.radius.sm,
  },
  /*
   * La coletilla: un SVG con una curva, no el truco de bordes CSS de antes
   * —ese dependía de cómo cada motor recorta las esquinas de un borde a
   * medias, y salió mal—. Con un `Path` las coordenadas son las que se
   * escriben, sin ambigüedad, y de paso sale la curva de WhatsApp en vez
   * de un triángulo recto.
   */
  bubbleTail: {
    position: 'absolute',
    bottom: 0,
  },
  bubbleTailOther: {
    left: -8,
  },
  bubbleTailOwn: {
    right: -8,
  },
  bubbleText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.4,
    color: theme.colors.text,
  },
  bubbleTextOwn: {
    color: '#ffffff',
  },
  bubbleTime: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    alignSelf: 'flex-end',
  },
  bubbleTimeOwn: {
    color: 'rgba(255, 255, 255, 0.75)',
  },

  attachmentImage: {
    width: 180,
    height: 180,
    borderRadius: theme.radius.photo,
    backgroundColor: theme.colors.surface,
  },
  /*
   * La tarjeta de documento/vídeo: mismo peso visual que la miniatura de una
   * foto, no una fila de texto suelta que pasaba desapercibida.
   */
  attachmentDoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 168,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
  },
  attachmentDocOther: {
    backgroundColor: theme.colors.surface,
  },
  /* Sobre el azul de la burbuja propia, un blanco translúcido en vez del gris de siempre */
  attachmentDocOwn: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  attachmentDocIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentDocIconOther: {
    backgroundColor: theme.colors.accent100,
  },
  attachmentDocIconOwn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  attachmentDocLabels: {
    flex: 1,
    minWidth: 0,
  },
  attachmentDocText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  attachmentDocTextOwn: {
    color: '#ffffff',
  },
  /** El nombre de verdad, debajo del tipo — más pequeño, es el detalle */
  attachmentDocName: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    opacity: 0.75,
    marginTop: 1,
  },
  attachmentDocNameOwn: {
    color: '#ffffff',
    opacity: 0.8,
  },

  pendingAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.surfaceSoft,
  },
  pendingAttachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAttachmentLabels: {
    flex: 1,
    minWidth: 0,
  },
  pendingAttachmentLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.7,
  },
  /** El nombre de verdad, debajo del tipo */
  pendingAttachmentName: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    marginTop: 1,
  },
  pendingAttachmentRemove: {
    padding: 6,
  },
  pendingAttachmentRemoveText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  composerButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 38,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.field,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    backgroundColor: theme.colors.field,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
})
