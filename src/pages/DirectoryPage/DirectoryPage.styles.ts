/**
 * DirectoryPage styles
 * Cabecera fija y lista, según MobileApp.dc.html (isProfesionales).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.bg,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
    marginTop: 2,
  },
  /** Alto del mapa del directorio: suficiente para leer la agrupación */
  map: {
    height: 420,
  },
  content: {
    padding: 16,
    gap: 10,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  searchWrapper: {
    position: 'relative',
    zIndex: 20,
  },
  suggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    zIndex: 20,
    marginTop: 4,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 9,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  suggestionPressed: {
    backgroundColor: theme.colors.surface,
  },
  suggestionLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.text,
  },
  suggestionHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11.5,
    color: theme.colors.text,
    opacity: 0.6,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.available,
    backgroundColor: 'rgba(63, 143, 90, 0.12)',
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.available,
  },
  chipText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 14,
    color: theme.colors.text,
  },
  chipTextActive: {
    color: '#2f6f45',
  },
  tradeFilter: {
    flex: 1,
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
    gap: 8,
  },
  stateText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
})
