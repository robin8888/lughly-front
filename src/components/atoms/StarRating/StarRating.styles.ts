/**
 * StarRating styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  starWrapper: {
    padding: 0,
  },
  star: {
    lineHeight: 18,
  },
  filled: {
    color: theme.colors.rating,
  },
  empty: {
    color: theme.colors.neutral300,
  },
  value: {
    fontSize: theme.typography.sizes.small,
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.text,
    marginLeft: 4,
  },
})
