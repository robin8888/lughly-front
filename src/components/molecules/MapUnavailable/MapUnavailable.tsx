/**
 * MapUnavailable Molecule
 * Lo que se ve en lugar del mapa cuando el binario no trae MapLibre.
 *
 * Pasa en Expo Go y en cualquier development build anterior a la instalación
 * de MapLibre. No es un error del usuario ni algo que pueda arreglar, así que
 * no se le ofrece reintentar: se le dice qué falta y se le da la información
 * en palabras, que es lo que venía a buscar.
 */

import { View, Text } from 'react-native'
import { styles } from './MapUnavailable.styles'

export interface MapUnavailableProps {
  /** Lo que el mapa habría contado, dicho con texto */
  message: string
  testID?: string
}

export function MapUnavailable({ message, testID }: MapUnavailableProps) {
  return (
    <View style={styles.container} testID={testID ?? 'map-unavailable'}>
      <Text style={styles.title}>Mapa no disponible</Text>
      <Text style={styles.body}>{message}</Text>
      <Text style={styles.hint}>
        Los mapas necesitan una compilación nativa de la app. Aparecerán en la
        próxima versión que instales.
      </Text>
    </View>
  )
}
