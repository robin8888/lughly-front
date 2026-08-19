/**
 * PlusIcon Atom
 * Un `+` dibujado como SVG.
 *
 * ## Por qué no es una letra
 *
 * Porque como letra no se puede centrar. Se intentó con `lineHeight` igual al
 * tamaño de letra y quitando el relleno que añade Android, y seguía sin caer en
 * el medio: dentro de su caja, la fuente coloca el signo alrededor del eje de
 * las matemáticas, que está por encima de la mitad —donde queda bien al lado de
 * un número, no en el centro de un cuadrado—. Eso lo decide la tipografía y no
 * hay forma de corregirlo desde fuera; encima cambia con la fuente que esté
 * cargada, así que lo que se ajuste a ojo para una se rompe con la siguiente.
 *
 * En un SVG las dos líneas se cruzan en el centro del lienzo por definición, y
 * el lienzo es un cuadrado del tamaño que se pida. Da igual la tipografía, la
 * plataforma y la densidad de pantalla.
 *
 * `react-native-svg` ya estaba en el proyecto —lo usan los mapas—, así que esto
 * no trae ninguna dependencia nueva.
 */

import Svg, { Path } from 'react-native-svg'

export interface PlusIconProps {
  /** Lado del cuadrado en píxeles */
  size?: number
  color: string
  /**
   * Grosor de la línea, en unidades del lienzo de 24. Sube o baja con el
   * tamaño, que es lo que se quiere: un `+` grande con línea fina se ve
   * enclenque.
   */
  strokeWidth?: number
  testID?: string
}

export function PlusIcon({
  size = 32,
  color,
  strokeWidth = 2.4,
  testID,
}: PlusIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" testID={testID}>
      {/*
        De 3 a 21 sobre un lienzo de 24: el signo ocupa tres cuartas partes del
        cuadrado. Las dos líneas se cruzan en 12,12, que es el centro exacto.
        Las puntas van redondeadas, como el resto de la app.
      */}
      <Path
        d="M12 3 V21 M3 12 H21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  )
}
