/**
 * Tests de la geometría (MAPS_MOBILE.md §8).
 *
 * Los casos de `haversineKm` son los mismos que se prueban en el backend:
 * si las dos implementaciones divergen, uno de los dos conjuntos falla.
 */

import { circleToPolygon, formatDistance, haversineKm, type LatLng } from './geo'

const MADRID: LatLng = { lat: 40.4168, lng: -3.7038 }
const GETAFE: LatLng = { lat: 40.3082, lng: -3.7325 }
const BARCELONA: LatLng = { lat: 41.3874, lng: 2.1686 }

describe('haversineKm', () => {
  it('mide Madrid–Getafe en unos 13 km', () => {
    expect(haversineKm(MADRID, GETAFE)).toBeCloseTo(12.3, 0)
  })

  it('da 0 para el mismo punto', () => {
    expect(haversineKm(MADRID, MADRID)).toBe(0)
  })

  it('no depende del orden de los argumentos', () => {
    expect(haversineKm(MADRID, BARCELONA)).toBeCloseTo(
      haversineKm(BARCELONA, MADRID),
      10,
    )
  })

  it('mide Madrid–Barcelona en unos 505 km', () => {
    expect(haversineKm(MADRID, BARCELONA)).toBeCloseTo(505, -1)
  })
})

describe('circleToPolygon', () => {
  const CENTER: [number, number] = [MADRID.lng, MADRID.lat]
  const RADIUS = 15

  it('devuelve 65 puntos con 64 pasos', () => {
    const ring = circleToPolygon(CENTER, RADIUS).geometry.coordinates[0]!
    expect(ring).toHaveLength(65)
  })

  it('cierra el anillo: el último punto es el primero', () => {
    const ring = circleToPolygon(CENTER, RADIUS).geometry.coordinates[0]!
    expect(ring[64]).toEqual(ring[0])
  })

  it('pone todos los vértices al radio pedido, con 1% de tolerancia', () => {
    const ring = circleToPolygon(CENTER, RADIUS).geometry.coordinates[0]!

    for (const [lng, lat] of ring) {
      const d = haversineKm(MADRID, { lat: lat as number, lng: lng as number })
      expect(Math.abs(d - RADIUS) / RADIUS).toBeLessThan(0.01)
    }
  })

  it('sigue siendo correcto lejos del ecuador, donde falla un círculo pintado', () => {
    // Reikiavik: a esa latitud un grado de longitud mide la mitad que en Madrid
    const reikiavik: LatLng = { lat: 64.1466, lng: -21.9426 }
    const ring = circleToPolygon([reikiavik.lng, reikiavik.lat], 30)
      .geometry.coordinates[0]!

    for (const [lng, lat] of ring) {
      const d = haversineKm(reikiavik, { lat: lat as number, lng: lng as number })
      expect(Math.abs(d - 30) / 30).toBeLessThan(0.01)
    }
  })

  it('admite otro número de pasos', () => {
    const ring = circleToPolygon(CENTER, RADIUS, 8).geometry.coordinates[0]!
    expect(ring).toHaveLength(9)
  })
})

describe('formatDistance', () => {
  it('usa metros por debajo del kilómetro', () => {
    expect(formatDistance(0.85)).toBe('850 m')
    expect(formatDistance(0.42)).toBe('400 m')
  })

  it('usa un decimal con coma entre 1 y 10 km', () => {
    expect(formatDistance(1.44)).toBe('1,4 km')
    expect(formatDistance(9.96)).toBe('10,0 km')
  })

  it('quita el decimal a partir de 10 km', () => {
    expect(formatDistance(23.4)).toBe('23 km')
  })

  it('devuelve cadena vacía si el valor no sirve', () => {
    expect(formatDistance(Number.NaN)).toBe('')
    expect(formatDistance(-5)).toBe('')
  })
})
