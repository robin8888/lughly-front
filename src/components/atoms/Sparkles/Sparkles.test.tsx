/**
 * Las chispitas del botón de mensajes.
 *
 * Son decoración encima de un botón, y eso trae dos obligaciones que no se ven
 * al mirar la pantalla: no pueden robarle el toque al botón, y un lector de
 * pantalla no puede anunciarlas. Las dos fallan en silencio —el botón deja de
 * responder en una esquina, o alguien oye "estrella, estrella, estrella"— así
 * que van atadas.
 */

import { render, screen, fireEvent } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { theme } from '@/theme'
import { Sparkles } from './Sparkles'

/** Las consultas por defecto no ven lo que está oculto a accesibilidad */
const oculto = { includeHiddenElements: true } as const

describe('Sparkles', () => {
  it('se pinta', () => {
    render(<Sparkles testID="chispas" />)

    expect(screen.getByTestId('chispas', oculto)).toBeTruthy()
  })

  it('está escondido de los lectores de pantalla', () => {
    render(<Sparkles testID="chispas" />)

    // Sin `includeHiddenElements` no aparece: es exactamente lo que se quiere
    expect(screen.queryByTestId('chispas')).toBeNull()
  })

  /**
   * El caso que rompería el botón: si las chispas recogieran el toque, pulsar
   * cerca del borde no abriría los mensajes y nadie sabría por qué.
   */
  it('no le roba el toque a lo que hay debajo', () => {
    const onPress = jest.fn()

    render(
      <Pressable onPress={onPress} testID="boton">
        <Text>Mensajes</Text>
        <Sparkles testID="chispas" />
      </Pressable>,
    )

    expect(screen.getByTestId('chispas', oculto).props.pointerEvents).toBe('none')

    fireEvent.press(screen.getByTestId('boton'))
    expect(onPress).toHaveBeenCalled()
  })

  it('usa el dorado de la casa si no se le da otro', () => {
    render(<Sparkles testID="chispas" />)

    const dorados = screen
      .getByTestId('chispas', oculto)
      .findAll((node) => node.props.fill === theme.colors.rating)

    // Una por chispa: si el color se pierde por el camino, aquí sale cero
    expect(dorados.length).toBeGreaterThanOrEqual(3)
  })
})
