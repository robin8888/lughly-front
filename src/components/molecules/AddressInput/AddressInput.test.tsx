/**
 * El campo de dirección con sugerencias.
 *
 * Lo que se ata aquí es la regla que justifica que este campo exista: **el
 * valor solo tiene coordenadas si se ha elegido de la lista**. Escribir una
 * dirección a mano no vale, y seguir escribiendo después de haber elegido
 * descarta la elección.
 *
 * Sin eso vuelve el fallo que había en urgencias: el texto que se lee en
 * pantalla y las coordenadas a las que se manda al profesional pueden ser de
 * dos sitios distintos, y nada lo enseña.
 */

import { useState } from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native'
import type { ApiGeocodeMatch } from '@/api/geocode.api'
import { AddressInput } from './AddressInput'

const PUIG: ApiGeocodeMatch = {
  label: 'Calle Virgen del Puig 4, Valencia',
  lat: 39.4699,
  lng: -0.3763,
  city: 'Valencia',
  postcode: '46013',
}

const PILAR: ApiGeocodeMatch = {
  label: 'Calle Virgen del Pilar 12, Zaragoza',
  lat: 41.6488,
  lng: -0.8891,
  city: 'Zaragoza',
  postcode: '50003',
}

const mockSearch = jest.fn()

jest.mock('@/api/geocode.api', () => ({
  geocodeApi: {
    search: (...args: unknown[]) => mockSearch(...args),
    reverse: jest.fn(),
  },
}))

/** Envoltorio con estado, que es como lo usan las pantallas de verdad */
function Campo({ onChange }: { onChange?: (value: ApiGeocodeMatch | null) => void }) {
  const [value, setValue] = useState<ApiGeocodeMatch | null>(null)

  return (
    <AddressInput
      value={value}
      onChange={(elegida) => {
        setValue(elegida)
        onChange?.(elegida)
      }}
      testID="address"
    />
  )
}

describe('AddressInput', () => {
  beforeEach(() => {
    mockSearch.mockReset()
    mockSearch.mockResolvedValue({ matches: [PUIG, PILAR] })
  })

  it('propone direcciones al escribir, sin pulsar nada', async () => {
    render(<Campo />)

    fireEvent.changeText(screen.getByTestId('address'), 'Calle Virgen del')

    expect(await screen.findByTestId('address-list')).toBeTruthy()
    expect(screen.getByText(PUIG.label)).toBeTruthy()
    expect(screen.getByText(PILAR.label)).toBeTruthy()
  })

  /**
   * Tres letras devuelven media España. El mínimo evita gastar cuota del
   * proveedor en consultas que no podían acertar.
   */
  it('no pregunta nada con menos de cinco letras', async () => {
    render(<Campo />)

    fireEvent.changeText(screen.getByTestId('address'), 'Cal')

    await waitFor(() => expect(screen.getByText(/Sigue escribiendo/)).toBeTruthy())
    expect(mockSearch).not.toHaveBeenCalled()
  })

  it('al elegir una, devuelve sus coordenadas', async () => {
    const onChange = jest.fn()
    render(<Campo onChange={onChange} />)

    fireEvent.changeText(screen.getByTestId('address'), 'Calle Virgen del')
    fireEvent.press(
      await screen.findByTestId(`address-match-${PILAR.lat},${PILAR.lng}`),
    )

    expect(onChange).toHaveBeenCalledWith(PILAR)
    // Y la lista se va: ya hay elección, no hay nada más que proponer
    expect(screen.queryByTestId('address-list')).toBeNull()
  })

  /**
   * El caso que da sentido a todo lo demás. Elegir "Virgen del Puig 4" y
   * añadirle un "3" deja un texto que ya no es la dirección elegida: si el
   * valor sobreviviera, se mandaría a alguien a un portal que nadie escribió.
   */
  it('descarta la elección en cuanto se vuelve a escribir', async () => {
    const onChange = jest.fn()
    render(<Campo onChange={onChange} />)

    fireEvent.changeText(screen.getByTestId('address'), 'Calle Virgen del')
    fireEvent.press(
      await screen.findByTestId(`address-match-${PUIG.lat},${PUIG.lng}`),
    )
    expect(screen.getByTestId('address-chosen')).toBeTruthy()

    fireEvent.changeText(screen.getByTestId('address'), `${PUIG.label} 3`)

    expect(onChange).toHaveBeenLastCalledWith(null)
    expect(screen.queryByTestId('address-chosen')).toBeNull()
  })

  it('dice que no encuentra la dirección en vez de dejar el hueco vacío', async () => {
    mockSearch.mockResolvedValue({ matches: [] })
    render(<Campo />)

    fireEvent.changeText(screen.getByTestId('address'), 'Calle que no existe')

    expect(await screen.findByTestId('address-empty')).toBeTruthy()
  })

  /**
   * Y distingue "no está" de "no he podido mirar". Son dos cosas distintas:
   * de la primera se sale escribiendo otra cosa, de la segunda reintentando.
   */
  it('avisa cuando el buscador falla, sin confundirlo con no encontrarla', async () => {
    mockSearch.mockRejectedValue(new Error('sin red'))
    render(<Campo />)

    fireEvent.changeText(screen.getByTestId('address'), 'Calle Virgen del')

    expect(await screen.findByTestId('address-failed')).toBeTruthy()
    expect(screen.queryByTestId('address-empty')).toBeNull()
  })
})
