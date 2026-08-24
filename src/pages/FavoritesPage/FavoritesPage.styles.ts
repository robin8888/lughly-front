/**
 * FavoritesPage styles
 * Cabecera con vuelta, como el resto de pantallas que se abren desde
 * Mi cuenta, y la misma lista/estado del directorio.
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
    // Para que el vacío pueda centrarse: sin esto mide lo que mide su contenido
    flexGrow: 1,
    padding: 16,
    gap: 10,
  },
  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13.5,
    color: theme.colors.text,
    opacity: 0.6,
  },
  list: {
    gap: 10,
  },
  state: {
    alignItems: 'center',
    paddingVertical: 48,
  },
})
