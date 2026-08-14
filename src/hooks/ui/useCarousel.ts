/**
 * useCarousel
 * Mecánica del carrusel de oficios de la home.
 *
 * Especificación: HOME_MOBILE.md, sección 1. Los valores son literales del
 * diseño y no deben "ajustarse a ojo": el resultado visual depende de ellos.
 */

import { useCallback, useState } from 'react'

/** Desplazamiento horizontal por posición */
export const SLOT_WIDTH = 175
/** Lado de la imagen del oficio */
export const ITEM_SIZE = 300

export interface Slot {
  /** Solo se ven 5 tarjetas: la central y dos a cada lado */
  visible: boolean
  offset: number
  scale: number
  opacity: number
  zIndex: number
  /** Solo la central acepta toque */
  interactive: boolean
}

/**
 * Posición de la tarjeta `index` cuando la central es `current`.
 *
 * El carrusel es circular: la distancia se calcula por el camino más corto,
 * así que con 18 oficios el 17 está a una posición del 0, no a diecisiete.
 */
export function slotFor(index: number, current: number, total: number): Slot {
  let rel = index - current
  if (rel > total / 2) rel -= total
  if (rel < -total / 2) rel += total

  const abs = Math.abs(rel)

  return {
    visible: abs <= 2,
    offset: rel * SLOT_WIDTH,
    scale: rel === 0 ? 1 : abs === 1 ? 0.62 : 0.45,
    opacity: rel === 0 ? 1 : abs === 1 ? 0.55 : 0.2,
    zIndex: 10 - abs,
    interactive: rel === 0,
  }
}

/** Normaliza un índice cualquiera —incluso negativo— al rango [0, total). */
export function normalizeIndex(index: number, total: number): number {
  return ((index % total) + total) % total
}

export interface UseCarouselResult {
  current: number
  next: () => void
  prev: () => void
  /** Los puntos son 4 y el activo es siempre el slot 1: pulsar n mueve n-1 */
  goToSlot: (slot: number) => void
  slotFor: (index: number) => Slot
}

export function useCarousel(total: number): UseCarouselResult {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((value) => normalizeIndex(value + 1, total))
  }, [total])

  const prev = useCallback(() => {
    setCurrent((value) => normalizeIndex(value - 1, total))
  }, [total])

  const goToSlot = useCallback(
    (slot: number) => {
      setCurrent((value) => normalizeIndex(value + (slot - 1), total))
    },
    [total],
  )

  const slotForIndex = useCallback(
    (index: number) => slotFor(index, current, total),
    [current, total],
  )

  return { current, next, prev, goToSlot, slotFor: slotForIndex }
}
