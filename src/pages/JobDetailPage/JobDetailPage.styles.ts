/**
 * JobDetailPage styles
 * El estado arriba y en azul, y debajo las tarjetas de siempre.
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
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  content: {
    padding: 16,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  statusHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 6,
  },
  statusLabel: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: '#ffffff',
  },
  typeLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
    opacity: 0.85,
  },
  /** La frase que dice qué pasa. Es lo que se viene a leer */
  happening: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: '#ffffff',
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
  },
  deadlineLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
    opacity: 0.9,
  },

  /** La tira de fotos de cómo ha quedado */
  photos: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
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
  /**
   * El reparo puesto, para el cliente: lo que él mismo dijo que faltaba.
   *
   * Se le enseña porque si no, un trabajo que se quedó esperando no dice por
   * qué —y a los tres días ya no se acuerda de lo que escribió—.
   */
  hold: {
    borderRadius: theme.radius.card,
    backgroundColor: 'rgba(209, 84, 74, 0.10)',
    borderWidth: 1,
    borderColor: theme.colors.unavailable,
    padding: 12,
    marginTop: 12,
    gap: 4,
  },
  holdTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
  holdReason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.4,
    color: theme.colors.cardText,
  },

  block: {
    marginTop: 14,
  },
  blockTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginBottom: 6,
  },
  /** La cara y el nombre, en fila */
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proText: {
    flex: 1,
  },
  proName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 17,
    color: theme.colors.cardText,
  },
  proWorker: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 2,
  },
  /**
   * El plazo de revisión, a la derecha de la cara y del nombre.
   *
   * En grande porque es lo que decide si hay prisa, y con rótulo arriba y
   * consecuencia abajo porque una cuenta atrás a secas no dice de qué.
   */
  confirmBox: {
    alignItems: 'flex-end',
    maxWidth: 132,
  },
  confirmLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  confirmValue: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 22,
    color: theme.colors.accent700,
    marginTop: 2,
  },
  confirmHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.35,
    color: theme.colors.cardText,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 2,
  },

  /**
   * «Falta algo», en rojo y relleno: es la respuesta que para el dinero, y
   * tiene que verse tanto como la que lo suelta.
   *
   * Quien pinta el fondo a mano tiene que decir también cómo se ve hundido:
   * sin `holdButtonPressed`, este `backgroundColor` tapa el color de pulsado
   * de la variante y el botón se queda sin respuesta al tacto.
   */
  holdButton: {
    backgroundColor: theme.colors.urgency,
  },
  holdButtonPressed: {
    backgroundColor: '#8d3b31',
  },
  holdButtonText: {
    color: '#ffffff',
  },

  proRating: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.75,
    marginTop: 4,
  },
  /** Seleccionable: es para copiarlo o marcarlo */
  proPhone: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 8,
  },
  noPhone: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 8,
  },

  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
  },
  facts: {
    marginTop: 12,
    gap: 8,
  },
  /* Los botones del presupuesto: separados de la tarjeta que los explica */
  quoteAction: {
    marginTop: 16,
  },
  fact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  factLabel: {
    width: 96,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.65,
  },
  factValue: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },

  /** Lo contratado de la carta, copiado al pedirlo */
  serviceLines: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
    gap: 4,
  },
  serviceLine: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },

  /** El trabajo que no ha empezado a su hora: lo primero de la pantalla */
  late: {
    marginBottom: 4,
  },
  lateTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.cardText,
  },
  lateText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginTop: 8,
  },
  lateAction: {
    marginTop: 12,
  },
  lateForm: {
    marginTop: 12,
    gap: 10,
  },
  /** Proponer, en enlace y no en botón: aceptar es lo que se viene a hacer */
  lateLink: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  lateLinkText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent,
  },

  /** La frase que resume el contrato fijo: qué días y a qué hora */
  recurrenceLine: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.cardText,
  },
  recurrenceNote: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 4,
  },
  sessions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  /** Una sesión: cuándo a la izquierda, lo que se puede hacer a la derecha */
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
  },
  sessionWhen: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    flexShrink: 1,
  },
  /** Una cancelada se queda a la vista, apagada: el hueco es la información */
  sessionGone: {
    color: theme.colors.textSoft,
    textDecorationLine: 'line-through',
  },
  sessionAmount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  sessionDrop: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.urgency,
  },
  sessionTag: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },

  bids: {
    marginTop: 16,
  },

  /** La salida: en contorno y al final, que no es lo que se viene a hacer */
  cancel: {
    alignSelf: 'center',
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.urgency,
  },
  cancelText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.urgency,
  },
  /* Lo que hay que hacer con el material, o lo que se hizo con él */
  materialsHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    marginBottom: 12,
  },
  materialsMissing: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 8,
  },
  /* El plazo del reparo, con lo que pasa al acabarse */
  holdDeadline: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 8,
  },
  evidenceAdd: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  evidenceAddTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  evidenceAddHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 4,
    marginBottom: 10,
  },
})
