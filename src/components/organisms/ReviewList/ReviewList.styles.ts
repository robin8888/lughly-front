/**
 * ReviewList styles
 * Sección "Valoraciones" de la ficha (Perfil.dc.html).
 */

import { StyleSheet } from 'react-native'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.text,
    marginBottom: 10,
  },

  state: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  stateCard: {
    marginBottom: 0,
  },
  stateTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.cardText,
    marginBottom: 4,
  },
  stateBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.55,
    color: theme.colors.cardText,
    opacity: 0.8,
  },
  retry: {
    marginTop: 10,
  },

  breakdown: {
    marginBottom: 12,
  },
  breakdownTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    letterSpacing: 0.4,
    color: theme.colors.cardText,
    opacity: 0.7,
    marginBottom: 8,
  },
  criterion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 3,
  },
  criterionLabel: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
  },
  criterionScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  criterionValue: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.cardText,
    // Ancho fijo: sin esto las estrellas bailan al cambiar de "4.0" a "4.75"
    width: 22,
    textAlign: 'right',
  },
  recommend: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    lineHeight: theme.typography.sizes.tiny * 1.5,
    color: theme.colors.cardText,
    opacity: 0.8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.cardDivider,
  },

  count: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.text,
    opacity: 0.65,
    marginBottom: 8,
  },
  list: {
    gap: 12,
  },
  more: {
    marginTop: 12,
  },
})
