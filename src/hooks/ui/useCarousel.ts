/**
 * useCarousel
 * Mecánica del carrusel de oficios de la home.
 *
 * Especificación: HOME_MOBILE.md, sección 1. Los valores son literales del
 * diseño y no deben "ajustarse a ojo": el resultado visual depende de ellos.
 */

import { useCallback, useState } from 'react'

/**
 * Desplazamiento horizontal por posición.
 * Sube con `ITEM_SIZE` para mantener la proporción del diseño (0,583).
 */
export const SLOT_WIDTH = 201
/**
 * Lado de la caja de la imagen del oficio.
 *
 * El diseño dice 300. Se sube a 345 (+15%) porque las ilustraciones se
 * pidieron más grandes; el resto del aumento vino de recortar el margen
 * transparente que traían los PNG, que en algún oficio se comía el 37% del
 * archivo.
 *
 * No se puede subir mucho más sin rehacer el bloque entero: las
 * ilustraciones apaisadas (`otros`, 1,66 de ratio) se ajustan por el ancho y
 * ya rozan los velos de desenfoque de los lados.
 */
export const ITEM_SIZE = 345

export interface Slot {
  /**
   * Solo se ve la tarjeta central (14 Agosto 2026).
   *
   * El diseño enseñaba cinco —la central y dos a cada lado, difuminadas por
   * los velos—, pero al quitar los velos las laterales quedaban nítidas y
   * competían con la del medio. Las demás siguen montadas y animándose con
   * opacidad 0, así que el cambio de oficio sigue siendo un fundido: la que
   * sale se desvanece mientras se aparta y la que entra aparece al llegar.
   */
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
    visible: rel === 0,
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
