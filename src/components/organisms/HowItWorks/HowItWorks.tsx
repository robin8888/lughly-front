/**
 * HowItWorks Organism
 * Los tres pasos del modelo, en tres tarjetas claras.
 *
 * Era la sección "02 · Cómo funciona" de la home (HOME_MOBILE.md §3). Ahora
 * vive dentro de la pantalla "Cómo funciona", así que perdió el número de
 * sección: fuera de la home no ordenaba nada.
 *
 * Reescritos el 22 Ago 2026 al retirar la subasta (v3 §0): los tres pasos
 * describían "publica y recibe pujas", que ya no existe. Ahora describen el
 * directorio y los tres modos de cobro (COMO_SE_CONTRATA.md v3 §2).
 */

import { View, Text } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './HowItWorks.styles'

const STEPS = [
  {
    title: 'Busca en el directorio',
    body: 'Encuentra profesionales valorados por oficio, zona y disponibilidad.',
  },
  {
    title: 'Encárgale el trabajo',
    body: 'Por hora, a tarifa cerrada o pidiendo presupuesto: eliges cómo, según lo que ofrezca.',
  },
  {
    title: 'Págalo por la app',
    body: 'El cobro pasa siempre por Lughly, con el dinero retenido hasta que el trabajo esté hecho.',
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
