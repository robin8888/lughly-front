/**
 * AgendaPage styles
 * Una tarjeta por trabajo: cuándo, dónde, quién y qué hay que hacer.
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
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
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
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
    marginBottom: 10,
  },
  list: {
    gap: 12,
  },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  jobTitle: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 3,
  },
  /** El día, destacado: es lo que se viene a mirar */
  /**
   * El día, en su propia caja y destacado.
   *
   * Es una agenda: lo que se viene a mirar es cuándo toca, y como una línea
   * más de texto se perdía entre el oficio y la dirección.
   */
  whenBox: {
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.field,
    backgroundColor: theme.colors.accent100,
  },
  whenLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    opacity: 0.8,
  },
  when: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent900,
    marginTop: 2,
  },

  /**
   * Llamar, como botón. Era un texto azul, y en la pantalla que se abre
   * delante del portal lo que hace falta es algo que se toque sin apuntar.
   */
  call: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent700,
  },
  callText: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    color: '#ffffff',
  },

  /** La tira de fotos del cliente */
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

  block: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  blockLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginBottom: 2,
  },
  address: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  city: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  client: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  /** Llamar es la acción más usada de esta pantalla, así que se ve */
  noPhone: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.6,
    marginTop: 2,
  },

  description: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginTop: 10,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  amountLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    opacity: 0.7,
  },
  amount: {
    color: theme.colors.accent700,
  },
  noAmount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
})
