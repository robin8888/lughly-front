/**
 * AuthShell styles
 * Según MobileApp.dc.html (STACK: LOGIN / REGISTRO):
 * fondo accent-900, marca en blanco y tarjeta blueprint clara de 320px máx.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.accent900,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[8],
  },
  wrapper: {
    width: '100%',
    maxWidth: 320,
  },
  brand: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.caps,
    color: theme.colors.cardBg,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  card: {
    position: 'relative',
    padding: theme.spacing[6],
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    textTransform: 'uppercase',
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.72,
    marginBottom: theme.spacing[4],
  },
  centered: {
    textAlign: 'center',
  },
  error: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing[3],
  },
})
