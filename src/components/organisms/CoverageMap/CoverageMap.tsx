/**
 * CoverageMap Organism
 * El radio de cobertura (MAPS_MOBILE.md §4).
 *
 * Lo edita el profesional en Disponibilidad y lo ve el cliente en la ficha,
 * en solo lectura.
 *
 * **El círculo es un polígono geodésico, no una vista redonda.** Se genera
 * con `circleToPolygon` y se pinta con `GeoJSONSource` + una capa de relleno
 * y otra de línea. Dibujarlo con un `View` circular parece más simple y está
 * mal: sobre Mercator, un círculo de pantalla deja de representar el mismo
 * radio en cuanto cambia el zoom o la latitud.
 *
 * Nota sobre la API: `MAPS_MOBILE.md` cita `MapView`, `ShapeSource`,
 * `FillLayer` y `PointAnnotation`, que son de MapLibre v10. En la v11
 * instalada se llaman `Map`, `GeoJSONSource`, `Layer type="fill"` y
 * `ViewAnnotation`. El comportamiento pedido es el mismo.
 */

import { useMemo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { MapMarker } from '@/components/atoms/MapMarker'
import { MapAttribution } from '@/components/molecules/MapAttribution'
import { MapUnavailable } from '@/components/molecules/MapUnavailable'
import { mapLibre } from '@/utils/mapLibre'
import { circleToPolygon, type Position } from '@/utils/geo'
import { MAP_STYLE } from '@/theme/map'
import { theme } from '@/theme'
import { styles } from './CoverageMap.styles'

/** Márgenes al encuadrar el círculo, para que no toque los bordes */
const FIT_PADDING = 24

export interface CoverageMapProps {
  /** Centro en [lng, lat], como espera MapLibre */
  center: Position
  radiusKm: number
  /** Permite mover el centro arrastrando el marcador */
  editable?: boolean
  onChange?: (center: Position, radiusKm: number) => void
  /** La altura la fija quien lo usa: el mapa no decide cuánto ocupa */
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function CoverageMap({
  center,
  radiusKm,
  editable = false,
  onChange,
  style,
  testID,
}: CoverageMapProps) {
  const circle = useMemo(
    () => circleToPolygon(center, radiusKm),
    [center, radiusKm],
  )

  /**
   * La cámara se encuadra al círculo con `bounds`, no con un `zoom` fijo:
   * un radio de 1 km y otro de 50 necesitan zooms muy distintos y con un
   * valor fijo uno se sale de pantalla y el otro queda diminuto.
   */
  const bounds = useMemo(() => {
    const ring = circle.geometry.coordinates[0] ?? []
    const lngs = ring.map((point: GeoJSON.Position) => point[0] as number)
    const lats = ring.map((point: GeoJSON.Position) => point[1] as number)

    // [oeste, sur, este, norte], el orden plano que usa MapLibre v11
    return [
      Math.min(...lngs),
      Math.min(...lats),
      Math.max(...lngs),
      Math.max(...lats),
    ] as [number, number, number, number]
  }, [circle])

  // Después de los hooks, nunca antes: el orden debe ser estable entre renders
  if (!mapLibre) {
    return (
      <View style={style}>
        <MapUnavailable
          message={`Zona de trabajo de ${radiusKm} km a la redonda.`}
          testID="coverage-map-unavailable"
        />
      </View>
    )
  }

  const { Camera, GeoJSONSource, Layer, Map, ViewAnnotation } = mapLibre

  return (
    <View style={[styles.container, style]} testID={testID ?? 'coverage-map'}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        // La atribución y el logo propios se apagan: ponemos los nuestros,
        // que la licencia exige verlos siempre y en sitio conocido.
        attribution={false}
        logo={false}
        compass={false}
        // Girar e inclinar no aportan nada aquí y descolocan el encuadre
        touchRotate={false}
        touchPitch={false}
        testID="coverage-map-view"
      >
        <Camera
          bounds={bounds}
          padding={{
            top: FIT_PADDING,
            bottom: FIT_PADDING,
            left: FIT_PADDING,
            right: FIT_PADDING,
          }}
          duration={0}
        />

        <GeoJSONSource id="coverage-circle" data={circle}>
          <Layer
            id="coverage-fill"
            type="fill"
            paint={{
              'fill-color': theme.colors.accent,
              'fill-opacity': 0.15,
            }}
          />
          <Layer
            id="coverage-line"
            type="line"
            paint={{
              'line-color': theme.colors.accent,
              'line-width': 2,
            }}
          />
        </GeoJSONSource>

        <ViewAnnotation
          id="coverage-center"
          lngLat={center}
          draggable={editable}
          onDragEnd={(event: { nativeEvent: { lngLat: Position } }) => {
            // Solo en modo edición: en lectura el marcador no se mueve y
            // este callback no debería llegar nunca.
            if (!editable) return
            onChange?.(event.nativeEvent.lngLat, radiusKm)
          }}
        >
          <MapMarker testID="coverage-center-marker" />
        </ViewAnnotation>
      </Map>

      <MapAttribution />
    </View>
  )
}
