/**
 * useTabBarClearance
 * Cuánto aire hace falta al final de una pantalla para que su contenido —y,
 * sobre todo, un botón al final de un formulario— no se pegue a la píldora
 * flotante de abajo (`BottomTabBar`).
 *
 * La píldora ocupa, de abajo arriba: `12` de hueco fijo hasta el borde de la
 * pantalla, `insets.bottom` (el borde de gestos o la isla del móvil, que la
 * sube) y unos `52` de alto ella misma. `64 + insets.bottom` es por tanto el
 * MÍNIMO estricto: con menos, el contenido entra por debajo de la píldora.
 * Ese mínimo no se puede recortar —es justo lo que evita el solape en un
 * móvil con inset—, así que solo el aire de sobra encima de él es ajustable.
 *
 * `TAB_BAR_CLEARANCE` es ese mínimo (64) más ese aire de sobra (16, probado
 * en dispositivo: ni pegado ni con hueco de más), y este hook le suma encima
 * el inset que le falta —completo, no partido, o el ajuste vuelve a
 * solaparse en cualquier móvil con borde de gestos—.
 */

import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const TAB_BAR_CLEARANCE = 80

export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets()
  return TAB_BAR_CLEARANCE + insets.bottom
}
