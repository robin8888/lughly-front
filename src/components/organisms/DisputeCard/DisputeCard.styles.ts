/**
 * DisputeCard styles
 * Un expediente: quién dijo qué, cuándo, y en qué quedó. Las pruebas en tira,
 * cada una con su fecha debajo — sin fecha, una foto no es una prueba.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  /**
   * El plazo, en etiqueta. El color acompaña y no informa solo: uno de cada
   * doce hombres no distingue el verde del rojo.
   */
  badge: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
  },
  open: {
    color: theme.colors.pendingText,
  },
  done: {
    color: theme.colors.availableText,
  },
  who: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 10,
  },
  /* Las palabras de quien la abrió, entrecomilladas: son suyas, no nuestras */
  reason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    fontStyle: 'italic',
    marginTop: 4,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    marginTop: 10,
  },
  /* Lo que esto es y lo que no. Se lee, no se esconde */
  rights: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  decision: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    marginTop: 12,
  },
  evidence: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  evidenceTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  thumb: {
    width: 92,
  },
  thumbImage: {
    width: 92,
    height: 92,
    borderRadius: theme.radius.photo,
    backgroundColor: theme.colors.cardDivider,
  },
  /* De quién es y de cuándo, debajo de cada una: es lo que la hace prueba */
  stamp: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 10,
    color: theme.colors.cardText,
    marginTop: 4,
  },
  stampDate: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 10,
    color: theme.colors.textSoft,
  },
})
