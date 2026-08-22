/**
 * AccountPage styles
 * Según MobileApp.dc.html (isCuenta).
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
    paddingBottom: 14,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: 22,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  content: {
    paddingHorizontal: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  identityCard: {
    padding: 14,
    marginBottom: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  /**
   * El anillo de disponibilidad. Sin saberlo va transparente y no invisible:
   * así la fila no se mueve cuando llega el dato.
   */
  avatarRing: {
    borderRadius: theme.radius.pill,
    borderWidth: 2,
    padding: 3,
  },
  avatarRingUnknown: {
    borderColor: 'transparent',
  },
  avatarRingAvailable: {
    borderColor: theme.colors.available,
  },
  avatarRingUnavailable: {
    borderColor: theme.colors.unavailable,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  email: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },
  photoAction: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent600,
    marginTop: 4,
  },
  roleTag: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
  },
  roleTagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  /** Falta el documento: no es un pendiente, es algo que le bloquea */
  /** El aviso y su botón, como un bloque: el botón es parte del aviso */
  notice: {
    marginTop: 10,
  },
  missing: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.urgency,
  },
  /*
   * Relleno y en el color de urgencia: es lo único de esta pantalla que
   * impide trabajar, así que tiene que pesar más que cualquier otra cosa.
   */
  missingAction: {
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.urgency,
    alignItems: 'center',
  },
  missingActionText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  pending: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.cardText,
    opacity: 0.8,
  },
  /** Perfilado: aquí no hay nada urgente que hacer, solo mirar si se quiere */
  pendingAction: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    alignItems: 'center',
  },
  pendingActionText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  modes: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  mode: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  modeActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent100,
  },
  modeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },
  modeTextActive: {
    color: theme.colors.accent700,
    opacity: 1,
  },
  links: {
    gap: 2,
  },
  group: {
    marginBottom: 18,
  },
  /*
   * El rótulo del grupo, en pequeño y en mayúsculas como el resto de rótulos
   * de la app: tiene que separar sin competir con los accesos, que son lo que
   * se va a pulsar.
   */
  groupTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.5,
    color: theme.colors.text,
    opacity: 0.55,
    marginBottom: 2,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  /** El icono y la etiqueta, a la izquierda; `flex: 1` para que el hueco de la derecha no se lo coma */
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  linkLabel: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  linkDisabled: {
    opacity: 0.45,
  },
  chevron: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.4,
  },
  linkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  note: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
  },
  /** Sin esto no puede trabajar */
  note_blocking: {
    color: theme.colors.urgency,
  },
  /** Puede trabajar, pero le iría mejor con ello. No es un error suyo. */
  note_optional: {
    color: theme.colors.text,
    opacity: 0.55,
  },
  /** Hecho y esperando a otro: ni le falta ni tiene nada que hacer */
  note_pending: {
    color: theme.colors.accent700,
  },
  soon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.45,
  },
  logout: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
})
