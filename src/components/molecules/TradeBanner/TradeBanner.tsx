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
 * pregunta hecha desde otro sitio. Y **sin oficio ninguno**, cuando se está
 * mirando el directorio entero: ahí lleva la ilustración de "otros oficios",
 * que es la que dibuja el oficio como idea en vez de uno concreto.
 */

import { View, Text, Image, type StyleProp, type ViewStyle } from 'react-native'
import { getTradeImage, getTradeLabel } from '@/utils/trades'
import { styles } from './TradeBanner.styles'

export interface TradeBannerProps {
  /** Slug del oficio. Se acepta `string` porque el filtro del directorio lo es */
  trade: string
  /**
   * Qué pone en la banda, si no es el nombre del oficio.
   *
   * Lo usa el directorio sin filtrar: ahí el oficio es `otros` solo para
   * elegir la ilustración, y su nombre —"Otros oficios"— sería mentira sobre
   * una lista que los tiene todos.
   */
  label?: string
  /**
   * Para que la pantalla lo saque a sangre.
   *
   * La molécula no sabe con cuánto relleno la pinta quien la usa, así que el
   * margen negativo que cancela ese relleno tiene que venir de fuera: meterlo
   * aquí ataría la franja a las medidas de una pantalla concreta y la
   * rompería en la siguiente que la use.
   */
  style?: StyleProp<ViewStyle>
  testID?: string
}

export function TradeBanner({ trade, label, style, testID }: TradeBannerProps) {
  return (
    <View style={[styles.banner, style]} testID={testID}>
      <Image
        source={getTradeImage(trade)}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
        testID={testID ? `${testID}-image` : undefined}
      />

      <View style={styles.labelBar}>
        <Text style={styles.label} numberOfLines={1}>
          {label ?? getTradeLabel(trade)}
        </Text>
      </View>
    </View>
  )
}
