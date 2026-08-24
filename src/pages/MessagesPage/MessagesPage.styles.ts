/**
 * MessagesPage styles
 * Una fila por hilo: avatar, con quién y de qué trabajo, el último mensaje.
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
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  /** Siempre a la vista, tenga o no hilo todavía */
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.accent100,
    borderWidth: 1,
    borderColor: theme.colors.accent300,
    marginBottom: 16,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.pill,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportText: {
    flex: 1,
    minWidth: 0,
  },
  supportTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  supportHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    opacity: 0.8,
    marginTop: 1,
  },
  chevron: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    opacity: 0.6,
  },

  empty: {
    paddingVertical: 24,
    paddingHorizontal: 4,
  },
  emptyText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.text,
    opacity: 0.6,
  },

  list: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  otherName: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  time: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
  },
  jobTitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 1,
  },
  lastMessage: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
})
