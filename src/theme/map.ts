/**
 * Tokens del mapa (MAPS_MOBILE.md §2).
 *
 * MapLibre con teselas de OpenFreeMap: sin cuenta, sin clave de API y sin
 * facturación. La URL del estilo vive **solo aquí**: si algún día se pasa a
 * MapTiler o a teselas autoalojadas, es esta línea y ninguna más.
 *
 * Si se migrase a un proveedor con clave, la clave se sirve desde el backend
 * y no se compila en la app (requisito M1 de OWASP).
 */

export const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

/**
 * Obligatoria por la licencia ODbL de OpenStreetMap: tiene que verse
 * **sobre el mapa**, no escondida en una pantalla de ajustes.
 */
export const MAP_ATTRIBUTION = '© OpenStreetMap contributors'

/** Centro por defecto: Madrid. Ojo al orden, MapLibre usa [lng, lat]. */
export const DEFAULT_CENTER: [number, number] = [-3.7038, 40.4168]

/** Radio de cobertura que puede fijar un profesional, en km */
export const MIN_RADIUS_KM = 1
export const MAX_RADIUS_KM = 50

/** Agrupación de marcadores en ProsMap (MAPS_MOBILE.md §5) */
export const CLUSTER_RADIUS = 50
export const CLUSTER_MAX_ZOOM = 14
