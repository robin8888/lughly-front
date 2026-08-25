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

import { useState } from 'react'
import { View, Text, Image, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useFavoriteIds, useToggleFavorite } from '@/hooks/domain/useFavorites'
import { Button } from '@/components/atoms/Button'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Icon } from '@/components/atoms/Icon'
import { Money, formatAmount } from '@/components/atoms/Money'
import { StarRating } from '@/components/atoms/StarRating'
import { Tag } from '@/components/atoms/Tag'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Avatar } from '@/components/atoms/Avatar'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ReviewList } from '@/components/organisms/ReviewList'
import { useProProfile } from '@/hooks/domain/useProProfile'
import type { ApiPro } from '@/api/pros.api'
import { surchargesSummary } from '@/utils/surcharges'
import { ApiError, API_BASE_URL } from '@/api'
import { formatDate, parseIsoDate } from '@/utils/dates'
import { toWeekSchedule } from '@/utils/schedule'
import { theme } from '@/theme'
import { AVATAR_SIZE, styles } from './ProProfilePage.styles'

/**
 * Umbral de "Top valorada". Se exige también un número mínimo de reseñas:
 * un 5,0 con dos valoraciones no dice nada y destacarlo engaña al cliente.
 */
const TOP_RATED_MIN_RATING = 4.8
const TOP_RATED_MIN_REVIEWS = 20

/**
 * El día que vuelve: el **siguiente** al último que está fuera.
 *
 * `absentUntil` es el último día de la ausencia, los dos extremos incluidos.
 * Enseñarlo tal cual diría "vuelve el 25" de alguien que el 25 todavía está de
 * vacaciones, que es la clase de detalle por el que un cliente se planta en una
 * puerta cerrada.
 */
function formatAbsentUntil(lastDayOut: string): string {
  const last = parseIsoDate(lastDayOut)

  if (!last) return lastDayOut

  const back = new Date(last)
  back.setDate(back.getDate() + 1)

  return formatDate(back)
}

export interface ProProfilePageProps {
  id: string | undefined
  onBack: () => void
  onBook: () => void
  onQuote: () => void
  onReport: () => void
  /** Contratar la carta de un oficio: la visita, más lo que haya marcado */
  onHireCarta: (tradeSlug: string, serviceIds: string[]) => void
  /**
   * Lo que ya había marcado en la tarjeta del directorio, si venía de ahí:
   * la selección de la carta no se pierde al entrar a mirar el resto de la
   * ficha antes de decidirse a contratar.
   */
  initialSelection?: { tradeSlug: string; serviceIds: string[] }
}

export function ProProfilePage({
  id,
  onBack,
  onBook,
  onQuote,
  onReport,
  onHireCarta,
  initialSelection,
}: ProProfilePageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data: pro, isPending, isError, error, refetch } = useProProfile(id)

  /** Favoritos (COMO_SE_CONTRATA.md §11): es cosa del cliente */
  const isClient = useEffectiveRole() === 'client'
  const favoriteIds = useFavoriteIds()
  const { toggle: toggleFavorite } = useToggleFavorite()
  const isFavorite = pro ? favoriteIds.has(pro.id) : false

  /**
   * La lista de favoritos guarda tarjetas de directorio (`ApiPro`), no
   * fichas completas: mismos campos salvo `photos` —aquí llegan agrupadas
   * por oficio con más detalle— y `distanceKm`, que la ficha no tiene
   * porque no compara con nadie más.
   */
  const asDirectoryCard = (detail: NonNullable<typeof pro>): ApiPro => ({
    ...detail,
    photos: detail.photos.map((photo) => photo.url),
    distanceKm: null,
  })

  /**
   * Qué foto se está mirando a pantalla completa. `null` es ninguna.
   *
   * Aquí arriba con el resto de hooks, y no junto a las fotos donde se usa:
   * más abajo hay dos salidas —cargando y error— y un hook detrás de un
   * `return` no se ejecuta en esos renders. React cuenta los hooks y en cuanto
   * el número baila, la pantalla revienta entera.
   */
  const [viewing, setViewing] = useState<number | null>(null)

  /**
   * Qué servicios de la carta tiene marcados, por oficio. Un profesional
   * puede tener carta en más de uno, y cada oficio contrata por separado
   * —`onHireCarta` solo admite un `tradeSlug`—, así que cada uno lleva su
   * propia selección y su propio total.
   */
  const [selectedServices, setSelectedServices] = useState<Record<string, string[]>>(
    initialSelection ? { [initialSelection.tradeSlug]: initialSelection.serviceIds } : {},
  )

  const toggleService = (tradeSlug: string, serviceId: string) => {
    setSelectedServices((current) => {
      const selected = current[tradeSlug] ?? []
      return {
        ...current,
        [tradeSlug]: selected.includes(serviceId)
          ? selected.filter((id) => id !== serviceId)
          : [...selected, serviceId],
      }
    })
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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

      {pro && isClient && (
        <Pressable
          onPress={() => toggleFavorite(asDirectoryCard(pro), isFavorite)}
          hitSlop={8}
          style={styles.favorite}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          accessibilityState={{ selected: isFavorite }}
          testID="pro-favorite"
        >
          <Icon
            name="heart"
            size={22}
            filled={isFavorite}
            /*
              Sobre la cabecera azul marino, el rojo de `urgency` se queda en
              2,32:1 y un icono necesita 3:1; `unavailable` es ese mismo rojo
              un punto más claro y llega a 3,4:1. Y el corazón vacío en
              `darkText`, que es el color de letra para fondo oscuro, porque
              `textSoft` ahí se apagaba.
            */
            color={isFavorite ? theme.colors.unavailable : theme.colors.darkText}
            strokeWidth={2}
          />
        </Pressable>
      )}
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
          contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        >
          <EmptyState
            title={isGone ? 'Este perfil ya no está' : 'No hemos podido cargar el perfil'}
            message={
              isGone
                ? 'Puede que haya dejado la plataforma. Busca otro profesional del mismo oficio.'
                : 'Revisa tu conexión e inténtalo de nuevo.'
            }
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
   * Si el oficio que encabeza la ficha tiene carta, el titular dice "Visita
   * desde", no "€/h": ahí no se cobra por hora, se cobra por presentarse más
   * lo que se elija, y eso se ve —y se elige— más abajo, en su propio bloque.
   */
  const headlineTrade = pro.trades.find((trade) => trade.slug === pro.trade)
  const headlinePrice =
    headlineTrade?.visitFee != null
      ? `Visita ${formatAmount(headlineTrade.visitFee)} €`
      : `${formatAmount(headlineTrade?.hourlyRate ?? pro.hourlyRate ?? 0)} €/h`

  /**
   * Las fotos, agrupadas por oficio. El servidor ya las manda en el orden de
   * sus oficios, así que basta con recorrerlas: el primer grupo es el del
   * oficio que encabeza la ficha.
   */
  const photoGroups = pro.photos.reduce<
    {
      tradeSlug: string
      tradeLabel: string
      /* La reducida para la tira y la grande para abrirla */
      photos: { url: string; fullUrl: string }[]
    }[]
  >((groups, photo) => {
    const last = groups[groups.length - 1]

    if (last && last.tradeSlug === photo.tradeSlug) {
      last.photos.push({ url: photo.url, fullUrl: photo.fullUrl })
      return groups
    }

    groups.push({
      tradeSlug: photo.tradeSlug,
      tradeLabel: photo.tradeLabel,
      photos: [{ url: photo.url, fullUrl: photo.fullUrl }],
    })

    return groups
  }, [])

  /**
   * Todas las fotos seguidas, para el visor. Se abre por la que se toca y se
   * pasa a la siguiente sin salir, aunque sea de otro oficio: quien está
   * mirando trabajos terminados quiere verlos todos, no volver a la ficha
   * entre uno y otro.
   */
  const allPhotos = pro.photos.map((photo) => `${API_BASE_URL}${photo.fullUrl}`)

  return (
    <View style={styles.screen} testID="pro-profile-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
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
          {/*
            Con el anillo de disponibilidad, como en el directorio y en su
            propia home: verde si atiende urgencias ahora, rojo si no. Es lo
            primero que mira quien tiene una avería a las once de la noche.

            Con el átomo `Avatar` en vez de a mano, que es quien sabe dibujar
            ese anillo y así no hay tres versiones del mismo círculo.
          */}
          <View style={styles.avatar}>
            <Avatar
              uri={pro.avatarUrl ? `${API_BASE_URL}${pro.avatarUrl}` : null}
              size={AVATAR_SIZE}
              available={pro.availableNow}
            />
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
              <Text style={styles.rate}>{headlinePrice}</Text>
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
         * Sus trabajos, a lo ancho y con desplazamiento lateral.
         *
         * Una tira por oficio, con su rótulo y cuántas hay. En la tarjeta del
         * directorio solo salen las del oficio buscado; en la ficha interesa
         * lo contrario —ver todo lo que hace— pero sin mezclar, que es lo que
         * hacía dudar de si esa cocina la había montado él o solo pintado.
         *
         * Las fotos son más pequeñas que antes (220 → 150). A ese tamaño se
         * veían dos y media y la tira parecía cortada; ahora entran tres y
         * pico, que es lo que dice sin palabras que hay más a la derecha. Y
         * para mirar de cerca está el visor, que es su sitio.
         */}
        {photoGroups.map((group) => (
          <View key={group.tradeSlug} style={styles.galleryGroup}>
            <View style={styles.galleryHead}>
              {/* Con un solo oficio el nombre sobra: se sabe de qué son */}
              <Text style={styles.galleryLabel}>
                {photoGroups.length > 1 ? group.tradeLabel : 'Sus trabajos'}
              </Text>

              <Text style={styles.galleryCount}>
                {group.photos.length === 1
                  ? '1 foto'
                  : `${group.photos.length} fotos`}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gallery}
              contentContainerStyle={styles.galleryContent}
            >
              {group.photos.map((photo) => (
                <Pressable
                  key={photo.url}
                  onPress={() =>
                    setViewing(
                      allPhotos.indexOf(`${API_BASE_URL}${photo.fullUrl}`),
                    )
                  }
                  accessibilityRole="imagebutton"
                  accessibilityLabel="Ver la foto más grande"
                  testID={`pro-photo-${photo.url}`}
                >
                  <RemotePhoto
                    uri={`${API_BASE_URL}${photo.url}`}
                    style={styles.galleryPhoto}
                    fallback="Esta foto no se ha podido cargar"
                  />
                </Pressable>
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
         *
         * Y también con uno solo si ha contado algo de él: si no, lo que
         * escribió en su único oficio no se vería en ninguna parte.
         */}
        {(pro.trades.length > 1 ||
          pro.trades.some((trade) => trade.description || trade.visitFee != null)) && (
          <InfoCard style={styles.section} testID="pro-trades">
            <Text style={styles.sectionTitle}>
              {pro.trades.length > 1 ? 'Lo que hace en cada oficio' : 'Lo que hace'}
            </Text>

            {/*
              Un bloque por oficio, no una fila de precios con texto colgando.
              El nombre encabeza, el precio va a su lado y debajo lo que cuenta
              de ESE oficio: quien ejerce carpintería y limpieza no hace lo
              mismo en las dos, y hasta ahora el único párrafo del perfil valía
              igual para las dos, que es no decir nada de ninguna.
            */}
            {pro.trades.map((trade) => {
              const hasCarta = trade.visitFee != null
              const services = trade.services ?? []
              const selected = selectedServices[trade.slug] ?? []
              const selectedServiceItems = services.filter((service) =>
                selected.includes(service.id),
              )
              /**
               * Un servicio de la carta ya lleva el desplazamiento metido en
               * su precio: no es "visita + arreglo", es un precio cerrado de
               * puerta a puerta. La visita solo se cobra aparte cuando no se
               * marca ningún servicio —ahí sí es lo único que se contrata.
               */
              const total =
                selectedServiceItems.length > 0
                  ? selectedServiceItems.reduce((sum, service) => sum + service.price, 0)
                  : (trade.visitFee ?? 0)

              return (
                <View key={trade.slug} style={styles.tradeBlock}>
                  <View style={styles.tradeRow}>
                    <Text style={styles.tradeLabel}>{trade.label}</Text>
                    <Text style={styles.tradeRate}>
                      {hasCarta
                        ? `Visita ${formatAmount(trade.visitFee!)} €`
                        : `${formatAmount(trade.hourlyRate ?? 0)} €/h`}
                    </Text>
                  </View>

                  {/*
                    Sin descripción propia se dice, en vez de dejar el hueco:
                    entre dos oficios y uno con texto, el mudo parece un fallo de
                    la app en vez de algo que su dueño no ha escrito.
                  */}
                  <Text
                    style={[
                      styles.tradeDescription,
                      !trade.description && styles.tradeNoDescription,
                    ]}
                  >
                    {trade.description ?? 'No ha contado nada de este oficio.'}
                  </Text>

                  {/*
                    La carta: sin marcar nada, se cobra la visita —para
                    cuando no se sabe qué hace falta todavía—; en cuanto se
                    marca un servicio, ese precio ya lleva el desplazamiento
                    dentro y la visita deja de cobrarse aparte.
                  */}
                  {hasCarta && (
                    <View style={styles.cartaBlock} testID={`pro-carta-${trade.slug}`}>
                      {services.length > 0 && (
                        <View style={styles.cartaServices}>
                          {services.map((service) => (
                            <Checkbox
                              key={service.id}
                              checked={selected.includes(service.id)}
                              onChange={() => toggleService(trade.slug, service.id)}
                              testID={`pro-carta-service-${service.id}`}
                            >
                              {`${service.name} · ${formatAmount(service.price)} €`}
                            </Checkbox>
                          ))}
                        </View>
                      )}

                      <View style={styles.cartaTotalRow}>
                        <Text style={styles.cartaTotalLabel}>Total</Text>
                        <Money amount={total} style={styles.cartaTotal} />
                      </View>

                      <Button
                        onPress={() => onHireCarta(trade.slug, selected)}
                        style={styles.cartaHire}
                        testID={`pro-carta-hire-${trade.slug}`}
                      >
                        Contratar por {formatAmount(total)} €
                      </Button>
                    </View>
                  )}
                </View>
              )
            })}
          </InfoCard>
        )}

        {/*
          El horario, con los siete días. Solo si lo ha puesto: enseñar
          "cerrado" toda la semana a quien no lo ha rellenado le costaría
          trabajos, y quien mira entendería que no trabaja nunca.
        */}
        {/*
          Si está fuera se dice antes que el horario, y no después: el horario
          promete unas horas y esto las retira. Leerlo al revés sería enterarse
          de que no está después de haber decidido llamarle.
        */}
        {pro.absentUntil !== null && (
          <InfoCard style={styles.section} testID="pro-absent">
            <Text style={styles.sectionTitle}>Ahora mismo no está</Text>
            <Text style={styles.sectionBody}>
              Vuelve el {formatAbsentUntil(pro.absentUntil)}. Puedes escribirle
              igualmente, pero no contará con esos días.
            </Text>
          </InfoCard>
        )}

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

          {/*
            Sin mapa (20 Agosto 2026). Enseñaba su punto base, y eso es decirle
            a cualquiera dónde encontrar a una persona por haber entrado a
            mirar su ficha. El radio en palabras dice lo que el cliente
            necesita —si le llega— sin llevar a nadie a ninguna puerta.
          */}
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

        <Pressable
          onPress={onReport}
          accessibilityRole="button"
          testID="pro-report"
        >
          <Text style={styles.report}>Denunciar este perfil</Text>
        </Pressable>
      </Animated.ScrollView>

      <PhotoViewer
        photos={allPhotos}
        openAt={viewing}
        onClose={() => setViewing(null)}
        testID="pro-photo-viewer"
      />
    </View>
  )
}
