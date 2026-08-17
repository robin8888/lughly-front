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
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
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
  when: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 8,
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
  phone: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 2,
  },
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
