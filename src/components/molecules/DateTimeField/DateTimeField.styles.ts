/**
 * DateTimeField styles
 *
 * El disparador copia a `.input` —mismo alto, mismo borde, mismas esquinas
 * cuadradas del tema industrial— para que en el formulario se lea como un
 * campo más y no como un botón suelto.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.none,
  },
  triggerError: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
  triggerDisabled: {
    opacity: 0.55,
  },
  value: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: 15.5,
    color: theme.colors.text,
  },
  placeholder: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 15,
  },

  /** Hoja inferior de iOS, donde vive el selector */
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 15, 0.45)',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  sheetTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cancel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  confirm: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
})
