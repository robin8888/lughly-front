import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
    color: theme.colors.accent400,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 19,
    textTransform: 'uppercase',
    color: theme.colors.cardBg,
    marginBottom: 6,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 12,
  },
})
