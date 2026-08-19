/**
 * El `+` de añadir.
 *
 * Lo que se ata es que siga siendo un dibujo y no una letra. Como letra no
 * caía en el centro del cuadrado —la fuente coloca el signo por encima de la
 * mitad, alrededor del eje de las matemáticas— y no había forma de corregirlo
 * desde fuera. En el SVG las dos líneas se cruzan en el centro del lienzo por
 * definición, así que basta con comprobar que el lienzo es cuadrado y que el
 * trazo pasa por el medio.
 */

import { render } from '@testing-library/react-native'
import { PlusIcon } from './PlusIcon'

describe('PlusIcon', () => {
  it('el lienzo es un cuadrado del tamaño pedido', () => {
    const { getByTestId } = render(<PlusIcon size={38} color="#000" testID="mas" />)

    expect(getByTestId('mas').props.width).toBe(38)
    expect(getByTestId('mas').props.height).toBe(38)
  })

  it('las dos líneas se cruzan en el centro del lienzo', () => {
    const { UNSAFE_getByProps } = render(<PlusIcon size={38} color="#000" testID="mas" />)

    /*
     * Lienzo de 24: el centro es 12,12. La vertical va de 3 a 21 en x=12 y la
     * horizontal de 3 a 21 en y=12, así que se cruzan justo en medio y el
     * signo ocupa tres cuartas partes del cuadrado.
     */
    expect(UNSAFE_getByProps({ d: 'M12 3 V21 M3 12 H21' })).toBeTruthy()
  })

  it('pinta del color que se le pida', () => {
    const { UNSAFE_getByProps } = render(<PlusIcon size={24} color="#5980a6" />)

    expect(UNSAFE_getByProps({ stroke: '#5980a6' })).toBeTruthy()
  })
})
