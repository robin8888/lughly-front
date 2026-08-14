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
 * 6% del color de texto, y la capa al 50% → ~3% efectivo.
 * Se aplica el 6% en el trazo y el 50% en el contenedor, igual que el CSS,
 * para que el resultado sea idéntico y no una aproximación redondeada.
 */
const LINE_OPACITY = 0.06
const LAYER_OPACITY = 0.5

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
        { borderRadius: radius, overflow: 'hidden', opacity: LAYER_OPACITY },
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
