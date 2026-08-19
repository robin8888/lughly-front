/**
 * El campo de texto.
 *
 * Se atan las dos cosas que se le acaban de añadir y que son fáciles de romper
 * sin darse cuenta: que la unidad siga a la vista mientras se escribe —es todo
 * el motivo de que exista `suffix` en vez de dejarla en el marcador— y que
 * poner el foco no se coma el `onFocus` que le pase quien lo usa.
 */

import { render, fireEvent } from '@testing-library/react-native'
import { Input } from './Input'

describe('Input', () => {
  it('enseña la unidad aunque el campo tenga texto', () => {
    const { getByText } = render(
      <Input value="45" suffix="€/h" onChangeText={() => {}} testID="rate" />,
    )

    // Con el marcador, esto habría desaparecido en cuanto se teclea el 4
    expect(getByText('€/h')).toBeTruthy()
  })

  it('sin unidad no pinta nada de más', () => {
    const { queryByText } = render(
      <Input value="45" onChangeText={() => {}} testID="plain" />,
    )

    expect(queryByText('€/h')).toBeNull()
  })

  it('sigue avisando a quien le pasa onFocus y onBlur', () => {
    /*
     * El campo lleva su propio estado de foco para pintar el borde. Si al
     * hacerlo se tragara los avisos, los formularios que ocultan un error al
     * volver a escribir dejarían de enterarse.
     */
    const onFocus = jest.fn()
    const onBlur = jest.fn()

    const { getByTestId } = render(
      <Input value="" onChangeText={() => {}} onFocus={onFocus} onBlur={onBlur} testID="campo" />,
    )

    fireEvent(getByTestId('campo'), 'focus')
    fireEvent(getByTestId('campo'), 'blur')

    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onBlur).toHaveBeenCalledTimes(1)
  })
})
