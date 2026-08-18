/**
 * HowItWorks Organism
 * Los tres pasos del modelo, en tres tarjetas claras.
 *
 * Los textos explican el modelo de negocio y vienen literales del diseño.
 *
 * Era la sección "02 · Cómo funciona" de la home (HOME_MOBILE.md §3). Ahora
 * vive dentro de la pantalla "Cómo funciona", así que perdió el número de
 * sección: fuera de la home no ordenaba nada.
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
      <Text style={styles.sectionLabel}>Paso a paso</Text>

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
