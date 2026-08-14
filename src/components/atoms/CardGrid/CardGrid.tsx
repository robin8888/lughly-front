/**
 * CardGrid Atom
 * La cuadrícula de papel milimetrado del fondo de las tarjetas.
 *
 * Del sistema de diseño (`_ds/.../styles.css`, `.card::before`):
 *
 *   background-image: linear-gradient(…text 6%… 1px, transparent 1px),
 *                     linear-gradient(90deg, …text 6%… 1px, transparent 1px);
 *   background-size: 14px 14px;
 *   opacity: 0.5;
 *
 * Es deliberadamente casi invisible —6% de opacidad sobre el color de texto,
 * y encima la capa entera al 50%—: da textura de papel técnico sin competir
 * con el contenido. Si se ve como una rejilla marcada, está mal puesta.
 *
 * Se dibuja con `Pattern` de react-native-svg y no repitiendo vistas: una
 * tarjeta de 350×200 necesitaría unas 40 vistas, y hay hasta quince tarjetas
 * en una pantalla.
 */

import { useId } from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Defs, Pattern, Path, Rect } from 'react-native-svg'

/** Lado de la celda, en px. El `background-size` del diseño. */
const CELL = 14
const LINE_WIDTH = 1

/**
 * Opacidad del trazo sobre el color de texto de la tarjeta.
 *
 * El diseño la deja en un 3% efectivo (6% de trazo con la capa al 50%), que
 * en pantalla es indistinguible de una tarjeta lisa: 1,055:1 de contraste.
 * Aquí va al 10% —1,206:1— a petición expresa: sigue leyéndose como textura
 * de papel técnico, pero se ve.
 *
 * Si alguna vez compite con el contenido, este es el número que hay que
 * bajar; no hace falta tocar nada más.
 */
const LINE_OPACITY = 0.1

export interface CardGridProps {
  /** Color de las líneas: el color de texto de la tarjeta */
  color: string
  /** Radio de la tarjeta, para que la cuadrícula no se salga por las esquinas */
  radius?: number
  testID?: string
}

export function CardGrid({ color, radius = 0, testID }: CardGridProps) {
  /**
   * Identificador propio por tarjeta. Con un id fijo, varias tarjetas en la
   * misma pantalla comparten nombre de patrón y en Android alguna se queda
   * sin pintar. Se le quitan los dos puntos que mete React: `url(#…)` no los
   * admite.
   */
  const patternId = `cardGrid${useId().replace(/:/g, '')}`

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: radius, overflow: 'hidden' },
      ]}
      pointerEvents="none"
      testID={testID}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={patternId}
            width={CELL}
            height={CELL}
            patternUnits="userSpaceOnUse"
          >
            {/* Una línea arriba y otra a la izquierda: al repetirse la
                celda, forman la retícula completa. */}
            <Path
              d={`M 0 0 H ${CELL} M 0 0 V ${CELL}`}
              stroke={color}
              strokeWidth={LINE_WIDTH}
              strokeOpacity={LINE_OPACITY}
            />
          </Pattern>
        </Defs>

        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
    </View>
  )
}
