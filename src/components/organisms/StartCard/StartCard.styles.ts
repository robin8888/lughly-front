/**
 * StartCard styles
 *
 * Tarjeta clara, por el mismo motivo que `ReverseAuctionCard`: la home dejó
 * de ser negra y la alternancia de tonos del diseño ya no aplica.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: theme.colors.accent700,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 19,
    textTransform: 'uppercase',
    color: theme.colors.cardText,
    marginBottom: 12,
  },
})
