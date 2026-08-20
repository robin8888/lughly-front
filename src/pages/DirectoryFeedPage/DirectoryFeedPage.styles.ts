/**
 * DirectoryFeedPage styles — PROPUESTA, 20 Agosto 2026.
 *
 * Sale todo de `@/theme/feed`. Del tema de la app solo se toman las fuentes,
 * que esta propuesta no cambia.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'
import { feed } from '@/theme/feed'

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: feed.colors.bg,
  },

  /**
   * Sin línea debajo y sin fondo propio. La cabecera actual lleva un borde
   * inferior que la separa del contenido como una ventanilla de mostrador;
   * aquí el título es el principio de la página, no una franja pegada encima.
   */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 56,
    paddingHorizontal: feed.space.inset,
    paddingBottom: feed.space.between,
  },
  back: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  backIcon: {
    fontSize: 22,
    color: feed.colors.text,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 26,
    color: feed.colors.text,
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 13,
    color: feed.colors.textSoft,
    marginTop: 1,
  },

  content: {
    paddingHorizontal: feed.space.inset,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },

  searchWrapper: {
    position: 'relative',
    zIndex: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.subtle,
  },
  searchIcon: {
    fontSize: 18,
    color: feed.colors.textSoft,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: theme.typography.fonts.body,
    fontSize: 15,
    color: feed.colors.text,
  },
  /** Flotan sobre el contenido, no lo empujan hacia abajo */
  suggestions: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    borderRadius: feed.radius.field,
    backgroundColor: feed.colors.bg,
    paddingVertical: 4,
    ...feed.shadow,
  },
  suggestion: {
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  suggestionPressed: {
    backgroundColor: feed.colors.subtle,
  },
  suggestionLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 15,
    color: feed.colors.text,
  },
  suggestionHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: feed.colors.textSoft,
    marginTop: 1,
  },

  chips: {
    flexDirection: 'row',
    gap: feed.space.gap,
    paddingVertical: feed.space.between,
    paddingRight: feed.space.inset,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.subtle,
  },
  chipActive: {
    backgroundColor: feed.colors.accent,
  },
  chipAvailable: {
    backgroundColor: feed.colors.availableSoft,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: feed.radius.pill,
    backgroundColor: feed.colors.textSoft,
  },
  chipDotActive: {
    backgroundColor: feed.colors.available,
  },
  chipText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 13,
    color: feed.colors.textSoft,
  },
  chipTextActive: {
    color: feed.colors.onAccent,
  },
  chipTextAvailable: {
    color: feed.colors.available,
  },

  state: {
    paddingVertical: 48,
    alignItems: 'center',
  },
})
