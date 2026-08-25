/**
 * ScreenShell styles
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.darkBg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.darkDivider,
    gap: theme.spacing[2],
  },
  backButton: {
    padding: theme.spacing[2],
  },
  backIcon: {
    fontSize: 27,
    color: theme.colors.darkText,
  },
  title: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.fonts.heading,
    color: theme.colors.darkText,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    // La barra inferior flota por encima del contenido: sin este aire
    // taparía el último elemento de la pantalla.
    paddingBottom: 88,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  skeletonSpacer: {
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: theme.spacing[3],
  },
  errorTitle: {
    fontSize: theme.typography.sizes.h4,
    fontFamily: theme.typography.fonts.heading,
    color: theme.colors.error,
    marginBottom: theme.spacing[2],
  },
  errorMessage: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.darkText,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: theme.spacing[4],
  },
  retryButton: {
    marginTop: theme.spacing[2],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing[3],
  },
  emptyMessage: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.fonts.body,
    color: theme.colors.darkText,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: theme.spacing[4],
  },
  emptyButton: {
    marginTop: theme.spacing[2],
  },
})
