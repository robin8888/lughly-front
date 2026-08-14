import { render } from '@testing-library/react-native'
import { MapUnavailable } from './MapUnavailable'

describe('MapUnavailable', () => {
  it('dice en palabras lo que el mapa habría enseñado', () => {
    const { getByText } = render(
      <MapUnavailable message="Se desplaza hasta 15 km desde Madrid." />,
    )

    expect(getByText('Se desplaza hasta 15 km desde Madrid.')).toBeTruthy()
  })

  it('explica que falta la compilación nativa, sin culpar al usuario', () => {
    const { getByText } = render(<MapUnavailable message="algo" />)

    expect(getByText(/compilación nativa/)).toBeTruthy()
  })
})
