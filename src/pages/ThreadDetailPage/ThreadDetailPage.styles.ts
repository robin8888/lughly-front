/**
 * ThreadDetailPage styles
 * Burbujas a los dos lados, y la composición fija abajo. Sin la píldora de
 * navegación encima —se esconde en esta ruta, ver `BottomTabBar`— así que el
 * hueco de abajo es todo para escribir.
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
    gap: 10,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  back: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  otherName: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  jobTitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    marginTop: 1,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
  },
  retry: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },

  content: {
    flexGrow: 1,
    padding: 16,
    gap: 8,
  },
  empty: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingTop: 40,
  },

  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: theme.radius.card,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceSoft,
    borderBottomLeftRadius: theme.radius.sm,
  },
  bubbleOwn: {
    backgroundColor: theme.colors.accent,
    borderBottomRightRadius: theme.radius.sm,
  },
  bubbleText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.4,
    color: theme.colors.text,
  },
  bubbleTextOwn: {
    color: '#ffffff',
  },
  bubbleTime: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSoft,
    alignSelf: 'flex-end',
  },
  bubbleTimeOwn: {
    color: 'rgba(255, 255, 255, 0.75)',
  },

  attachmentImage: {
    width: 180,
    height: 180,
    borderRadius: theme.radius.photo,
    backgroundColor: theme.colors.surface,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attachmentChipText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
  },
  attachmentChipTextOwn: {
    color: '#ffffff',
  },

  pendingAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.surfaceSoft,
  },
  pendingAttachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accent100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAttachmentLabel: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.7,
  },
  pendingAttachmentRemove: {
    padding: 6,
  },
  pendingAttachmentRemoveText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSoft,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  composerButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent100,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 38,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.field,
    borderWidth: 1,
    borderColor: theme.colors.fieldBorder,
    backgroundColor: theme.colors.field,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
})
