/**
 * HireCartaPage styles
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
    flexGrow: 1,
    padding: 16,
    gap: 14,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  proName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 8,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lineLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
  lineAmount: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },
  totalLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  total: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.accent700,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.65,
    marginTop: 10,
  },
  formError: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  paymentCard: {
    gap: 4,
  },
  paymentTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
  },
  paymentBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    opacity: 0.85,
    marginBottom: 8,
  },
  submit: {
    marginTop: 4,
  },
})
