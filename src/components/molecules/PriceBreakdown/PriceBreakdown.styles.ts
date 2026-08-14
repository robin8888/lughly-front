/**
 * PriceBreakdown styles
 * Caja con borde y línea de separación antes del total (isPerfil).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 9,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    opacity: 0.7,
    color: theme.colors.text,
    marginBottom: 8,
  },
  lines: {
    gap: 6,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  muted: {
    opacity: 0.7,
  },
  amount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  plus: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
  baseAmount: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  surchargeAmount: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.urgency,
  },
  mutedAmount: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 7,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  totalLabel: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h6,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  totalAmount: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    opacity: 0.65,
    color: theme.colors.text,
    marginTop: 8,
  },
})
