/**
 * FeaturedPros Organism
 * "04 · Profesionales destacados" (HOME_MOBILE.md §3).
 *
 * Datos de ejemplo tomados de MobileApp.dc.html (workersRaw). Se sustituyen
 * por `GET /v1/pros` cuando exista el endpoint; la forma de `ProCardData` ya
 * es la que devolverá.
 */

import { View, Text } from 'react-native'
import { ProCard, type ProCardData } from '@/components/molecules/ProCard'
import { getTradeLabel } from '@/utils/trades'
import { styles } from './FeaturedPros.styles'

const FEATURED: (Omit<ProCardData, 'tradeLabel'> & { trade: string })[] = [
  {
    name: 'Lucía Fernández',
    trade: 'fontaneria',
    city: 'Madrid',
    rate: '28 €/h',
    rating: '4.9',
    bio: 'Especialista en fugas y reformas de baño. Presupuesto sin compromiso el mismo día.',
  },
  {
    name: 'Marco Ruiz',
    trade: 'electricidad',
    city: 'Valencia',
    rate: '32 €/h',
    rating: '4.8',
    bio: 'Instalaciones certificadas y cuadros eléctricos con boletín en regla.',
  },
  {
    name: 'Ana Torres',
    trade: 'carpinteria',
    city: 'Sevilla',
    rate: '26 €/h',
    rating: '4.7',
    bio: 'Carpintería a medida: armarios empotrados, tarima y restauración de muebles.',
  },
]

export interface FeaturedProsProps {
  onSelectPro: () => void
  testID?: string
}

export function FeaturedPros({ onSelectPro, testID }: FeaturedProsProps) {
  return (
    <View style={styles.section} testID={testID}>
      <Text style={styles.sectionLabel}>04 · Profesionales destacados</Text>

      <View style={styles.list}>
        {FEATURED.map((pro) => (
          <ProCard
            key={pro.name}
            pro={{ ...pro, tradeLabel: getTradeLabel(pro.trade) }}
            onPress={onSelectPro}
            testID={`featured-pro-${pro.trade}`}
          />
        ))}
      </View>
    </View>
  )
}
