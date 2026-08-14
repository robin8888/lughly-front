/**
 * HowItWorks Organism
 * "02 · Cómo funciona" (HOME_MOBILE.md §3): tres tarjetas claras.
 *
 * Los textos explican el modelo de negocio y vienen literales del diseño.
 */

import { View, Text } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './HowItWorks.styles'

const STEPS = [
  {
    title: 'Publica tu trabajo',
    body: 'Describe qué necesitas, tu presupuesto orientativo y el plazo. Es gratis.',
  },
  {
    title: 'Recibe pujas',
    body: 'Los profesionales compiten con su oferta: precio, plazo y condiciones.',
  },
  {
    title: 'Adjudica tú mismo',
    body: 'Eliges al profesional valorando reputación, no solo el precio más bajo.',
  },
] as const

export function HowItWorks({ testID }: { testID?: string }) {
  return (
    <View style={styles.section} testID={testID}>
      <Text style={styles.sectionLabel}>02 · Cómo funciona</Text>

      <View style={styles.list}>
        {STEPS.map((step) => (
          <InfoCard key={step.title}>
            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.body}>{step.body}</Text>
          </InfoCard>
        ))}
      </View>
    </View>
  )
}
