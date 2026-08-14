/**
 * StartCard Organism
 * "05 · Empezar" (HOME_MOBILE.md §3): tarjeta oscura de cierre.
 *
 * Como el hero, cambia el discurso según el rol.
 */

import { Text } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './StartCard.styles'

const COPY = {
  client: {
    title: '¿Tienes un trabajo entre manos?',
    action: 'Publicar trabajo gratis',
  },
  pro: {
    title: '¿Listo para tu próxima puja?',
    action: 'Buscar trabajos para pujar',
  },
} as const

export interface StartCardProps {
  role: 'client' | 'pro'
  onPress: () => void
  testID?: string
}

export function StartCard({ role, onPress, testID }: StartCardProps) {
  const copy = COPY[role]

  return (
    <InfoCard variant="dark" style={styles.card} testID={testID}>
      <Text style={styles.label}>05 · Empezar</Text>
      <Text style={styles.title}>{copy.title}</Text>
      <Button fullWidth onPress={onPress} testID="start-action">
        {copy.action}
      </Button>
    </InfoCard>
  )
}
