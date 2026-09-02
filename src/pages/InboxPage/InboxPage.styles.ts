/**
 * InboxPage styles
 * Una tarjeta por encargo, con el plazo a la vista y las opciones de a quién
 * mandar al final.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  /* Lo que le falta para poder aceptar: encima de la lista y en aviso */
  blocked: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    gap: 6,
  },
  blockedTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  blockedBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.cardText,
  },
  blockedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  blockedAction: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.accent700,
  },
  blockedActionText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
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
    color: '#ffffff',
  },
  content: {
    /*
     * Para que un vacío pueda centrarse en la pantalla: sin esto, el
     * contenido de un scroll mide lo que mide su contenido y el
     * `flex: 1` del `EmptyState` se queda en cero.
     */
    flexGrow: 1,
    padding: 16,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  list: {
    gap: 12,
  },

  /**
   * El título, solo en su línea.
   *
   * Estaba en fila con las etiquetas y con dos —"Sin responder" y el tipo de
   * encargo— se quedaba en un tercio del ancho: "Cambiar toda la grifería del
   * piso" salía en cuatro líneas de tres palabras. El título es lo que
   * identifica el trabajo, así que se lee entero y lo demás va debajo.
   */
  jobTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 17,
    lineHeight: 17 * 1.3,
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 3,
  },
  requested: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 6,
  },
  strong: {
    fontFamily: theme.typography.fonts.bodyBold,
  },
  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 8,
  },
  /**
   * La tira de fotos del cliente, con las mismas medidas que la de la agenda:
   * es la misma foto del mismo encargo, y dos tamaños en dos pantallas
   * seguidas se leen como dos cosas.
   */
  photosBlock: {
    marginTop: 10,
  },
  photosLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  photo: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.photo,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceSoft,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  budget: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginTop: 6,
  },

  /** El plazo, separado: es lo único que corre en esta pantalla */
  deadline: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  deadlineLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginBottom: 3,
  },
  expired: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 4,
  },

  waiting: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },

  actions: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
    gap: 6,
  },
  actionsLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  /** El que pidió el cliente: es la opción sin fricción y se nota */
  primaryChoice: {
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: theme.colors.accent600,
    backgroundColor: theme.colors.accent100,
  },
  primaryChoiceText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  primaryChoiceHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    opacity: 0.8,
    marginTop: 1,
  },
  choice: {
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: theme.colors.cardDivider,
  },
  /**
   * Una opción que el servidor rechazaría. Se deja a la vista y no se esconde:
   * quien busca a alguien de su plantilla y no lo encuentra piensa que la app
   * falla, mientras que verlo apagado con el motivo se entiende y se arregla
   * —dando de alta el oficio—.
   */
  choiceBlocked: {
    opacity: 0.45,
  },
  choiceText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  choiceHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 1,
  },

  /** Las etiquetas, debajo del título y alineadas con él */
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
  },

  /**
   * Los que esperan respuesta, marcados en naranja para encontrarlos de un
   * vistazo. Naranja y no rojo: no hay nada roto ni vencido —el plazo sigue
   * corriendo— y una lista en rojo se lee como una lista de errores.
   *
   * El contorno y no el relleno: son tarjetas con mucho texto dentro, y en
   * color entero no se leería ninguna.
   *
   * El color no va solo: la etiqueta lo dice con palabras, porque quien no
   * distingue el naranja tiene que poder encontrarlos igual.
   */
  cardUnanswered: {
    borderWidth: 1.5,
    borderColor: theme.colors.pending,
  },
  unansweredTag: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.pendingSoft,
  },
  unansweredTagText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.pendingText,
  },
})
