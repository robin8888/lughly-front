/**
 * ReverseAuctionCard Organism
 * "03 · Subasta inversa" (HOME_MOBILE.md §3): tarjeta oscura.
 *
 * El titular es la regla de negocio que diferencia a Lughly y está recogida
 * en el README: "La puja más baja no gana automáticamente".
 */

import { Text } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './ReverseAuctionCard.styles'

export interface ReverseAuctionCardProps {
  onPublish: () => void
  testID?: string
}

export function ReverseAuctionCard({
  onPublish,
  testID,
}: ReverseAuctionCardProps) {
  return (
    <InfoCard variant="dark" style={styles.card} testID={testID}>
      <Text style={styles.label}>03 · Subasta inversa</Text>
      <Text style={styles.title}>
        La puja más baja no gana automáticamente
      </Text>
      <Text style={styles.body}>
        Comparas ofertas con toda la información y adjudicas al profesional que
        más te convence. Pago protegido en depósito hasta que el trabajo esté
        terminado.
      </Text>
      <Button fullWidth onPress={onPublish} testID="auction-publish">
        Publicar un trabajo
      </Button>
    </InfoCard>
  )
}
