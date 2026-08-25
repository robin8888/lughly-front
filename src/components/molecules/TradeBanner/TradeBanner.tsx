/**
 * TradeBanner Molecule
 * La franja del oficio que encabeza una lista filtrada (25 Agosto 2026).
 *
 * Encabeza el directorio cuando hay un oficio buscado y gente que enseñar.
 * Viene de la home: allí la búsqueda se contesta con la ilustración del
 * oficio, y al abrir la lista esa misma ilustración sigue arriba. Sin ella el
 * salto es a una pantalla de filtros y fichas en la que hay que releer para
 * saber que sigues en lo que buscabas.
 *
 * También aparece buscando desde el propio directorio, que es la misma
 * pregunta hecha desde otro sitio.
 */

import { View, Text, Image } from 'react-native'
import { getTradeImage, getTradeLabel } from '@/utils/trades'
import { styles } from './TradeBanner.styles'

export interface TradeBannerProps {
  /** Slug del oficio. Se acepta `string` porque el filtro del directorio lo es */
  trade: string
  testID?: string
}

export function TradeBanner({ trade, testID }: TradeBannerProps) {
  return (
    <View style={styles.banner} testID={testID}>
      <Image
        source={getTradeImage(trade)}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
        testID={testID ? `${testID}-image` : undefined}
      />

      <View style={styles.labelBar}>
        <Text style={styles.label} numberOfLines={1}>
          {getTradeLabel(trade)}
        </Text>
      </View>
    </View>
  )
}
