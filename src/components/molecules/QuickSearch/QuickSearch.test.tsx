/**
 * El buscador rápido del hero y su desplegable.
 *
 * Lo que se fija aquí son detalles que se pierden de vista al retocar estilos:
 * que la última fila no arrastre una raya suelta contra el canto redondeado, y
 * que el desplegable siga colgando del campo con su mismo aspecto.
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

  it('al elegir un oficio lo devuelve, vacía el campo y quita el teclado', () => {
    const dismiss = jest.spyOn(Keyboard, 'dismiss')
    const elegido: string[] = []
    const { getByTestId } = render(
      <QuickSearch onSelect={(s) => elegido.push(s)} testID="buscador" />
    )

    fireEvent.changeText(getByTestId('buscador'), 'fuga')
    fireEvent.press(getByTestId('buscador-fontaneria'))

    expect(elegido).toEqual(['fontaneria'])
    expect(getByTestId('buscador').props.value).toBe('')
    expect(dismiss).toHaveBeenCalled()

    dismiss.mockRestore()
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
