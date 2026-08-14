/**
 * ProCard styles
 * Tarifa en accent700 y estrella dorada #d4a13a (HOME_MOBILE.md §3 y §5).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  identity: {
    flexShrink: 1,
  },
  name: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 15.5,
    textTransform: 'uppercase',
    color: theme.colors.cardText,
  },
  meta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 2,
  },
  numbers: {
    alignItems: 'flex-end',
  },
  rate: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 14.5,
    color: theme.colors.accent700,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  star: {
    fontSize: 13.5,
    color: theme.colors.rating,
  },
  rating: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: theme.colors.cardText,
  },
  bio: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.cardText,
    opacity: 0.8,
  },
})
