/**
 * useCompactNav
 * La barra inferior se encoge al bajar el scroll y vuelve al subir
 * (BOTTOM_NAV_MOBILE.md §3). Nunca desaparece.
 *
 * El valor compartido es de MÓDULO, no de componente: la pantalla que hace
 * scroll y la barra son componentes distintos y tienen que leer el mismo
 * valor. Como solo hay una pantalla visible a la vez, un único valor basta y
 * evita montar un contexto para esto.
 */

import { Dimensions } from 'react-native'
import {
  makeMutable,
  useAnimatedScrollHandler,
  withTiming,
  Easing,
} from 'react-native-reanimated'

/** Movimiento mínimo para reaccionar: evita el temblor del dedo */
const SCROLL_THRESHOLD = 4
/** No se encoge hasta haber bajado esto */
const COMPACT_AFTER = 40
const DURATION_MS = 280

const SCREEN_WIDTH = Dimensions.get('window').width

/** Anchos de la píldora: 12 px de aire a cada lado, 48 cuando es compacta */
export const NAV_WIDTH_NORMAL = SCREEN_WIDTH - 24
export const NAV_WIDTH_COMPACT = SCREEN_WIDTH - 96

/** 0 = normal, 1 = compacta */
export const compactNav = makeMutable(0)
const lastScrollY = makeMutable(0)

/** Devuelve el manejador de scroll que hay que pasar al Animated.ScrollView. */
export function useNavScrollHandler() {
  return useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y
      const timing = { duration: DURATION_MS, easing: Easing.inOut(Easing.ease) }

      const goingDown = y > lastScrollY.value + SCROLL_THRESHOLD
      const goingUp = y < lastScrollY.value - SCROLL_THRESHOLD

      if (goingDown && y > COMPACT_AFTER) {
        compactNav.value = withTiming(1, timing)
      }

      if (goingUp) {
        compactNav.value = withTiming(0, timing)
      }

      lastScrollY.value = y
    },
  })
}

/**
 * Decisión de encoger, extraída para poder razonarla y probarla sin
 * montar la animación.
 */
export function nextCompactValue(
  y: number,
  lastY: number,
  current: number,
): number {
  if (y > lastY + SCROLL_THRESHOLD && y > COMPACT_AFTER) return 1
  if (y < lastY - SCROLL_THRESHOLD) return 0
  return current
}

/** Vuelve al estado normal: al cambiar de pantalla la barra no debe quedarse encogida. */
export function resetCompactNav(): void {
  compactNav.value = 0
  lastScrollY.value = 0
}
