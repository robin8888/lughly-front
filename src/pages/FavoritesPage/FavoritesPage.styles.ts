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
  /*
    Cabecera en el azul oscuro de los formularios (`AuthShell`), con el título
    en blanco (25 Agosto 2026). Se hizo en las treinta pantallas a la vez: una
    cabecera clara aquí y otra oscura allá no es una variante, es un descuido.
  */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    backgroundColor: theme.colors.accent900,
  },
  back: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backIcon: {
    fontSize: theme.typography.sizes.h5,
    color: '#ffffff',
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: '#ffffff',
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
