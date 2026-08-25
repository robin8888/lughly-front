/**
 * El hueco grande de la home.
 *
 * Lo que se ata es la regla que decide qué dibujo se ve, porque es la que
 * puede mentir: la ilustración de un oficio en la home significa "hay gente
 * de esto", y si sale con cero resultados el cliente lee un resultado donde
 * no lo hay. Y el recuento del bocadillo, que es el dato por el que decide
 * si abre el directorio o busca otra cosa.
 */

import { StyleSheet, type TextStyle } from 'react-native'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { images } from '@/images'
import { theme } from '@/theme'
import { getTradeImage } from '@/utils/trades'
import { ReceptionStage } from './ReceptionStage'

const imagen = () => screen.getByTestId('stage-image').props.source

describe('ReceptionStage', () => {
  it('sin búsqueda enseña la recepción y no dice nada', () => {
    render(<ReceptionStage onSee={jest.fn()} testID="stage" />)

    expect(imagen()).toBe(images.recepcion)
    expect(screen.queryByTestId('reception-bubble')).toBeNull()
  })

  it('con resultados enseña el oficio y cuántos hay', () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    expect(imagen()).toBe(getTradeImage('carpinteria'))
    expect(screen.getByText(/Hay .*7.* profesionales de carpintería/)).toBeTruthy()
  })

  /**
   * "Cerca de ti" solo cuando el recuento es de verdad el de los que llegan
   * hasta el cliente. Sin ubicación el número es el de toda la app, y
   * prometer cercanía sobre él es mentir en la primera frase.
   */
  it('solo promete cercanía si el recuento es de los que te cubren', () => {
    const { rerender } = render(
      <ReceptionStage trade="carpinteria" total={7} nearby onSee={jest.fn()} testID="stage" />,
    )

    expect(screen.getByText(/cerca de ti/)).toBeTruthy()

    rerender(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    expect(screen.queryByText(/cerca de ti/)).toBeNull()
  })

  /** El dato por el que se decide, en verde y legible sobre el blanco */
  it('la cifra va en verde', () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} nearby onSee={jest.fn()} testID="stage" />,
    )

    const cifra = StyleSheet.flatten(
      screen.getByText('7').props.style as never,
    ) as TextStyle

    expect(cifra.color).toBe(theme.colors.availableText)
  })

  it('uno solo no se cuenta en plural', () => {
    render(
      <ReceptionStage trade="fontaneria" total={1} onSee={jest.fn()} testID="stage" />,
    )

    expect(screen.getByText(/Hay .*1.* profesional de fontanería/)).toBeTruthy()
  })

  it('"Ver" lleva al directorio', () => {
    const onSee = jest.fn()
    render(
      <ReceptionStage trade="carpinteria" total={7} onSee={onSee} testID="stage" />,
    )

    fireEvent.press(screen.getByTestId('reception-see'))

    expect(onSee).toHaveBeenCalled()
  })

  /**
   * Cero es el caso que estropea el invento: el dibujo del oficio se lee como
   * "aquí están", así que con nadie detrás se queda el mostrador, y no hay
   * botón que lleve a una lista vacía.
   */
  it('sin nadie se queda la recepción, lo dice, y no ofrece verlos', () => {
    render(
      <ReceptionStage trade="carpinteria" total={0} nearby onSee={jest.fn()} testID="stage" />,
    )

    expect(imagen()).toBe(images.recepcion)
    expect(screen.getByText('Todavía no hay nadie de carpintería cerca de ti.')).toBeTruthy()
    expect(screen.queryByTestId('reception-see')).toBeNull()
  })

  it('mientras pregunta lo dice, y si falla también', () => {
    const { rerender } = render(
      <ReceptionStage trade="limpieza" isLoading onSee={jest.fn()} testID="stage" />,
    )

    expect(screen.getByText('Un momento, que miro…')).toBeTruthy()

    rerender(<ReceptionStage trade="limpieza" isError onSee={jest.fn()} testID="stage" />)

    expect(screen.getByText('No he podido mirarlo. Prueba otra vez.')).toBeTruthy()
    expect(screen.queryByTestId('reception-see')).toBeNull()
  })
})
