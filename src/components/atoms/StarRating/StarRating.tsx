/**
 * StarRating Atom
 * Muestra valoración con estrellas (solo lectura o interactivo)
 */

import { View, Text, Pressable } from 'react-native'
import { styles } from './StarRating.styles'

export interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  testID?: string
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange,
  showValue = false,
  testID,
}: StarRatingProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1)

  const handlePress = (value: number) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.stars}>
        {stars.map((star) => {
          const filled = star <= Math.round(rating)
          const StarComponent = interactive ? Pressable : View

          return (
            <StarComponent
              key={star}
              onPress={() => handlePress(star)}
              disabled={!interactive}
              /*
                Cada estrella se puede señalar cuando se puede tocar: sin esto,
                lo único que se puede probar de una valoración es que se pinta.
              */
              {...(interactive && {
                accessibilityRole: 'button' as const,
                accessibilityLabel: `${star} ${star === 1 ? 'estrella' : 'estrellas'}`,
                ...(testID && { testID: `${testID}-star-${star}` }),
              })}
              style={styles.starWrapper}
            >
              <Text
                style={[
                  styles.star,
                  /*
                    El alto de línea sale del tamaño y no de una constante: el
                    glifo de la estrella se sale de su caja si la línea es más
                    baja que él, y se ve cortado. El 1,2 da aire arriba y abajo
                    sin separar las estrellas entre sí.
                  */
                  { fontSize: size, lineHeight: Math.round(size * 1.2) },
                  filled ? styles.filled : styles.empty,
                ]}
              >
                ★
              </Text>
            </StarComponent>
          )
        })}
      </View>
      {showValue && (
        <Text style={styles.value}>{rating.toFixed(1)}</Text>
      )}
    </View>
  )
}
