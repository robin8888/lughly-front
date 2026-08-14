/**
 * ImagePickerField styles
 * Según MobileApp.dc.html (registro): recuadro punteado "Subir certificado"
 * y cuadro pequeño para la foto de perfil.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const AVATAR_SIZE = 64

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  avatarSlot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  box: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filled: {
    borderStyle: 'solid',
    borderColor: theme.colors.accent,
  },
  error: {
    borderColor: theme.colors.error,
    borderStyle: 'solid',
  },
  disabled: {
    opacity: 0.5,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  boxPreview: {
    width: '100%',
    height: 96,
  },
  placeholder: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.55,
    textAlign: 'center',
    paddingHorizontal: theme.spacing[2],
  },
  sideText: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  action: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent600,
  },
  actionDanger: {
    color: theme.colors.error,
  },
})
