/**
 * HowItWorksPage styles
 *
 * Cabecera propia y fondo claro, como el resto de pantallas de pila —Mis
 * fotos, Encargos, Mis oficios—. No usa `ScreenShell` a propósito: ese
 * envoltorio es oscuro y dejaría esta como la única pantalla negra a la que
 * se llega desde una home clara.
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
    gap: theme.spacing[2],
    paddingHorizontal: 12,
    paddingVertical: theme.spacing[3],
  },
  back: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: theme.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  content: {
    // La barra inferior flota por encima del contenido
    paddingBottom: 96,
  },
  intro: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  introTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 29,
    lineHeight: 32.5,
    textTransform: 'uppercase',
    color: theme.colors.accent700,
    marginBottom: 8,
  },
  introBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.body,
    color: theme.colors.text,
    opacity: 0.8,
  },
})
