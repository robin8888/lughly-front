/**
 * Tests de useCoverage (MAPS_MOBILE.md §8).
 */

import { renderHook } from '@testing-library/react-native'
import { useCoverage } from './useCoverage'
import type { LatLng } from '@/utils/geo'

const MADRID: LatLng = { lat: 40.4168, lng: -3.7038 }
/** A unos 15 km al sur de Madrid */
const A_15_KM: LatLng = { lat: 40.2818, lng: -3.7038 }
/** A unos 72 km */
const A_72_KM: LatLng = { lat: 39.7690, lng: -3.7038 }

describe('useCoverage', () => {
  it('cubre a 15 km con radio 25', () => {
    const { result } = renderHook(() => useCoverage(MADRID, A_15_KM, 25))

    expect(result.current?.covered).toBe(true)
    expect(result.current?.distanceKm).toBeCloseTo(15, 0)
  })

  it('no cubre a 72 km con radio 40', () => {
    const { result } = renderHook(() => useCoverage(MADRID, A_72_KM, 40))

    expect(result.current?.covered).toBe(false)
    expect(result.current?.distanceKm).toBeCloseTo(72, 0)
  })

  it('el borde exacto del radio cuenta como cubierto', () => {
    const { result } = renderHook(() => useCoverage(MADRID, MADRID, 0))

    expect(result.current?.covered).toBe(true)
  })

  it('devuelve null si falta alguno de los dos puntos', () => {
    const sinBase = renderHook(() => useCoverage(null, A_15_KM, 25))
    const sinDestino = renderHook(() => useCoverage(MADRID, undefined, 25))

    expect(sinBase.result.current).toBeNull()
    expect(sinDestino.result.current).toBeNull()
  })

  it('explica el motivo cuando queda fuera', () => {
    const { result } = renderHook(() => useCoverage(MADRID, A_72_KM, 40))

    expect(result.current?.label).toContain('Fuera de su zona')
    expect(result.current?.label).toContain('40 km')
  })
})
