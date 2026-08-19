/**
 * El `+` de añadir.
 *
 * Lo que se ata es lo que costó dos intentos: que el signo no dependa de que
 * nadie lo centre desde fuera. El lienzo se pega a los cuatro lados del cuadro
 * y las dos líneas se cruzan en su mitad, así que basta con comprobar esas dos
 * cosas —el trazo simétrico y el lienzo estirado—.
 */

import { render } from '@testing-library/react-native'
import { StyleSheet } from 'react-native'
import { PlusIcon } from './PlusIcon'

describe('PlusIcon', () => {
  it('el lienzo se pega a los cuatro lados del cuadro', () => {
    const { getByTestId } = render(<PlusIcon color="#000" testID="mas" />)

    const style = StyleSheet.flatten(getByTestId('mas').props.style)

    expect(style.position).toBe('absolute')
    expect([style.top, style.right, style.bottom, style.left]).toEqual([0, 0, 0, 0])
  })

  it('las dos líneas se cruzan en el centro del lienzo', () => {
    const { UNSAFE_getByProps } = render(<PlusIcon color="#000" span={0.3} />)

    /*
     * Lienzo de 100, signo del 30%: cada brazo mide 15, así que va de 35 a 65
     * en los dos ejes y el cruce cae en 50,50, que es la mitad exacta.
     */
    expect(UNSAFE_getByProps({ d: 'M50 35 V65 M35 50 H65' })).toBeTruthy()
  })

  it('el signo crece y mengua sin moverse del centro', () => {
    const { UNSAFE_getByProps } = render(<PlusIcon color="#000" span={0.5} />)

    // Más grande, pero sigue cruzándose en 50,50
    expect(UNSAFE_getByProps({ d: 'M50 25 V75 M25 50 H75' })).toBeTruthy()
  })

  it('pinta del color que se le pida', () => {
    const { UNSAFE_getByProps } = render(<PlusIcon color="#5980a6" />)

    expect(UNSAFE_getByProps({ stroke: '#5980a6' })).toBeTruthy()
  })
})
