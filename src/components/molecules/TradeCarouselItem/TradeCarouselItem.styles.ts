/**
 * TradeCarouselItem styles
 * Valores literales de HOME_MOBILE.md §1 ("Estilo de cada tarjeta").
 */

import { StyleSheet } from 'react-native'
import { ITEM_SIZE } from '@/hooks/ui/useCarousel'
import { theme } from '@/theme'

export const styles = StyleSheet.create({
  item: {
    position: 'absolute',
    left: '50%',
    top: 40,
    width: ITEM_SIZE,
    alignItems: 'center',
  },
  pressable: {
    alignItems: 'center',
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  label: {
    fontFamily: theme.typography.fonts.bodyBold,
    fontSize: 17,
    lineHeight: 20,
    marginTop: 8,
    color: theme.colors.cardBg,
    textAlign: 'center',
  },
})
