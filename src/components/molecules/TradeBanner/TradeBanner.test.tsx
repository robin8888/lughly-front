/**
 * La franja de oficio del directorio.
 *
 * Lo que se ata es que la ilustración sea la del oficio que se está mirando:
 * encabezar la lista de fontaneros con el dibujo de la carpintería es peor
 * que no encabezarla, porque se lee como que la lista es otra.
 */

import { render, screen } from '@testing-library/react-native'
import { getTradeImage } from '@/utils/trades'
import { TradeBanner } from './TradeBanner'

describe('TradeBanner', () => {
  it('pinta la ilustración del oficio y su nombre', () => {
    render(<TradeBanner trade="fontaneria" testID="banner" />)

    expect(screen.getByTestId('banner-image').props.source).toBe(
      getTradeImage('fontaneria'),
    )
    expect(screen.getByText('Fontanería')).toBeTruthy()
  })

  /**
   * El directorio sin filtrar la usa así: le presta el slug `otros` para
   * quedarse con su ilustración, pero la lista los tiene todos, y llamarla
   * "Otros oficios" nombraría mal lo que se está viendo.
   */
  it('deja que quien la usa ponga otro nombre en la banda', () => {
    render(<TradeBanner trade="otros" label="Todos los oficios" testID="banner" />)

    expect(screen.getByTestId('banner-image').props.source).toBe(
      getTradeImage('otros'),
    )
    expect(screen.getByText('Todos los oficios')).toBeTruthy()
    expect(screen.queryByText('Otros oficios')).toBeNull()
  })

  /** `getTradeImage` ya tiene salida para un slug desconocido; que se use */
  it('un oficio que no existe no deja el hueco en blanco', () => {
    render(<TradeBanner trade="submarinismo" testID="banner" />)

    expect(screen.getByTestId('banner-image').props.source).toBe(
      getTradeImage('otros'),
    )
  })
})
