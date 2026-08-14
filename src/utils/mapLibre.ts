/**
 * Carga defensiva de MapLibre.
 *
 * MapLibre es código nativo: si la app corre en un binario compilado antes de
 * instalarlo —o en Expo Go, donde no existe— **el módulo revienta al
 * evaluarse**, no al usarse:
 *
 *   Invariant Violation: TurboModuleRegistry.getEnforcing(...):
 *   'MLRNCameraModule' could not be found.
 *
 * Con un `import` normal eso tumba la pantalla entera antes de renderizar
 * nada, y la culpa la pagan pantallas que solo enseñan el mapa en un rincón:
 * el directorio dejaba de abrirse por completo.
 *
 * **Este fichero no importa el paquete de ninguna forma, ni siquiera con
 * `import type`.** Un import de tipos debería desaparecer al compilar, pero
 * basta con que el empaquetador decida conservarlo para que la referencia
 * estática vuelva y el fallo ocurra antes de que exista el `try`. Por eso los
 * componentes se tipan aquí a mano, con la forma mínima que se usa.
 *
 * Cuando exista el development build, esto carga y no se nota.
 */

import type { ComponentType } from 'react'

/**
 * Tipado mínimo y deliberadamente laxo: solo describe que son componentes.
 * El contrato real lo comprueba TypeScript en cada uso a través de las props
 * que se les pasan, y el mock de los tests replica esta misma forma.
 */
type MapComponent = ComponentType<Record<string, unknown>>

export interface MapLibreModule {
  Map: MapComponent
  Camera: MapComponent
  GeoJSONSource: MapComponent
  Layer: MapComponent
  ViewAnnotation: MapComponent
  UserLocation: MapComponent
}

function load(): MapLibreModule | null {
  try {
    // `require` y no `import`: hace falta que el fallo sea capturable, y un
    // `import` se evalúa antes de que este `try` exista.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@maplibre/maplibre-react-native') as MapLibreModule
  } catch {
    return null
  }
}

export const mapLibre = load()

/** Falso si el binario no trae el módulo nativo (Expo Go o build antiguo). */
export const isMapAvailable = mapLibre !== null
