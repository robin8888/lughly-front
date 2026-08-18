/**
 * ReverseAuctionCard Organism
 * La regla que diferencia a Lughly: "La puja más baja no gana
 * automáticamente", recogida en el README.
 *
 * Era la sección "03 · Subasta inversa" de la home (HOME_MOBILE.md §3). Ahora
 * vive dentro de la pantalla "Cómo funciona", junto a los tres pasos, que es
 * donde una regla del modelo se puede leer con calma; suelta en mitad de la
 * home era un anuncio.
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
    <InfoCard style={styles.card} testID={testID}>
      <Text style={styles.label}>Subasta inversa</Text>
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
