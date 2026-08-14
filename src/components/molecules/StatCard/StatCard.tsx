/**
 * StatCard Molecule
 * Cifra con su etiqueta, según MobileApp.dc.html (`isPanel`, rejilla de dos
 * columnas).
 *
 * La etiqueta va arriba y pequeña, la cifra debajo y grande: se lee primero
 * el número, que es a lo que se viene, y solo después qué mide.
 */

import { View, Text } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles } from './StatCard.styles'

export interface StatCardProps {
  label: string
  /** Ya formateado. La tarjeta no decide decimales ni unidades. */
  value: string
  /** Aclaración opcional bajo la cifra ("de 8 valoraciones") */
  hint?: string
  testID?: string
}

export function StatCard({ label, value, hint, testID }: StatCardProps) {
  return (
    <InfoCard style={styles.card} testID={testID}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {hint && (
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      )}
    </InfoCard>
  )
}
