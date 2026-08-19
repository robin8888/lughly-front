/**
 * PlusIcon Atom
 * Un `+` dibujado en SVG, centrado en el cuadro que lo contiene.
 *
 * ## Dos intentos fallidos antes de esto, y por qué fallaron
 *
 * **Como letra**: dentro de su caja, la fuente coloca el signo alrededor del
 * eje de las matemáticas, que está por encima de la mitad —donde queda bien al
 * lado de un número, no en el centro de un cuadrado—. Ni `lineHeight` ni quitar
 * el relleno de Android lo arreglan, y encima el desvío cambia con cada
 * tipografía.
 *
 * **Como dibujo de tamaño fijo, centrado por el contenedor**: seguía saliendo
 * bajo. El dibujo era correcto; lo que fallaba era fiarse de que la caja de
 * fuera lo centrara. En una rejilla con `aspectRatio`, huecos y ajuste de
 * línea, la altura de la celda no siempre acaba siendo la que uno cree.
 *
 * ## Lo que hace ahora
 *
 * El lienzo **ocupa el cuadro entero**, y el `+` se dibuja en su centro. Al
 * cruzarse las dos líneas en la mitad del lienzo, están en la mitad de la
 * celda: no hay ningún `alignItems` de por medio del que fiarse, ni métricas
 * de tipografía, ni densidad de pantalla que valga.
 *
 * Por eso las medidas van en fracciones del cuadro y no en píxeles: el tamaño
 * lo pone la celda, y el signo guarda su proporción sea cual sea.
 *
 * `react-native-svg` ya estaba en el proyecto —lo usan los mapas—, así que esto
 * no trae ninguna dependencia nueva.
 */

import { View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { styles } from './PlusIcon.styles'

/** Lienzo en centésimas: hace que las fracciones se lean como porcentajes */
const CANVAS = 100
const CENTER = CANVAS / 2

export interface PlusIconProps {
  color: string
  /** Cuánto del lado ocupa el signo. 0,25 es una cuarta parte del cuadro */
  span?: number
  /** Grosor de la línea, también en fracción del lado */
  thickness?: number
  testID?: string
}

export function PlusIcon({
  color,
  span = 0.25,
  thickness = 0.024,
  testID,
}: PlusIconProps) {
  const arm = (span * CANVAS) / 2
  const from = CENTER - arm
  const to = CENTER + arm

  return (
    <View style={styles.fill} pointerEvents="none" testID={testID}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
        {/*
          Las dos líneas se cruzan en el centro del lienzo, y el lienzo es el
          cuadro entero. Las puntas van redondeadas, como el resto de la app.
        */}
        <Path
          d={`M${CENTER} ${from} V${to} M${from} ${CENTER} H${to}`}
          stroke={color}
          strokeWidth={thickness * CANVAS}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  )
}
