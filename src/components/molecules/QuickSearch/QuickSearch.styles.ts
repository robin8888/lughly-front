/**
 * QuickSearch styles
 * HOME_MOBILE.md §2: input 13px padding 11/13; sugerencias en absoluto
 * con borde, radio 9 y sombra; nota a 10,5px blanco 60%.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginBottom: 10,
    zIndex: 20,
  },
  input: {
    fontSize: 14.5,
    paddingVertical: 11,
    paddingHorizontal: 13,
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
  label: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.text,
  },
  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: theme.colors.text,
    opacity: 0.6,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    /**
     * "Primero los cercanos que pueden ir ya." Va dentro del hero, que ahora
     * es una tarjeta clara: el blanco al 60% del diseño era para el hero
     * negro y aquí no se vería.
     */
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 7,
  },
})
