/**
 * Corner styles
 *
 * Marcas de registro, como las de imprenta. Literal de
 * `_ds/.../styles.css`:
 *
 *   .blueprint > .corner        { position:absolute; width:11px; height:11px;
 *                                 color: text 55% }
 *   .corner::before             { left:5px; top:0;  width:1px;  height:100% }
 *   .corner::after              { top:5px; left:0;  width:100%; height:1px  }
 *   .corner.tl                  { top:-6px; left:-6px }
 *
 * Es decir: una cruz de 11×11 **centrada sobre la esquina de la tarjeta**, no
 * una escuadra pegada por dentro. Van fuera de la caja (−6 px), así que la
 * tarjeta no puede llevar `overflow: hidden` o desaparecen.
 */

import { StyleSheet, ViewStyle } from 'react-native'

/** Lado de la cruz */
const SIZE = 11
/** Grosor del trazo */
const LINE = 1
/** Desplazamiento hacia fuera, para centrar la cruz en la esquina */
const OFFSET = -6
/** Dónde se cruzan las dos líneas dentro de la caja de 11×11 */
const CROSS_AT = 5

/** Color por defecto en tarjeta clara: el texto al 55% */
export const CORNER_LIGHT = 'rgba(28, 43, 51, 0.55)'
/** Color por defecto en tarjeta oscura */
export const CORNER_DARK = 'rgba(255, 255, 255, 0.55)'

export const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  /** Trazo vertical, de arriba abajo de la cruz */
  vertical: {
    position: 'absolute',
    left: CROSS_AT,
    top: 0,
    width: LINE,
    height: SIZE,
  },
  /** Trazo horizontal, de lado a lado */
  horizontal: {
    position: 'absolute',
    top: CROSS_AT,
    left: 0,
    width: SIZE,
    height: LINE,
  },
})

type PositionStyle = Record<string, ViewStyle>

export const positionStyles: PositionStyle = {
  tl: { top: OFFSET, left: OFFSET },
  tr: { top: OFFSET, right: OFFSET },
  bl: { bottom: OFFSET, left: OFFSET },
  br: { bottom: OFFSET, right: OFFSET },
}
