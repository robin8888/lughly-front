/**
 * CoveragePage styles
 * Buscador de dirección, radio y mapa, en ese orden: se elige el punto, se
 * elige cuánto se abarca, y el mapa enseña el resultado de las dos cosas.
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
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h5,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
  content: {
    padding: 16,
    // La barra inferior flota por encima
    paddingBottom: 96,
  },
  state: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  intro: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.5,
    color: theme.colors.cardText,
    opacity: 0.85,
  },
  note: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    lineHeight: theme.typography.sizes.small * 1.45,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },

  field: {
    marginTop: 16,
  },
  /** Buscar y ubicación actual, a la par: son dos formas de lo mismo */
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  searchButton: {
    flex: 1,
  },

  matches: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  match: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  matchLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text,
  },

  hint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 10,
  },

  /** La instrucción va encima del mapa, que es donde se está mirando */
  mapHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.75,
    marginTop: 16,
    marginBottom: -8,
  },
  /** Por qué no se puede guardar todavía, justo encima del botón */
  blocked: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.urgency,
    marginTop: 14,
  },

  /** Alto fijo: el mapa no decide cuánto ocupa, lo decide la pantalla */
  map: {
    height: 260,
    marginTop: 16,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
  },

  save: {
    marginTop: 16,
  },
})
