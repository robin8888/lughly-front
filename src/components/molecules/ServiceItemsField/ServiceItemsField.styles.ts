/**
 * ServiceItemsField styles
 * Una fila por servicio: nombre, precio y quitar. Al final, el formulario
 * corto para añadir uno nuevo.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nameInput: {
    flex: 1,
  },
  priceInput: {
    width: 90,
    textAlign: 'right',
  },
  remove: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIcon: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.h5,
    color: theme.colors.text,
    opacity: 0.55,
  },
  empty: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.7,
    marginBottom: 8,
  },
  add: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  addLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    marginBottom: 6,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
})
