/**
 * MapMarker Atom
 * El punto que representa a alguien en el mapa (MAPS_MOBILE.md §3 y §5).
 *
 * Solo pinta. No sabe de coordenadas ni de mapas: quien lo use lo mete
 * dentro de un `Marker` de MapLibre. Así se puede probar sin montar un mapa.
 *
 * El color es semántico y viene del README: verde `available` si puede ir
 * ahora, rojo `urgency` para una urgencia, y el acento en el resto.
 */

import { View } from 'react-native'
import { styles, variantStyles } from './MapMarker.styles'

export type MapMarkerVariant = 'default' | 'available' | 'urgency'

export interface MapMarkerProps {
  variant?: MapMarkerVariant
  /** Resalta el marcador seleccionado, que crece y gana borde */
  selected?: boolean
  testID?: string
}

export function MapMarker({
  variant = 'default',
  selected = false,
  testID,
}: MapMarkerProps) {
  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        selected && styles.selected,
      ]}
      testID={testID ?? `map-marker-${variant}`}
    />
  )
}
