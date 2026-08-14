/**
 * Picker styles
 * El disparador replica .input de styles.css; la hoja de opciones
 * usa la tarjeta clara sobre velo oscuro.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  trigger: {
    width: '100%',
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    // Es un `.input`, y va cuadrado (styles.css, línea 291)
    borderRadius: theme.radius.none,
  },
  triggerError: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  value: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.button,
    color: theme.colors.text,
  },
  placeholder: {
    opacity: 0.5,
  },
  chevron: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.6,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 7, 15, 0.55)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: theme.radius.card,
    borderTopRightRadius: theme.radius.card,
    paddingBottom: theme.spacing[8],
  },
  sheetHeader: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  sheetTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  option: {
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  optionPressed: {
    backgroundColor: theme.colors.surface,
  },
  optionLabel: {
    flexShrink: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  optionSelected: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    color: theme.colors.accent700,
  },
  check: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.accent700,
  },
})
