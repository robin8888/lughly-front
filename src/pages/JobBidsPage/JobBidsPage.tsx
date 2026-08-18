/**
 * JobBidsPage
 * Las pujas que ha recibido un trabajo, y la adjudicación.
 *
 * Es el paso que cerraba la subasta inversa: hasta ahora se publicaba, llegaban
 * pujas y el cliente no tenía forma de elegir.
 *
 * La lista viene de más barata a más cara, que es como se mira, pero **cada
 * puja lleva su reputación al lado**. Si solo se viera el precio, la subasta la
 * ganaría siempre el más barato, y en oficios el barato que hace mal el trabajo
 * sale carísimo. Por eso la valoración y los trabajos terminados están tan a la
 * vista como el importe, y la más barata no va marcada como "la mejor".
 */

import { View, Text, ActivityIndicator, Pressable, Image, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Icon } from '@/components/atoms/Icon'
import { Money } from '@/components/atoms/Money'
import { StarRating } from '@/components/atoms/StarRating'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useJobBids, useAwardBid } from '@/hooks/domain/useJobBids'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { API_BASE_URL } from '@/api'
import type { ApiJobBid } from '@/api/bids.api'
import { theme } from '@/theme'
import { styles } from './JobBidsPage.styles'

export interface JobBidsPageProps {
  jobId: string | undefined
  /** Para encabezar la pantalla; puede no estar si se entra por enlace */
  jobTitle?: string
  onBack: () => void
  onAwarded: () => void
}

export function JobBidsPage({
  jobId,
  jobTitle,
  onBack,
  onAwarded,
}: JobBidsPageProps) {
  const onScroll = useNavScrollHandler()
  const { data, isPending, isError, refetch } = useJobBids(jobId)
  const { award, isAwarding } = useAwardBid(jobId)

  const bids = data?.items ?? []
  const cheapest = bids.length > 0 ? Math.min(...bids.map((bid) => bid.amount)) : null

  /**
   * Se pregunta antes, y con nombre e importe dentro: adjudicar cierra la
   * subasta, rechaza a los demás y compromete al cliente con un precio. No es
   * una acción que se pueda deshacer desde la app.
   */
  const confirm = (bid: ApiJobBid) => {
    Alert.alert(
      `Adjudicar a ${bid.proName}`,
      `${bid.amount} € y ${bid.estimatedDays} ${bid.estimatedDays === 1 ? 'día' : 'días'} de plazo.\n\nSe cerrará la subasta y las demás pujas quedarán rechazadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adjudicar',
          onPress: () => {
            void award(bid.id).then(({ ok, result, error }) => {
              if (!ok) {
                /*
                 * `error` nulo significa que ya se ha atendido en otro sitio:
                 * hoy, la puerta de "te falta el documento", que enseña su
                 * propio aviso con el botón para subirlo. Poner encima un
                 * "no se ha podido adjudicar" taparía la única salida.
                 */
                if (error) {
                  Alert.alert('No se ha podido adjudicar', error)
                }
                return
              }

              Alert.alert(
                'Subasta adjudicada',
                result?.awaitingWorker
                  ? `${result.awardedToName} tiene el trabajo por ${result.amount} €. Nos dirán a cuál de su equipo mandan y te lo enseñaremos en tus trabajos.`
                  : `${result?.awardedToName} tiene el trabajo por ${result?.amount} €. Ya tiene tu dirección.`,
              )
              onAwarded()
            })
          },
        },
      ],
    )
  }

  return (
    <View style={styles.screen} testID="job-bids-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {jobTitle ?? 'Pujas recibidas'}
        </Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="job-bids-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar las pujas"
            message="Revisa tu conexión e inténtalo de nuevo."
            illustration="greeting"
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'job-bids-retry' },
            ]}
            testID="job-bids-error"
          />
        ) : bids.length === 0 ? (
          <EmptyState
            title="Todavía no hay pujas"
            message="Los profesionales de tu oficio ven el trabajo en su lista de ofertas. Suele haber movimiento en las primeras horas."
            illustration="none"
            testID="job-bids-empty"
          />
        ) : (
          <>
            <Text style={styles.intro}>
              Compara las tres cosas, no solo el precio: cuánto, en cuánto
              tiempo y con qué valoración. La más barata no siempre sale más
              barata.
            </Text>

            <View style={styles.list}>
              {bids.map((bid) => (
                <InfoCard key={bid.id} testID={`bid-${bid.id}`}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      {bid.avatarUrl ? (
                        <Image
                          source={{ uri: `${API_BASE_URL}${bid.avatarUrl}` }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Icon name="user-circle" size={20} color={theme.colors.accent} />
                      )}
                    </View>

                    <View style={styles.identity}>
                      <Text style={styles.proName} numberOfLines={1}>
                        {bid.proName}
                      </Text>

                      {/**
                       * Con plantilla, se dice: se contrata a la empresa y
                       * quien venga se sabrá después. Callarlo dejaría al
                       * cliente esperando a una persona concreta.
                       */}
                      {bid.staffCount > 0 && (
                        <Text style={styles.staff}>
                          Empresa con {bid.staffCount}{' '}
                          {bid.staffCount === 1 ? 'trabajador' : 'trabajadores'} · te
                          dirán quién viene
                        </Text>
                      )}

                      <View style={styles.reputation}>
                        {bid.reviewCount > 0 ? (
                          <>
                            <StarRating rating={bid.rating} size={12} />
                            <Text style={styles.ratingValue}>
                              {bid.rating.toFixed(1)}
                            </Text>
                            <Text style={styles.reviewCount}>
                              ({bid.reviewCount})
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.noReviews}>Sin valoraciones aún</Text>
                        )}
                      </View>

                      {bid.completedJobs > 0 && (
                        <Text style={styles.completed}>
                          {bid.completedJobs}{' '}
                          {bid.completedJobs === 1
                            ? 'trabajo terminado'
                            : 'trabajos terminados'}
                        </Text>
                      )}
                    </View>

                    <View style={styles.numbers}>
                      <Money amount={bid.amount} size="small" style={styles.amount} />
                      <Text style={styles.days}>
                        {bid.estimatedDays}{' '}
                        {bid.estimatedDays === 1 ? 'día' : 'días'}
                      </Text>
                      {/**
                       * "La más baja" es un dato, no una recomendación: se
                       * marca en gris y sin adjetivos, para no empujar a
                       * decidir por precio.
                       */}
                      {bid.amount === cheapest && (
                        <Text style={styles.cheapest}>la más baja</Text>
                      )}
                    </View>
                  </View>

                  {bid.verified && (
                    <View style={styles.tags}>
                      <Tag variant="accent">Identidad verificada</Tag>
                    </View>
                  )}

                  {bid.conditions && (
                    <Text style={styles.conditions}>{bid.conditions}</Text>
                  )}

                  <Pressable
                    onPress={() => confirm(bid)}
                    disabled={isAwarding}
                    style={styles.awardButton}
                    accessibilityRole="button"
                    testID={`bid-${bid.id}-award`}
                  >
                    <Text style={styles.awardText}>Adjudicar a este</Text>
                  </Pressable>
                </InfoCard>
              ))}
            </View>

            <Text style={styles.note}>
              Al adjudicar se cierra la subasta y las demás pujas quedan
              rechazadas. Tu dirección se entrega solo a quien acabe haciendo el
              trabajo.
            </Text>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
