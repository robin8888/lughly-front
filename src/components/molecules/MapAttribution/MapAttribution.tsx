/**
 * MapAttribution Molecule
 * "© OpenStreetMap contributors" sobre el mapa.
 *
 * **No es decoración: lo exige la licencia ODbL** de OpenStreetMap, y tiene
 * que verse encima del mapa, no escondida en una pantalla de ajustes. Sin
 * ella la app no debería pasar revisión.
 *
 * Por eso no recibe ninguna prop para ocultarla: si se pudiera apagar,
 * alguien la apagaría.
 */

import { View, Text } from 'react-native'
import { MAP_ATTRIBUTION } from '@/theme/map'
import { styles } from './MapAttribution.styles'

export interface MapAttributionProps {
  testID?: string
}

export function MapAttribution({ testID }: MapAttributionProps) {
  return (
    <View style={styles.container} pointerEvents="none" testID={testID ?? 'map-attribution'}>
      <Text style={styles.text}>{MAP_ATTRIBUTION}</Text>
    </View>
  )
}
