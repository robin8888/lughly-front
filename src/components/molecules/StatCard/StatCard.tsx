/**
 * StatCard Molecule
 * Cifra con su etiqueta, según MobileApp.dc.html (`isPanel`, rejilla de dos
 * columnas).
 *
 * La etiqueta va arriba y pequeña, la cifra debajo y grande: se lee primero
 * el número, que es a lo que se viene, y solo después qué mide.
 */

import { View, Text } from 'react-native'
import { StarRating } from '@/components/atoms/StarRating'
import { InfoCard } from '@/components/molecules/InfoCard'
import { styles, STAR_SIZE } from './StatCard.styles'

export interface StatCardProps {
  label: string
  /** Ya formateado. La tarjeta no decide decimales ni unidades. */
  value: string
  /**
   * Valoración de 0 a 5. Si se pasa, bajo la cifra salen las cinco estrellas
   * pintadas según ella.
   *
   * Es opcional porque la mayoría de estas tarjetas miden cosas que no son
   * puntuaciones —kilómetros, tarifas, trabajos terminados— y ahí unas
   * estrellas no significarían nada.
   */
  rating?: number
  /** Aclaración opcional bajo la cifra ("de 8 valoraciones") */
  hint?: string
  testID?: string
}

export function StatCard({ label, value, rating, hint, testID }: StatCardProps) {
  return (
    <InfoCard style={styles.card} testID={testID}>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {/*
        Envuelto porque `StarRating` no acepta estilos y aquí necesita
        separarse de la cifra, que va pegada arriba.
      */}
      {rating != null && (
        <View style={styles.stars}>
          <StarRating
            rating={rating}
            size={STAR_SIZE}
            testID={testID ? `${testID}-stars` : undefined}
          />
        </View>
      )}
      {hint && (
        <Text style={styles.hint} numberOfLines={2}>
          {hint}
        </Text>
      )}
    </InfoCard>
  )
}
