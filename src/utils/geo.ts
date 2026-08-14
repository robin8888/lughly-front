/**
 * Geometría del mapa (MAPS_MOBILE.md §6).
 *
 * Todo se calcula aquí, sin llamar a ningún servicio. Son funciones puras y
 * se prueban como tales.
 *
 * **`haversineKm` está reimplementada en el backend y las dos deben dar el
 * mismo resultado.** El servidor vuelve a validar la cobertura al contratar;
 * lo de aquí solo evita que el usuario llegue a un error. Si alguna vez
 * discrepan, manda el servidor.
 */

/** Radio medio de la Tierra en km. El mismo valor que usa el backend. */
const EARTH_RADIUS_KM = 6371

export interface LatLng {
  lat: number
  lng: number
}

/** Posición como la quiere MapLibre: [longitud, latitud]. */
export type Position = [number, number]

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Distancia en km entre dos puntos por la fórmula del semiverseno.
 *
 * Es simétrica: el orden de los argumentos no cambia el resultado.
 */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  // `min(1, …)` protege del error de coma flotante: sin él, dos puntos
  // idénticos pueden dar un valor ligeramente mayor que 1 y `asin` da NaN.
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * El círculo de cobertura como polígono geodésico.
 *
 * No se dibuja con una vista redonda ni con un icono: sobre una proyección
 * Mercator, un círculo de pantalla deja de representar el mismo radio en
 * cuanto cambia el zoom o la latitud. Calculando los vértices sobre la
 * esfera, el polígono es correcto siempre.
 *
 * Devuelve `steps + 1` puntos: el último repite el primero, que es como
 * GeoJSON exige cerrar un anillo.
 */
export function circleToPolygon(
  center: Position,
  radiusKm: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const [lng, lat] = center
  const angular = radiusKm / EARTH_RADIUS_KM
  const latRad = toRadians(lat)
  const lngRad = toRadians(lng)

  const ring: Position[] = []

  for (let i = 0; i <= steps; i += 1) {
    // El último vértice reutiliza el ángulo del primero: así el anillo
    // cierra exacto y no por redondeo.
    const bearing = ((i % steps) * 2 * Math.PI) / steps

    const pointLat = Math.asin(
      Math.sin(latRad) * Math.cos(angular) +
        Math.cos(latRad) * Math.sin(angular) * Math.cos(bearing),
    )

    const pointLng =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(latRad),
        Math.cos(angular) - Math.sin(latRad) * Math.sin(pointLat),
      )

    ring.push([toDegrees(pointLng), toDegrees(pointLat)])
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}

/**
 * Distancia para leer, no para calcular: "850 m" · "1,4 km" · "23 km".
 *
 * Por debajo del kilómetro se pasa a metros —"0,8 km" no dice nada— y a
 * partir de 10 km se quita el decimal, que ahí ya sobra.
 */
export function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km < 0) return ''

  if (km < 1) {
    // Redondeado a 50 m: fingir precisión de metro sería mentir
    const metres = Math.round((km * 1000) / 50) * 50
    return `${metres} m`
  }

  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`

  return `${Math.round(km)} km`
}
