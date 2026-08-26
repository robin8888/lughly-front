/**
 * El hueco grande de la home.
 *
 * Lo que se ata es la regla que decide qué dibujo se ve, porque es la que
 * puede mentir: la ilustración de un oficio en la home significa "hay gente
 * de esto", y si sale con cero resultados el cliente lee un resultado donde
 * no lo hay. Y el recuento del bocadillo, que es el dato por el que decide
 * si abre el directorio o busca otra cosa.
 *
 * Lo que Uhiro contesta se escribe letra a letra, así que **nada de lo que
 * dice está en pantalla en el primer fotograma**: cada comprobación tiene que
 * dejarle terminar la frase. Con relojes falsos y no esperando de verdad, para
 * que la prueba no dependa de lo rápido que vaya la máquina.
 */

import { act } from 'react'
import { StyleSheet, type TextStyle } from 'react-native'
import { render, fireEvent, screen } from '@testing-library/react-native'
import { images } from '@/images'
import { theme } from '@/theme'
import { getTradeImage } from '@/utils/trades'
import { ReceptionStage, TYPING_MS } from './ReceptionStage'

const imagen = () => screen.getByTestId('stage-image').props.source

/**
 * Deja que Uhiro acabe la frase.
 *
 * De sobra para la más larga que dice. Se pasa de tiempo a propósito: el
 * intervalo se para solo al llegar al final, así que sobrar no cuesta nada y
 * evita que añadir una palabra a un mensaje rompa el test.
 */
const teclear = async () => {
  await act(async () => {
    jest.advanceTimersByTime(TYPING_MS * 200)
  })
}

describe('ReceptionStage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  /**
   * Al abrir la app, el bocadillo manda al buscador.
   *
   * Antes no había bocadillo hasta que se buscara algo, y lo único que decía
   * dónde escribir era un cartel dibujado dentro de la ilustración: quien no
   * lo mirase se quedaba delante de un dibujo bonito sin nada que hacer.
   */
  it('sin búsqueda enseña la recepción y manda al buscador', async () => {
    render(<ReceptionStage onSee={jest.fn()} testID="stage" />)

    expect(imagen()).toBe(images.recepcion)
    // Nada que ver todavía: no hay lista detrás
    expect(screen.queryByTestId('reception-see')).toBeNull()

    await teclear()
    expect(
      screen.getByText(/Dime arriba qué profesional estás buscando/),
    ).toBeTruthy()
  })

  it('con resultados enseña el oficio y cuántos hay', async () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    expect(imagen()).toBe(getTradeImage('carpinteria'))

    await teclear()
    expect(screen.getByText(/Hay .*7.* profesionales de carpintería/)).toBeTruthy()
  })

  /**
   * La frase entra escribiéndose: es un personaje contestando a lo que le
   * acaban de preguntar, no un contador refrescándose. Se comprueba que al
   * principio **no está entera**, que es lo único que distingue el tecleo de
   * pintarla de golpe.
   */
  it('escribe la respuesta letra a letra', async () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    expect(screen.queryByText(/profesionales de carpintería/)).toBeNull()

    await teclear()
    expect(screen.getByText(/Hay .*7.* profesionales de carpintería/)).toBeTruthy()
  })

  /**
   * Y quien no la ve la recibe entera desde el primer momento. Un lector de
   * pantalla siguiendo lo escrito diría "Hay", "Hay 7", "Hay 7 pro"… una vez
   * por letra: la animación es para quien la mira.
   */
  it('para un lector de pantalla la frase está completa desde el principio', () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} nearby onSee={jest.fn()} testID="stage" />,
    )

    expect(
      screen.getByLabelText('Hay 7 profesionales de carpintería cerca de ti'),
    ).toBeTruthy()
  })

  /**
   * "Cerca de ti" solo cuando el recuento es de verdad el de los que llegan
   * hasta el cliente. Sin ubicación el número es el de toda la app, y
   * prometer cercanía sobre él es mentir en la primera frase.
   */
  it('solo promete cercanía si el recuento es de los que te cubren', async () => {
    const { rerender } = render(
      <ReceptionStage trade="carpinteria" total={7} nearby onSee={jest.fn()} testID="stage" />,
    )

    await teclear()
    expect(screen.getByText(/cerca de ti/)).toBeTruthy()

    rerender(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    await teclear()
    expect(screen.queryByText(/cerca de ti/)).toBeNull()
  })

  /**
   * El dato por el que se decide: en verde y en negrita.
   *
   * Las dos cosas, no una. El color la separa de las palabras de al lado solo
   * si se mira; el peso la separa antes de leer nada, que es lo que hace falta
   * cuando lo único que se busca es si hay alguien o no.
   */
  /**
   * El oficio en naranja, que es el otro dato que se busca por encima: cuántos
   * hay y de qué. En semibold y no en negrita, que la negrita es de la cifra;
   * si los dos pesaran igual no habría dónde mirar primero.
   */
  it('el oficio va en naranja', async () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} onSee={jest.fn()} testID="stage" />,
    )

    await teclear()

    const oficio = StyleSheet.flatten(
      screen.getByText('carpintería').props.style as never,
    ) as TextStyle

    expect(oficio.color).toBe(theme.colors.pendingOnGlass)
  })

  it('la cifra va en verde y en negrita', async () => {
    render(
      <ReceptionStage trade="carpinteria" total={7} nearby onSee={jest.fn()} testID="stage" />,
    )

    await teclear()

    const cifra = StyleSheet.flatten(
      screen.getByText('7').props.style as never,
    ) as TextStyle

    expect(cifra.color).toBe(theme.colors.availableOnGlass)
    expect(cifra.fontFamily).toBe(theme.typography.fonts.bodyBold)
  })

  it('uno solo no se cuenta en plural', async () => {
    render(
      <ReceptionStage trade="fontaneria" total={1} onSee={jest.fn()} testID="stage" />,
    )

    await teclear()
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
  it('sin nadie se queda la recepción, lo dice, y no ofrece verlos', async () => {
    render(
      <ReceptionStage trade="carpinteria" total={0} nearby onSee={jest.fn()} testID="stage" />,
    )

    expect(imagen()).toBe(images.recepcion)
    expect(screen.queryByTestId('reception-see')).toBeNull()

    await teclear()
    expect(screen.getByText('Todavía no hay nadie de carpintería cerca de ti.')).toBeTruthy()
  })

  /**
   * La espera **no** se teclea, ni el fallo. Son textos de paso: animar "un
   * momento, que miro" pondría a Uhiro escribiéndolo durante justo el momento
   * que dura la espera, y para cuando acabase ya habría llegado la respuesta.
   */
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
