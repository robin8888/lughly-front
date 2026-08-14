/**
 * ReviewList Organism
 * Bloque "Valoraciones" de la ficha del profesional.
 *
 * Tres partes: el desglose por criterio sobre todas sus reseñas, la lista
 * paginada, y el botón de cargar más.
 *
 * El desglose va arriba y las reseñas debajo porque responden a preguntas
 * distintas: el desglose dice en qué es bueno (dato agregado, se lee en dos
 * segundos) y las reseñas dicen quién lo dice (prueba, se leen si interesa).
 *
 * Un profesional sin valoraciones no es un error ni una lista vacía: es
 * alguien que acaba de empezar, y así se le presenta.
 */

import { View, Text, ActivityIndicator } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { StarRating } from '@/components/atoms/StarRating'
import { InfoCard } from '@/components/molecules/InfoCard'
import { ReviewCard } from '@/components/molecules/ReviewCard'
import { useProReviews } from '@/hooks/domain/useProReviews'
import { REVIEW_CRITERIA } from '@/utils/reviewCriteria'
import { theme } from '@/theme'
import { styles } from './ReviewList.styles'

export interface ReviewListProps {
  proId: string
  /** Nombre del profesional, para el texto de "aún no tiene valoraciones" */
  proName: string
  /**
   * Sustituye el texto de "todavía sin valoraciones". Lo necesita la home del
   * profesional: ahí quien mira es él mismo, y hablarle en tercera persona
   * ("Lucía aún no ha recibido ninguna") suena a que le hablan de otro.
   */
  emptyMessage?: string
  testID?: string
}

export function ReviewList({
  proId,
  proName,
  emptyMessage,
  testID,
}: ReviewListProps) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProReviews(proId)

  const reviews = data?.pages.flatMap((page) => page.items) ?? []
  const first = data?.pages[0]
  const total = first?.total ?? 0

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Valoraciones</Text>

      {isPending ? (
        <View style={styles.state} testID="reviews-loading">
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      ) : isError ? (
        <InfoCard style={styles.stateCard}>
          <Text style={styles.stateTitle}>No hemos podido cargar las valoraciones</Text>
          <Text style={styles.stateBody}>
            El resto del perfil sí está. Puedes reintentarlo.
          </Text>
          <Button
            variant="secondary"
            onPress={() => void refetch()}
            style={styles.retry}
            testID="reviews-retry"
          >
            Reintentar
          </Button>
        </InfoCard>
      ) : total === 0 ? (
        <InfoCard style={styles.stateCard}>
          <Text style={styles.stateTitle}>Todavía sin valoraciones</Text>
          <Text style={styles.stateBody}>
            {emptyMessage ??
              `${proName} aún no ha recibido ninguna. Que no tenga no significa que trabaje mal: significa que acaba de empezar aquí.`}
          </Text>
        </InfoCard>
      ) : (
        <>
          {first?.criteriaAverages && (
            <InfoCard style={styles.breakdown} testID="reviews-breakdown">
              <Text style={styles.breakdownTitle}>Cómo le valoran</Text>

              {REVIEW_CRITERIA.map((criterion) => {
                const score = first.criteriaAverages![criterion.key]

                return (
                  <View key={criterion.key} style={styles.criterion}>
                    <Text style={styles.criterionLabel} numberOfLines={1}>
                      {criterion.label}
                    </Text>
                    <View style={styles.criterionScore}>
                      <StarRating rating={score} size={11} />
                      <Text style={styles.criterionValue}>{score.toFixed(1)}</Text>
                    </View>
                  </View>
                )
              })}

              {first.recommendRate !== null && (
                <Text style={styles.recommend}>
                  El {Math.round(first.recommendRate)}% de sus clientes lo
                  recomienda.
                </Text>
              )}
            </InfoCard>
          )}

          <Text style={styles.count}>
            {total} {total === 1 ? 'valoración' : 'valoraciones'}
          </Text>

          <View style={styles.list}>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                testID={`review-${review.id}`}
              />
            ))}
          </View>

          {hasNextPage && (
            <Button
              variant="secondary"
              fullWidth
              loading={isFetchingNextPage}
              onPress={() => void fetchNextPage()}
              style={styles.more}
              testID="reviews-more"
            >
              Ver más valoraciones
            </Button>
          )}
        </>
      )}
    </View>
  )
}
