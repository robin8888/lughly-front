/**
 * AdminDisputesPage styles
 *
 * Una ficha por revisión, y dentro el expediente: quién dijo qué, las pruebas
 * con su fecha debajo, y el dinero en juego. El plazo arriba a la derecha,
 * porque es lo que ordena el trabajo del día.
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
    gap: theme.spacing[2],
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: theme.spacing[3],
    backgroundColor: theme.colors.accent900,
  },
  back: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: '#ffffff',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  jobTitle: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  /**
   * El plazo. En palabras y no solo en color: una vencida cuesta dinero de
   * alguien, y eso no puede depender de distinguir un rojo.
   */
  deadline: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.pendingText,
  },
  overdue: {
    color: theme.colors.unavailable,
  },
  parties: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 6,
  },
  who: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    marginTop: 10,
  },
  reason: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    fontStyle: 'italic',
    marginTop: 4,
  },
  hold: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.textSoft,
    marginTop: 8,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  moneyLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  money: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.cardText,
  },
  moneyDetail: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.textSoft,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  thumb: {
    width: 88,
  },
  thumbImage: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.photo,
    backgroundColor: theme.colors.cardDivider,
  },
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
  decideTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginTop: 16,
  },
  decideHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: theme.colors.textSoft,
    marginTop: 4,
    marginBottom: 10,
  },
  action: {
    marginTop: 10,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  splitInput: {
    flex: 1,
  },
  splitButton: {
    flex: 1,
  },
})
