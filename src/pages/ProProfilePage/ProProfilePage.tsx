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

import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { StarRating } from '@/components/atoms/StarRating'
import { Tag } from '@/components/atoms/Tag'
import { InfoCard } from '@/components/molecules/InfoCard'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { EmptyState } from '@/components/molecules/EmptyState'
import { CoverageMap } from '@/components/organisms/CoverageMap'
import { ReviewList } from '@/components/organisms/ReviewList'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { surchargesSummary } from '@/utils/surcharges'
import { ApiError, API_BASE_URL } from '@/api'
import { toWeekSchedule } from '@/utils/schedule'
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
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

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
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
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
        </Animated.ScrollView>
      </View>
    )
  }

  const isTopRated =
    pro.rating >= TOP_RATED_MIN_RATING && pro.reviewCount >= TOP_RATED_MIN_REVIEWS

  /**
   * Las fotos, agrupadas por oficio. El servidor ya las manda en el orden de
   * sus oficios, así que basta con recorrerlas: el primer grupo es el del
   * oficio que encabeza la ficha.
   */
  const photoGroups = pro.photos.reduce<
    { tradeSlug: string; tradeLabel: string; photos: string[] }[]
  >((groups, photo) => {
    const last = groups[groups.length - 1]

    if (last && last.tradeSlug === photo.tradeSlug) {
      last.photos.push(photo.url)
      return groups
    }

    groups.push({
      tradeSlug: photo.tradeSlug,
      tradeLabel: photo.tradeLabel,
      photos: [photo.url],
    })

    return groups
  }, [])

  return (
    <View style={styles.screen} testID="pro-profile-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/**
         * La presentación, en una sola pieza y centrada.
         *
         * Antes iba suelta sobre el fondo, en tres bloques que se leían como
         * tres cosas distintas —la foto con el nombre a un lado, las etiquetas
         * debajo y el precio en otra fila—. Son lo mismo: quién es. Juntarlo en
         * una tarjeta le da principio a la página, y de paso repite la forma
         * que ya tienen las dos home, donde la foto va centrada sobre el
         * nombre.
         */}
        <InfoCard style={styles.hero} testID="pro-hero">
          <View style={styles.avatar}>
            {pro.avatarUrl ? (
              <Image
                source={{ uri: `${API_BASE_URL}${pro.avatarUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="user-circle" size={44} color={theme.colors.accent} />
            )}
          </View>

          {/**
           * Igual que en el directorio: si trabaja para alguien, el titular
           * es el empleador. Es a quien se contrata y quien factura; el
           * trabajador es quien va a ir a la casa.
           */}
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

          <View style={styles.tags}>
            {pro.availableNow && <Tag variant="available">Disponible ahora</Tag>}
            {pro.verified && <Tag variant="accent">Identidad verificada</Tag>}
            {pro.licenseVerified && <Tag variant="accent">Habilitación verificada</Tag>}
            {isTopRated && <Tag variant="accent2">Top valorada</Tag>}
          </View>

          {/*
            Precio y valoración, separados del resto por una línea: son los dos
            números con los que se compara a una persona con otra, y buscarlos
            tiene que costar lo mismo en todas las fichas.
          */}
          <View style={styles.headline}>
            <View style={styles.headlineItem}>
              <Text style={styles.rate}>{pro.hourlyRate} €/h</Text>
              <Text style={styles.headlineLabel}>desde</Text>
            </View>

            <View style={styles.headlineDivider} />

            <View style={styles.headlineItem}>
              <View style={styles.rating}>
                <StarRating rating={pro.rating} size={14} />
                <Text style={styles.ratingValue}>{pro.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.headlineLabel}>
                {pro.reviewCount} {pro.reviewCount === 1 ? 'reseña' : 'reseñas'}
              </Text>
            </View>
          </View>
        </InfoCard>

        {/**
         * Sus trabajos, a lo ancho y con desplazamiento lateral. Aquí sí se
         * ven grandes: es la pantalla donde se decide, y recortarlas a
         * cuadraditos como en la tarjeta desaprovecharía el sitio.
         *
         * Una tira por oficio, con su nombre encima. En la tarjeta solo salen
         * las del oficio buscado; en la ficha interesa lo contrario —ver todo
         * lo que hace— pero sin mezclar, que es lo que hacía dudar de si esa
         * cocina la había montado él o solo pintado.
         */}
        {photoGroups.map((group) => (
          <View key={group.tradeSlug} style={styles.galleryGroup}>
            {/* El nombre del oficio solo si hay más de uno: con uno, sobra */}
            {photoGroups.length > 1 && (
              <Text style={styles.galleryLabel}>{group.tradeLabel}</Text>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
              contentContainerStyle={styles.galleryContent}
            >
              {group.photos.map((url) => (
                <RemotePhoto
                  key={url}
                  uri={`${API_BASE_URL}${url}`}
                  style={styles.galleryPhoto}
                  fallback="Esta foto no se ha podido cargar"
                  testID={`pro-photo-${url}`}
                />
              ))}
            </ScrollView>
          </View>
        ))}

        {/*
          Lo que cuenta de sí misma y lo que lleva hecho, juntos. Sueltos entre
          tarjetas se quedaban en tierra de nadie, y el número de trabajos
          terminados es de lo poco que no dice ella misma: acompaña a lo que sí.
        */}
        {(pro.bio !== null || pro.completedJobs > 0) && (
          <InfoCard style={styles.section} testID="pro-about">
            <Text style={styles.sectionTitle}>Sobre {pro.name.split(' ')[0]}</Text>

            {pro.bio && <Text style={styles.bio}>{pro.bio}</Text>}

            {pro.completedJobs > 0 && (
              <Text style={styles.completed}>
                {pro.completedJobs}{' '}
                {pro.completedJobs === 1
                  ? 'trabajo terminado en Lughly'
                  : 'trabajos terminados en Lughly'}
              </Text>
            )}
          </InfoCard>
        )}

        {/**
         * Con más de un oficio hay más de un precio, y el titular solo puede
         * enseñar uno. Aquí van todos: quien viene buscando limpieza puede
         * descubrir que además pasea perros, y necesita saber a cuánto.
         */}
        {pro.trades.length > 1 && (
          <InfoCard style={styles.section} testID="pro-trades">
            <Text style={styles.sectionTitle}>Lo que hace y a qué precio</Text>

            {pro.trades.map((trade) => (
              <View key={trade.slug} style={styles.tradeRow}>
                <Text style={styles.tradeLabel}>{trade.label}</Text>
                <Text style={styles.tradeRate}>{trade.hourlyRate} €/h</Text>
              </View>
            ))}
          </InfoCard>
        )}

        {/*
          El horario, con los siete días. Solo si lo ha puesto: enseñar
          "cerrado" toda la semana a quien no lo ha rellenado le costaría
          trabajos, y quien mira entendería que no trabaja nunca.
        */}
        {pro.availability.length > 0 && (
          <InfoCard style={styles.section} testID="pro-schedule">
            <Text style={styles.sectionTitle}>Horario</Text>

            {toWeekSchedule(pro.availability).map((day, index, week) => {
              const isToday = day.weekday === new Date().getDay()

              return (
                <View
                  key={day.weekday}
                  style={[
                    styles.scheduleRow,
                    index === week.length - 1 && styles.scheduleRowLast,
                  ]}
                  testID={`pro-schedule-${day.weekday}`}
                >
                  <Text
                    style={[styles.scheduleDay, isToday && styles.scheduleToday]}
                  >
                    {day.label}
                    {/* Hoy destacado: la pregunta que trae casi todo el mundo es si puede ir hoy */}
                    {isToday ? ' (hoy)' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.scheduleHours,
                      isToday && styles.scheduleToday,
                      day.hours === null && styles.scheduleClosed,
                    ]}
                  >
                    {day.hours ?? 'Cerrado'}
                  </Text>
                </View>
              )
            })}

            <Text style={styles.sectionNote}>
              Son sus horas de trabajo normales. Una urgencia puede atenderla
              fuera de ellas, si en ese momento está disponible.
            </Text>
          </InfoCard>
        )}

        <InfoCard style={styles.section} testID="pro-surcharges">
          <Text style={styles.sectionTitle}>Recargos</Text>
          <Text style={styles.sectionBody}>{surchargesSummary()}</Text>
          <Text style={styles.sectionNote}>
            No se suman entre sí: se aplica el más alto. Verás el importe exacto
            antes de confirmar.
          </Text>
        </InfoCard>

        <InfoCard style={styles.section} testID="pro-coverage">
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
        </InfoCard>

        <ReviewList proId={pro.id} proName={pro.name} testID="pro-reviews" />

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
      </Animated.ScrollView>
    </View>
  )
}
