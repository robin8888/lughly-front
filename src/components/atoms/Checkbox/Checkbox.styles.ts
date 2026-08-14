/**
 * Checkbox styles
 * Consentimientos del registro (RGPD) según MobileApp.dc.html
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

const BOX_SIZE = 18

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[2],
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    marginTop: 2,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral500,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.neutral100,
  },
  boxChecked: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  boxError: {
    borderColor: theme.colors.error,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  check: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: BOX_SIZE,
    color: theme.colors.cardBg,
  },
  label: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
  },
})
