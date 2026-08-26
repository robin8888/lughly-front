/**
 * El buscador rápido del hero y su desplegable.
 *
 * Lo que se fija aquí son detalles que se pierden de vista al retocar estilos:
 * que la última fila no arrastre una raya suelta contra el canto redondeado, y
 * que el desplegable siga colgando del campo con su mismo aspecto.
 *
 * Y lo que pasa **después** de elegir, que es lo que este buscador hacía peor:
 * el campo se vaciaba, y la pantalla se quedaba contestando a una búsqueda que
 * ya no se veía por ninguna parte.
 */

import { StyleSheet, Keyboard, type ViewStyle } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native'
import { theme } from '@/theme'
import { QuickSearch } from './QuickSearch'

const noop = () => {}

describe('QuickSearch', () => {
  it('sugiere por sinónimo, no solo por el nombre del oficio', () => {
    const { getByTestId, getByText } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')

    expect(getByTestId('buscador-list')).toBeTruthy()
    expect(getByText('Fontanería')).toBeTruthy()
  })

  it('no enseña nada hasta que se escribe', () => {
    const { queryByTestId } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    expect(queryByTestId('buscador-list')).toBeNull()
  })

  it('deja la última fila sin raya, para que no quede cortada por el redondeo', () => {
    const { getByTestId } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'a')

    const lista = getByTestId('buscador-list')
    const rows = lista.findAll(
      (n) => typeof n.type === 'string' && n.props.accessibilityRole === 'button'
    )

    expect(rows.length).toBeGreaterThan(1)

    const ultima = StyleSheet.flatten(
      rows[rows.length - 1].props.style as never
    ) as ViewStyle
    const primera = StyleSheet.flatten(rows[0].props.style as never) as ViewStyle

    expect(ultima.borderBottomWidth).toBe(0)
    expect(primera.borderBottomWidth).toBe(1)
  })

  it('el desplegable va a juego con el campo: mismo borde y mismo radio', () => {
    const { getByTestId } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')

    const lista = StyleSheet.flatten(
      getByTestId('buscador-list').props.style as never
    ) as ViewStyle

    expect(lista.borderColor).toBe(theme.colors.accent)
    expect(lista.borderRadius).toBe(theme.radius.card)
    expect(lista.backgroundColor).toBe('#ffffff')
  })

  it('al elegir un oficio lo devuelve, lo deja escrito y quita el teclado', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    const elegido: string[] = []
    const { getByTestId, queryByTestId } = render(
      <QuickSearch onSelect={(s) => elegido.push(s)} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')
    fireEvent.press(getByTestId('buscador-fontaneria'))

    expect(elegido).toEqual(['fontaneria'])
    // El oficio se queda en el campo: es lo que dice a qué contesta el hero
    expect(getByTestId('buscador').props.value).toBe('Fontanería')
    expect(dismiss).toHaveBeenCalled()

    /*
      Y el desplegable se va. Con "Fontanería" escrito, el buscador la
      encuentra otra vez: sin la bandera de "ya elegido" reaparecería debajo
      ofreciendo elegir lo que se acaba de elegir.
    */
    expect(queryByTestId('buscador-list')).toBeNull()

    dismiss.mockRestore()
  })

  /**
   * La cruz es lo que empieza una búsqueda nueva, ahora que el campo ya no se
   * vacía solo. Sin ella habría que borrar "Fontanería" letra a letra.
   */
  it('la cruz aparece con texto y deja el campo listo para otra búsqueda', () => {
    const { getByTestId, queryByTestId } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    // Vacío no hay nada que borrar
    expect(queryByTestId('buscador-clear')).toBeNull()

    fireEvent.changeText(getByTestId('buscador'), 'fuga')
    fireEvent.press(getByTestId('buscador-fontaneria'))
    expect(getByTestId('buscador-clear')).toBeTruthy()

    fireEvent.press(getByTestId('buscador-clear'))

    expect(getByTestId('buscador').props.value).toBe('')
    expect(queryByTestId('buscador-clear')).toBeNull()
  })

  /**
   * Escribir encima de lo elegido vuelve a proponer. Es el otro camino a una
   * búsqueda nueva, y sin esto el campo se quedaría mudo para siempre después
   * de la primera elección.
   */
  it('escribir sobre lo elegido vuelve a proponer', () => {
    const { getByTestId } = render(
      <QuickSearch onSelect={noop} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')
    fireEvent.press(getByTestId('buscador-fontaneria'))

    fireEvent.changeText(getByTestId('buscador'), 'pint')

    expect(getByTestId('buscador-list')).toBeTruthy()
  })

  /**
   * El intro del teclado. Lo que hay justo debajo del buscador es la
   * respuesta a la búsqueda, y el teclado ocupa media pantalla: si se queda
   * abierto, se busca a ciegas.
   */
  it('el intro se queda con la primera sugerencia y cierra el teclado', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    const elegido: string[] = []
    const { getByTestId } = render(
      <QuickSearch onSelect={(s) => elegido.push(s)} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')
    fireEvent(getByTestId('buscador'), 'submitEditing')

    expect(elegido).toEqual(['fontaneria'])
    // Y por intro también se queda escrito, igual que al tocar la sugerencia
    expect(getByTestId('buscador').props.value).toBe('Fontanería')
    expect(dismiss).toHaveBeenCalled()

    dismiss.mockRestore()
  })

  it('sin sugerencias el intro no elige nada, pero el teclado se va igual', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    const onSelect = jest.fn()
    const { getByTestId } = render(
      <QuickSearch onSelect={onSelect} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'qwerty')
    fireEvent(getByTestId('buscador'), 'submitEditing')

    expect(onSelect).not.toHaveBeenCalled()
    expect(dismiss).toHaveBeenCalled()

    dismiss.mockRestore()
  })
})
