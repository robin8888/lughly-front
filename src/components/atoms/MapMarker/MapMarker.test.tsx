/**
 * El disponible debe salir en verde (MAPS_MOBILE.md §8).
 */

import { render } from '@testing-library/react-native'
import { MapMarker } from './MapMarker'
import { theme } from '@/theme'

/** Aplana el `style`, que React Native entrega como array anidado. */
function flatten(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) return Object.assign({}, ...style.map(flatten))
  return (style ?? {}) as Record<string, unknown>
}

describe('MapMarker', () => {
  it('pinta en verde al que está disponible ahora', () => {
    const { getByTestId } = render(<MapMarker variant="available" />)
    const style = flatten(getByTestId('map-marker-available').props.style)

    expect(style.backgroundColor).toBe(theme.colors.available)
  })

  it('usa el acento por defecto', () => {
    const { getByTestId } = render(<MapMarker />)
    const style = flatten(getByTestId('map-marker-default').props.style)

    expect(style.backgroundColor).toBe(theme.colors.accent)
  })

  it('usa el rojo de urgencia', () => {
    const { getByTestId } = render(<MapMarker variant="urgency" />)
    const style = flatten(getByTestId('map-marker-urgency').props.style)

    expect(style.backgroundColor).toBe(theme.colors.urgency)
  })

  it('agranda el seleccionado', () => {
    const { getByTestId } = render(<MapMarker selected />)
    const style = flatten(getByTestId('map-marker-default').props.style)

    expect(style.transform).toEqual([{ scale: 1.35 }])
  })
})
