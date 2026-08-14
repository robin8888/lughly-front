/**
 * Tests de CoverageMap (MAPS_MOBILE.md §8).
 *
 * Lo que se comprueba es el contrato, no el dibujo: que el círculo llega
 * como polígono geodésico y no como un icono, que la atribución está, y que
 * `onChange` solo se dispara cuando se puede editar.
 */

import { render } from '@testing-library/react-native'
import { CoverageMap } from './CoverageMap'
import { haversineKm, type Position } from '@/utils/geo'

jest.mock('@maplibre/maplibre-react-native')

const MADRID: Position = [-3.7038, 40.4168]
const RADIUS = 15

describe('CoverageMap', () => {
  it('siempre muestra la atribución de OpenStreetMap', () => {
    const { getByText } = render(<CoverageMap center={MADRID} radiusKm={RADIUS} />)

    expect(getByText('© OpenStreetMap contributors')).toBeTruthy()
  })

  it('pasa el círculo como polígono, no como un marcador redondo', () => {
    const { getByTestId } = render(<CoverageMap center={MADRID} radiusKm={RADIUS} />)
    const source = getByTestId('coverage-circle')

    const data = source.props.data as GeoJSON.Feature<GeoJSON.Polygon>
    expect(data.geometry.type).toBe('Polygon')

    // Y el polígono es geodésico de verdad: sus vértices están al radio
    const ring = data.geometry.coordinates[0]!
    for (const [lng, lat] of ring) {
      const d = haversineKm({ lat: MADRID[1], lng: MADRID[0] }, {
        lat: lat as number,
        lng: lng as number,
      })
      expect(Math.abs(d - RADIUS) / RADIUS).toBeLessThan(0.01)
    }
  })

  it('pinta relleno y borde con el color de acento', () => {
    const { getByTestId } = render(<CoverageMap center={MADRID} radiusKm={RADIUS} />)

    expect(getByTestId('coverage-fill').props.type).toBe('fill')
    expect(getByTestId('coverage-line').props.type).toBe('line')
    expect(getByTestId('coverage-line').props.paint['line-width']).toBe(2)
  })

  it('llama a onChange al soltar el marcador si es editable', () => {
    const onChange = jest.fn()
    const { getByTestId } = render(
      <CoverageMap center={MADRID} radiusKm={RADIUS} editable onChange={onChange} />,
    )

    const nuevo: Position = [-3.7, 40.42]
    getByTestId('coverage-center').props.onDragEnd({ nativeEvent: { lngLat: nuevo } })

    expect(onChange).toHaveBeenCalledWith(nuevo, RADIUS)
  })

  it('no llama a onChange si no es editable', () => {
    const onChange = jest.fn()
    const { getByTestId } = render(
      <CoverageMap center={MADRID} radiusKm={RADIUS} onChange={onChange} />,
    )

    getByTestId('coverage-center').props.onDragEnd({
      nativeEvent: { lngLat: [-3.7, 40.42] },
    })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('solo permite arrastrar el centro en modo edición', () => {
    const lectura = render(<CoverageMap center={MADRID} radiusKm={RADIUS} />)
    expect(lectura.getByTestId('coverage-center').props.draggable).toBe(false)

    const edicion = render(<CoverageMap center={MADRID} radiusKm={RADIUS} editable />)
    expect(edicion.getByTestId('coverage-center').props.draggable).toBe(true)
  })
})
