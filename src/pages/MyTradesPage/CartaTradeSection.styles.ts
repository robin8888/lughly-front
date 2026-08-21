/**
 * CartaTradeSection styles
 *
 * Un bloque con fondo propio, no solo una raya: dentro del bloque de un
 * oficio ya hay tarifas y descripción, y "Carta" necesita leerse como una
 * sección aparte y opcional, no como un campo más de la lista.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  block: {
    marginTop: 14,
    padding: 12,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.accent100,
  },
  sectionHead: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  sectionHint: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.45,
    color: theme.colors.text,
    opacity: 0.65,
    marginTop: 2,
  },
  loading: {
    marginVertical: 6,
  },
  error: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: 6,
  },
  retry: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.accent700,
  },
  notice: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.accent700,
    marginTop: 8,
  },
  save: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
})
