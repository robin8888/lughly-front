/**
 * useTrades
 * Los 18 oficios con su ilustración, en el orden del carrusel.
 *
 * Fuente local (`@/utils/trades`) y no `GET /v1/trades` a propósito: la lista
 * es fija, tiene que estar disponible al instante para pintar el carrusel y
 * funcionar sin conexión. El backend manda cuando haya que filtrar o cuando
 * cambien las etiquetas.
 */

import { useMemo } from 'react'
import { getTradeImage, TRADES, type Trade, type TradeSlug } from '@/utils/trades'

export interface TradeWithImage extends Trade {
  image: ReturnType<typeof getTradeImage>
}

export function useTrades(): TradeWithImage[] {
  return useMemo(
    () => TRADES.map((trade) => ({ ...trade, image: getTradeImage(trade.slug) })),
    [],
  )
}

export type { TradeSlug }
