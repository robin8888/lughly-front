/**
 * ProsMap Organism
 * Profesionales cercanos sobre el mapa (MAPS_MOBILE.md §5).
 *
 * **Agrupación desde el primer momento**, no cuando empiece a ir lento: en
 * Madrid hay decenas de profesionales en el mismo barrio y sin `cluster` los
 * marcadores se solapan y el mapa se arrastra.
 *
 * Los marcadores se pintan con capas de símbolos sobre una fuente GeoJSON y
 * no con una anotación por profesional: una vista nativa por marcador es
 * justo lo que hace que 200 pines vayan a tirones.
 *
 * La posición del usuario solo se muestra si ya concedió el permiso. Si no,
 * el mapa se centra donde le diga quien lo use —la ciudad de su perfil— y no
 * se le pide nada: un diálogo de sistema al abrir una pantalla se deniega por
 * reflejo, y entonces ya no se puede volver a preguntar.
 *
 * Nota de API: `MAPS_MOBILE.md` cita nombres de MapLibre v10 (`ShapeSource`,
 * `clusterMaxZoomLevel`). En la v11 instalada son `GeoJSONSource` y
 * `clusterMaxZoom`. El comportamiento pedido es el mismo.
 */

import { useMemo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { MapAttribution } from '@/components/molecules/MapAttribution'
import { MapUnavailable } from '@/components/molecules/MapUnavailable'
import { mapLibre } from '@/utils/mapLibre'
import type { ApiPro } from '@/api/pros.api'
import { CLUSTER_MAX_ZOOM, CLUSTER_RADIUS, MAP_STYLE } from '@/theme/map'
import type { Position } from '@/utils/geo'
import { theme } from '@/theme'
import { styles } from './ProsMap.styles'

/** Zoom inicial cuando se centra en una ciudad, no en un punto concreto */
const CITY_ZOOM = 11

export interface ProsMapPro extends ApiPro {
  /** Sin coordenadas no se puede pintar, así que se exigen aquí */
  latitude: number
  longitude: number
}

export interface ProsMapProps {
  pros: ProsMapPro[]
  center: Position
  /** Solo si ya hay permiso concedido: este componente no lo pide */
  showUserLocation?: boolean
  onSelectPro?: (id: string) => void
  /** La altura la fija quien lo usa: el mapa no decide cuánto ocupa */
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function ProsMap({
  pros,
  center,
  showUserLocation = false,
  onSelectPro,
  style,
  testID,
}: ProsMapProps) {
  const collection = useMemo<GeoJSON.FeatureCollection<GeoJSON.Point>>(
    () => ({
      type: 'FeatureCollection',
      features: pros.map((pro) => ({
        type: 'Feature',
        id: pro.id,
        // Solo lo que pinta el mapa. Nada de dirección ni datos personales:
        // el directorio público enseña la zona, no dónde vive nadie.
        properties: {
          id: pro.id,
          name: pro.name,
          availableNow: pro.availableNow,
        },
        geometry: { type: 'Point', coordinates: [pro.longitude, pro.latitude] },
      })),
    }),
    [pros],
  )

  // Después de los hooks, nunca antes: el orden debe ser estable entre renders
  if (!mapLibre) {
    return (
      <View style={style}>
        <MapUnavailable
          message={`${pros.length} ${pros.length === 1 ? 'profesional' : 'profesionales'} en esta búsqueda. Vuelve a la lista para verlos.`}
          testID="pros-map-unavailable"
        />
      </View>
    )
  }

  const { Camera, GeoJSONSource, Layer, Map, UserLocation } = mapLibre

  return (
    <View style={[styles.container, style]} testID={testID ?? 'pros-map'}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        attribution={false}
        logo={false}
        touchRotate={false}
        touchPitch={false}
        testID="pros-map-view"
      >
        <Camera center={center} zoom={CITY_ZOOM} duration={0} />

        {showUserLocation && <UserLocation />}

        <GeoJSONSource
          id="pros"
          data={collection}
          cluster
          clusterRadius={CLUSTER_RADIUS}
          clusterMaxZoom={CLUSTER_MAX_ZOOM}
          onPress={(event: {
            nativeEvent?: { features?: GeoJSON.Feature[] }
          }) => {
            const feature = event.nativeEvent?.features?.[0]
            const id = feature?.properties?.id as string | undefined
            // Un grupo no tiene `id` de profesional: al tocarlo el mapa hace
            // zoom solo, no hay a quién abrir.
            if (id) onSelectPro?.(id)
          }}
        >
          {/* Grupos: círculo con el número de profesionales dentro */}
          <Layer
            id="pros-clusters"
            type="circle"
            filter={['has', 'point_count']}
            paint={{
              'circle-color': theme.colors.accent,
              'circle-opacity': 0.9,
              // Crece con la cantidad, para que se vea de un vistazo dónde
              // hay más gente sin tener que leer el número
              'circle-radius': ['step', ['get', 'point_count'], 16, 10, 22, 50, 28],
              'circle-stroke-width': 2,
              'circle-stroke-color': theme.colors.cardBg,
            }}
          />
          <Layer
            id="pros-cluster-count"
            type="symbol"
            filter={['has', 'point_count']}
            layout={{
              'text-field': ['get', 'point_count_abbreviated'],
              'text-size': 13,
            }}
            paint={{ 'text-color': theme.colors.cardBg }}
          />

          {/* Sueltos: verde si puede ir ahora, acento en el resto */}
          <Layer
            id="pros-points"
            type="circle"
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['get', 'availableNow'],
                theme.colors.available,
                theme.colors.accent,
              ],
              'circle-radius': 9,
              'circle-stroke-width': 2,
              'circle-stroke-color': theme.colors.cardBg,
            }}
          />
        </GeoJSONSource>
      </Map>

      <MapAttribution />
    </View>
  )
}
