/**
 * ProCard Molecule
 * Tarjeta de profesional destacado (HOME_MOBILE.md §3, sección 04).
 *
 * Tarifa en accent700 y estrella dorada con la nota: el precio y la
 * reputación son lo que el cliente compara de un vistazo.
 */

import { View, Text, Pressable } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './ProCard.styles'

export interface ProCardData {
  name: string
  tradeLabel: string
  city: string
  rate: string
  rating: string
  bio: string
}

export interface ProCardProps {
  pro: ProCardData
  onPress: () => void
  testID?: string
}

export function ProCard({ pro, onPress, testID }: ProCardProps) {
  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="button">
      <InfoCard>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.name}>{pro.name}</Text>
            <Text style={styles.meta}>
              {pro.tradeLabel} · {pro.city}
            </Text>
          </View>

          <View style={styles.numbers}>
            <Text style={styles.rate}>{pro.rate}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.rating}>{pro.rating}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.bio}>{pro.bio}</Text>
      </InfoCard>
    </Pressable>
  )
}
