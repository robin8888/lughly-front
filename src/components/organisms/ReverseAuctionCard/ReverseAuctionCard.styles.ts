/**
 * ReverseAuctionCard styles
 *
 * Tarjeta clara. El diseño la pone oscura porque la home era negra y
 * alternaba tonos para separar bloques; con la home ya en claro, una tarjeta
 * negra a media pantalla se lee como un bloque pegado.
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12.5,
    letterSpacing: 0.66,
    color: theme.colors.accent700,
    marginBottom: 6,
  },
  title: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 19,
    color: theme.colors.cardText,
    marginBottom: 6,
  },
  body: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 14,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginBottom: 12,
  },
})
