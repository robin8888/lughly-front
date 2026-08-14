/**
 * La atribución debe renderizarse siempre (MAPS_MOBILE.md §8).
 */

import { render, screen } from '@testing-library/react-native'
import { MapAttribution } from './MapAttribution'
import { MAP_ATTRIBUTION } from '@/theme/map'

describe('MapAttribution', () => {
  it('muestra el texto que exige la licencia', () => {
    render(<MapAttribution />)
    expect(screen.getByText('© OpenStreetMap contributors')).toBeTruthy()
  })

  it('usa el token del tema, no una cadena suelta', () => {
    render(<MapAttribution />)
    expect(screen.getByText(MAP_ATTRIBUTION)).toBeTruthy()
  })

  it('no intercepta los toques del mapa que tiene debajo', () => {
    render(<MapAttribution testID="attr" />)
    expect(screen.getByTestId('attr').props.pointerEvents).toBe('none')
  })
})
