/**
 * Tests de ProsMap (MAPS_MOBILE.md §8).
 */

import { render } from '@testing-library/react-native'
import { ProsMap, type ProsMapPro } from './ProsMap'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS } from '@/theme/map'
import { theme } from '@/theme'
import type { Position } from '@/utils/geo'

jest.mock('@maplibre/maplibre-react-native')

const MADRID: Position = [-3.7038, 40.4168]

function makePro(n: number, availableNow = false): ProsMapPro {
  return {
    id: `pro-${n}`,
    name: `Profesional ${n}`,
    avatarUrl: null,
    trade: 'fontaneria',
    tradeLabel: 'Fontanería',
    city: 'Madrid',
    hourlyRate: 28,
    rating: 4.5,
    reviewCount: 10,
    completedJobs: 20,
    availableNow,
    verified: true,
    bio: null,
    employerName: null,
    distanceKm: null,
    latitude: 40.4168 + n * 0.001,
    longitude: -3.7038 + n * 0.001,
  }
}

describe('ProsMap', () => {
  it('siempre muestra la atribución de OpenStreetMap', () => {
    const { getByText } = render(<ProsMap pros={[makePro(1)]} center={MADRID} />)

    expect(getByText('© OpenStreetMap contributors')).toBeTruthy()
  })

  it('agrupa desde el primer momento, también con más de 20 marcadores', () => {
    const pros = Array.from({ length: 25 }, (_, i) => makePro(i))
    const { getByTestId } = render(<ProsMap pros={pros} center={MADRID} />)
    const source = getByTestId('pros')

    expect(source.props.cluster).toBe(true)
    expect(source.props.clusterRadius).toBe(CLUSTER_RADIUS)
    expect(source.props.clusterMaxZoom).toBe(CLUSTER_MAX_ZOOM)

    const data = source.props.data as GeoJSON.FeatureCollection
    expect(data.features).toHaveLength(25)
  })

  it('pinta en verde al disponible y con el acento al resto', () => {
    const { getByTestId } = render(
      <ProsMap pros={[makePro(1, true), makePro(2)]} center={MADRID} />,
    )

    const paint = getByTestId('pros-points').props.paint as Record<string, unknown>
    expect(paint['circle-color']).toEqual([
      'case',
      ['get', 'availableNow'],
      theme.colors.available,
      theme.colors.accent,
    ])
  })

  it('separa la capa de grupos de la de puntos sueltos', () => {
    const { getByTestId } = render(<ProsMap pros={[makePro(1)]} center={MADRID} />)

    expect(getByTestId('pros-clusters').props.filter).toEqual(['has', 'point_count'])
    expect(getByTestId('pros-points').props.filter).toEqual([
      '!',
      ['has', 'point_count'],
    ])
  })

  it('no manda al perfil datos personales, solo lo que pinta', () => {
    const { getByTestId } = render(<ProsMap pros={[makePro(1)]} center={MADRID} />)
    const data = getByTestId('pros').props.data as GeoJSON.FeatureCollection

    expect(Object.keys(data.features[0]!.properties!).sort()).toEqual([
      'availableNow',
      'id',
      'name',
    ])
  })

  it('abre el perfil al tocar un profesional suelto', () => {
    const onSelectPro = jest.fn()
    const { getByTestId } = render(
      <ProsMap pros={[makePro(1)]} center={MADRID} onSelectPro={onSelectPro} />,
    )

    getByTestId('pros').props.onPress({
      nativeEvent: { features: [{ properties: { id: 'pro-1' } }] },
    })

    expect(onSelectPro).toHaveBeenCalledWith('pro-1')
  })

  it('no abre nada al tocar un grupo', () => {
    const onSelectPro = jest.fn()
    const { getByTestId } = render(
      <ProsMap pros={[makePro(1)]} center={MADRID} onSelectPro={onSelectPro} />,
    )

    getByTestId('pros').props.onPress({
      nativeEvent: { features: [{ properties: { point_count: 12 } }] },
    })

    expect(onSelectPro).not.toHaveBeenCalled()
  })

  it('no muestra la posición del usuario si no hay permiso', () => {
    const sinPermiso = render(<ProsMap pros={[makePro(1)]} center={MADRID} />)
    expect(sinPermiso.queryByTestId('UserLocation')).toBeNull()

    const conPermiso = render(
      <ProsMap pros={[makePro(1)]} center={MADRID} showUserLocation />,
    )
    expect(conPermiso.getByTestId('UserLocation')).toBeTruthy()
  })
})
