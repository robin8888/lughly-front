/**
 * ProProfilePage
 * Ficha del profesional, según MobileApp.dc.html (isPerfil).
 *
 * Se muestra únicamente lo que el backend sabe hoy. Del diseño quedan fuera,
 * a propósito, dos bloques que necesitan tablas que aún no existen:
 *
 * - Rejilla de disponibilidad por día y franja: `Availability` es de la Fase 6.
 * - Mapa de cobertura: Día 11. Mientras tanto, el radio se dice con palabras.
 *
 * El resumen de reputación por IA tampoco está: ya hay valoraciones, pero
 * resumirlas exige una llamada a un modelo y decidir cuándo se recalcula.
 *
 * Inventarlos con datos de mentira daría una ficha bonita y falsa, que es
 * justo lo que un marketplace de confianza no se puede permitir.
 */

import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { StarRating } from '@/components/atoms/StarRating'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { CoverageMap } from '@/components/organisms/CoverageMap'
import { ReviewList } from '@/components/organisms/ReviewList'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { surchargesSummary } from '@/utils/surcharges'
import { ApiError, API_BASE_URL } from '@/api'
import { theme } from '@/theme'
import { styles } from './ProProfilePage.styles'

/**
 * Umbral de "Top valorada". Se exige también un número mínimo de reseñas:
 * un 5,0 con dos valoraciones no dice nada y destacarlo engaña al cliente.
 */
const TOP_RATED_MIN_RATING = 4.8
const TOP_RATED_MIN_REVIEWS = 20

export interface ProProfilePageProps {
  id: string | undefined
  onBack: () => void
  onBook: () => void
  onQuote: () => void
  onMessage: () => void
  onReport: () => void
}

export function ProProfilePage({
  id,
  onBack,
  onBook,
  onQuote,
  onMessage,
  onReport,
}: ProProfilePageProps) {
  const { data: pro, isPending, isError, error, refetch } = useProProfile(id)

  const header = (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Volver"
        testID="pro-back"
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.headerTitle}>Perfil</Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="pro-profile-page">
        {header}
        <View style={styles.state} testID="pro-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.stateText}>Cargando el perfil…</Text>
        </View>
      </View>
    )
  }

  if (isError || !pro) {
    // Un 404 no es un fallo de red: el perfil ya no está. Distinguirlo evita
    // ofrecer un "Reintentar" que nunca va a funcionar.
    const isGone = error instanceof ApiError && error.status === 404

    return (
      <View style={styles.screen} testID="pro-profile-page">
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <EmptyState
            title={isGone ? 'Este perfil ya no está' : 'No hemos podido cargar el perfil'}
            message={
              isGone
                ? 'Puede que haya dejado la plataforma. Busca otro profesional del mismo oficio.'
                : 'Revisa tu conexión e inténtalo de nuevo.'
            }
            illustration="greeting"
            actions={[
              ...(isGone
                ? []
                : [
                    {
                      label: 'Reintentar',
                      onPress: () => void refetch(),
                      testID: 'pro-retry',
                    },
                  ]),
              {
                label: 'Volver al directorio',
                onPress: onBack,
                variant: 'secondary' as const,
                testID: 'pro-back-empty',
              },
            ]}
            testID="pro-error"
          />
        </ScrollView>
      </View>
    )
  }

  const isTopRated =
    pro.rating >= TOP_RATED_MIN_RATING && pro.reviewCount >= TOP_RATED_MIN_REVIEWS

  return (
    <View style={styles.screen} testID="pro-profile-page">
      {header}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identity}>
          <View style={styles.avatar}>
            {pro.avatarUrl ? (
              <Image
                source={{ uri: `${API_BASE_URL}${pro.avatarUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="user-circle" size={32} color={theme.colors.accent} />
            )}
          </View>

          {/**
           * Igual que en el directorio: si trabaja para alguien, el titular
           * es el empleador. Es a quien se contrata y quien factura; el
           * trabajador es quien va a ir a la casa.
           */}
          <View style={styles.identityText}>
            <Text style={styles.name} numberOfLines={2}>
              {pro.employerName ?? pro.name}
            </Text>
            {pro.employerName && (
              <Text style={styles.worker} numberOfLines={1}>
                Trabajo de {pro.name}
              </Text>
            )}
            <Text style={styles.trade} numberOfLines={1}>
              {pro.tradeLabel} · {pro.city}
            </Text>
          </View>
        </View>

        <View style={styles.tags}>
          {pro.availableNow && <Tag variant="available">Disponible ahora</Tag>}
          {pro.verified && <Tag variant="accent">Identidad verificada</Tag>}
          {pro.licenseVerified && <Tag variant="accent">Habilitación verificada</Tag>}
          {isTopRated && <Tag variant="accent2">Top valorada</Tag>}
        </View>

        <View style={styles.headline}>
          <Text style={styles.rate}>{pro.hourlyRate} €/h</Text>

          <View style={styles.rating}>
            <StarRating rating={pro.rating} size={13} />
            <Text style={styles.ratingValue}>{pro.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>
              ({pro.reviewCount} {pro.reviewCount === 1 ? 'reseña' : 'reseñas'})
            </Text>
          </View>
        </View>

        {pro.bio && <Text style={styles.bio}>{pro.bio}</Text>}

        {pro.completedJobs > 0 && (
          <Text style={styles.completed}>
            {pro.completedJobs}{' '}
            {pro.completedJobs === 1
              ? 'trabajo terminado en Lughly'
              : 'trabajos terminados en Lughly'}
          </Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recargos</Text>
          <Text style={styles.sectionBody}>{surchargesSummary()}</Text>
          <Text style={styles.sectionNote}>
            No se suman entre sí: se aplica el más alto. Verás el importe exacto
            antes de confirmar.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona de cobertura</Text>
          <Text style={styles.sectionBody}>
            Se desplaza hasta {pro.radiusKm} km desde su base en {pro.city}.
          </Text>

          {/**
           * El mapa solo si hay punto base. Un profesional que no lo haya
           * fijado se queda con la frase, que ya dice lo esencial.
           */}
          {pro.latitude !== null && pro.longitude !== null && (
            <CoverageMap
              center={[pro.longitude, pro.latitude]}
              radiusKm={pro.radiusKm}
              // El cliente lo mira, no lo edita: el radio es del profesional
              style={styles.coverageMap}
              testID="pro-coverage-map"
            />
          )}
        </View>

        <ReviewList proId={pro.id} proName={pro.name} testID="pro-reviews" />

        <InfoCard style={styles.pendingCard}>
          <Text style={styles.pendingTitle}>Todavía no disponible</Text>
          <Text style={styles.pendingBody}>
            El calendario de disponibilidad y el mapa de cobertura llegan en los
            próximos días del roadmap.
          </Text>
        </InfoCard>

        <View style={styles.actions}>
          <Button onPress={onBook} style={styles.actionButton} testID="pro-book">
            Reservar ahora
          </Button>
          <Button
            variant="secondary"
            onPress={onQuote}
            style={styles.actionButton}
            testID="pro-quote"
          >
            Presupuesto
          </Button>
        </View>

        <Button
          variant="secondary"
          fullWidth
          onPress={onMessage}
          style={styles.messageButton}
          testID="pro-message"
        >
          Enviar mensaje
        </Button>

        <Pressable
          onPress={onReport}
          accessibilityRole="button"
          testID="pro-report"
        >
          <Text style={styles.report}>Denunciar este perfil</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
