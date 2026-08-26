/**
 * El botón flotante de mensajes y su aviso.
 *
 * Lo que se ata es que la chapa **solo aparezca cuando hay algo**, y que la
 * cifra llegue también a quien no la ve. Un aviso que se queda puesto sin
 * mensajes detrás enseña a ignorarlo, que es la única forma de estropear del
 * todo un contador de pendientes.
 */

import { render, screen, fireEvent } from '@testing-library/react-native'
import { MessagesFab } from './MessagesFab'
import { BADGE_MAX } from './MessagesFab.styles'

/**
 * La chapa está **escondida de los lectores de pantalla** a propósito: la
 * cifra ya va en la etiqueta del botón, y sin esconderla se leería dos veces
 * ("Mensajes, 3 sin leer. 3"). Las consultas de esta librería solo miran lo
 * accesible, así que para verla hay que pedirlo.
 */
const oculto = { includeHiddenElements: true } as const

describe('MessagesFab', () => {
  it('sin mensajes pendientes no pinta chapa', () => {
    render(<MessagesFab onPress={jest.fn()} />)

    expect(screen.queryByTestId('messages-fab-badge', oculto)).toBeNull()
    // Y la etiqueta no promete nada que no haya
    expect(screen.getByLabelText('Mensajes')).toBeTruthy()
  })

  it('sin dato ninguno tampoco: cargando no es lo mismo que tener', () => {
    render(<MessagesFab onPress={jest.fn()} unread={undefined} />)

    expect(screen.queryByTestId('messages-fab-badge', oculto)).toBeNull()
  })

  it('con mensajes pendientes pinta cuántos', () => {
    render(<MessagesFab onPress={jest.fn()} unread={3} />)

    expect(screen.getByTestId('messages-fab-badge', oculto)).toBeTruthy()
    expect(screen.getByText('3', oculto)).toBeTruthy()
  })

  /**
   * Lo que comunica la chapa no es la cifra exacta sino que hay gente
   * esperando, y tres dígitos en un círculo de veinte píxeles no se leen.
   */
  it('a partir de nueve deja de contar y dice "9+"', () => {
    render(<MessagesFab onPress={jest.fn()} unread={42} />)

    expect(screen.getByText(`${BADGE_MAX}+`, oculto)).toBeTruthy()
  })

  it('justo en el corte todavía cuenta', () => {
    render(<MessagesFab onPress={jest.fn()} unread={BADGE_MAX} />)

    expect(screen.getByText(String(BADGE_MAX), oculto)).toBeTruthy()
  })

  /**
   * Un lector de pantalla no ve el círculo rojo. Si la cifra viviera solo en
   * la chapa, para quien navega a ciegas el botón no habría cambiado en nada.
   */
  it('dice cuántos hay también en la etiqueta del botón', () => {
    render(<MessagesFab onPress={jest.fn()} unread={3} />)

    expect(screen.getByLabelText('Mensajes, 3 sin leer')).toBeTruthy()
  })

  it('sigue llevando a mensajes', () => {
    const onPress = jest.fn()
    render(<MessagesFab onPress={onPress} unread={2} />)

    fireEvent.press(screen.getByTestId('messages-fab'))

    expect(onPress).toHaveBeenCalled()
  })
})
