/**
 * ReviewCard Molecule
 * Una valoración, según Perfil.dc.html (sección "Valoraciones").
 *
 * El diseño web enseña solo la media de la reseña. Las ocho notas van detrás
 * de "Ver las 8 notas": pintarlas siempre convertiría una lista de tres
 * reseñas en veinticuatro filas de estrellas, y nadie las lee. Quien quiera
 * el detalle lo abre; el resto ve firma, nota y comentario, que es lo que
 * decide si contratar.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { StarRating } from '@/components/atoms/StarRating'
import { Tag } from '@/components/atoms/Tag'
import { InfoCard } from '@/components/molecules/InfoCard'
import type { ApiReview } from '@/api/pros.api'
import { REVIEW_CRITERIA } from '@/utils/reviewCriteria'
import { relativeDate } from '@/utils/relativeDate'
import { styles } from './ReviewCard.styles'

export interface ReviewCardProps {
  review: ApiReview
  testID?: string
}

export function ReviewCard({ review, testID }: ReviewCardProps) {
  const [showCriteria, setShowCriteria] = useState(false)

  /*
    En una constante y no leyéndolo dentro del map: TypeScript pierde ahí que
    ya se ha comprobado que no es nulo, porque el map recibe una función y
    nadie le garantiza cuándo se llama.
  */
  const criteria = review.criteria

  return (
    <InfoCard style={styles.card} testID={testID}>
      <View style={styles.head}>
        <Text style={styles.author} numberOfLines={1}>
          {review.authorLabel}
        </Text>
        <Text style={styles.date}>{relativeDate(review.createdAt)}</Text>
      </View>

      <View style={styles.ratingRow}>
        <StarRating rating={review.average} size={13} />
        <Text style={styles.average}>{review.average.toFixed(1)}</Text>
        {review.recommends && (
          <Tag variant="available" style={styles.recommendTag}>
            Lo recomienda
          </Tag>
        )}
      </View>

      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}

      {/*
        Las ocho notas solo si las hay. Una valoración dejada al dar por bueno
        el trabajo trae una nota y un comentario, así que ofrecer "ver las 8
        notas" para abrir ocho huecos vacíos sería prometer lo que no hay.
      */}
      {review.criteria && (
        <Pressable
          onPress={() => setShowCriteria((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded: showCriteria }}
          testID={`${testID ?? 'review'}-toggle`}
        >
          <Text style={styles.toggle}>
            {showCriteria ? 'Ocultar las notas' : 'Ver las 8 notas'}
          </Text>
        </Pressable>
      )}

      {showCriteria && criteria && (
        <View style={styles.criteria} testID={`${testID ?? 'review'}-criteria`}>
          {REVIEW_CRITERIA.map((criterion) => (
            <View key={criterion.key} style={styles.criterion}>
              <View style={styles.criterionText}>
                <Text style={styles.criterionLabel}>{criterion.label}</Text>
                <Text style={styles.criterionHint}>{criterion.hint}</Text>
              </View>
              <StarRating rating={criteria[criterion.key]} size={11} />
            </View>
          ))}
        </View>
      )}

      {review.proResponse && (
        <View style={styles.response}>
          <Text style={styles.responseTitle}>Respuesta del profesional</Text>
          <Text style={styles.responseBody}>{review.proResponse}</Text>
        </View>
      )}
    </InfoCard>
  )
}
