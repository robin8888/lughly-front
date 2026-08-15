/**
 * ProUrgenciesPage
 * Las urgencias que le llegan al profesional.
 *
 * La pantalla tiene **dos caras excluyentes**, y esa es toda su lógica:
 *
 * - Si está atendiendo una, se enseña esa y nada más, con la dirección y el
 *   botón de cerrarla. Ofrecerle otras mientras va de camino sería empujarle
 *   a llegar tarde a las dos.
 * - Si no, la lista de las que le tocan, la más cercana primero.
 *
 * Y un tercer caso que no es un vacío: tiene el interruptor apagado. Ahí no
 * hay nada roto, simplemente no quiere avisos, y lo que procede es recordarle
 * dónde encenderlo.
 */

import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useMyUrgencies } from '@/hooks/domain/useMyUrgencies'
import { useUrgencyActions } from '@/hooks/domain/useUrgencyActions'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { formatDistance } from '@/utils/geo'
import { relativeDate } from '@/utils/relativeDate'
import { URGENCY_SURCHARGE } from '@/utils/surcharges'
import { theme } from '@/theme'
import { styles } from './ProUrgenciesPage.styles'

export interface ProUrgenciesPageProps {
  /** Id del usuario en sesión */
  userId: string | undefined
  onBack: () => void
  /** A su home, donde está el interruptor de "disponible ahora" */
  onGoAvailability: () => void
}

export function ProUrgenciesPage({
  userId,
  onBack,
  onGoAvailability,
}: ProUrgenciesPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

  const { data, isPending, isError, refetch } = useMyUrgencies()
  const { data: profile } = useProProfile(userId)
  const { accept, finish, isAccepting, isFinishing } = useUrgencyActions(userId)

  const busy = data?.busyWith ?? null
  const items = data?.items ?? []

  const handleAccept = async (jobId: string, title: string) => {
    const accepted = await accept(jobId)
    if (!accepted) return

    Alert.alert(
      'Urgencia aceptada',
      `${title}\n\n${accepted.addressLine ?? accepted.city}\n\nMientras la atiendas no recibirás otras. Ciérrala al terminar para volver a estar disponible.`,
    )
  }

  const handleFinish = (jobId: string) => {
    Alert.alert('Cerrar la urgencia', '¿Has terminado este trabajo?', [
      { text: 'Todavía no', style: 'cancel' },
      { text: 'Sí, he terminado', onPress: () => void finish(jobId) },
    ])
  }

  return (
    <View style={styles.screen} testID="pro-urgencies-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Urgencias</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="urgencies-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar las urgencias"
            message="Revisa tu conexión e inténtalo de nuevo."
            illustration="greeting"
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'urgencies-retry' },
            ]}
            testID="urgencies-error"
          />
        ) : busy ? (
          <InfoCard style={styles.busyCard} testID="urgencies-busy">
            <View style={styles.busyHead}>
              <View style={styles.dot} />
              <Text style={styles.busyLabel}>Atendiendo ahora</Text>
            </View>

            <Text style={styles.busyTitle}>{busy.title}</Text>

            {busy.addressLine && (
              <Text style={styles.address}>{busy.addressLine}</Text>
            )}

            <Text style={styles.busyBody}>
              Mientras la atiendas no recibirás avisos de otras urgencias. Al
              cerrarla vuelves a estar disponible sin tocar nada.
            </Text>

            <Button
              fullWidth
              loading={isFinishing}
              onPress={() => handleFinish(busy.id)}
              style={styles.finish}
              testID="urgencies-finish"
            >
              He terminado
            </Button>
          </InfoCard>
        ) : profile && !profile.availableNow ? (
          /**
           * No es un vacío: es que tiene el interruptor apagado. Enseñar
           * "no hay urgencias" haría pensar que no hay trabajo, cuando lo
           * que pasa es que no está pidiendo ninguno.
           */
          <EmptyState
            title="No estás recibiendo urgencias"
            message="Tienes el aviso de urgencias apagado, así que no te llega ninguna aunque las haya en tu zona. Puedes encenderlo desde tu inicio."
            illustration="none"
            actions={[
              {
                label: 'Ir a activarlo',
                onPress: onGoAvailability,
                testID: 'urgencies-go-availability',
              },
            ]}
            testID="urgencies-unavailable"
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Ninguna urgencia ahora mismo"
            message="Estás disponible. En cuanto alguien de tu zona necesite tu oficio con urgencia, aparecerá aquí."
            illustration="none"
            testID="urgencies-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {items.length}{' '}
              {items.length === 1 ? 'urgencia cerca de ti' : 'urgencias cerca de ti'}
            </Text>

            <View style={styles.list}>
              {items.map((urgency) => (
                <InfoCard key={urgency.id} testID={`urgency-${urgency.id}`}>
                  <Text style={styles.itemTitle}>{urgency.title}</Text>

                  <Text style={styles.itemMeta}>
                    {urgency.city}
                    {urgency.distanceKm !== null &&
                      ` · a ${formatDistance(urgency.distanceKm)}`}
                    {' · '}
                    {relativeDate(urgency.createdAt)}
                  </Text>

                  <Text style={styles.itemBody}>{urgency.description}</Text>

                  {urgency.photoCount > 0 && (
                    <Text style={styles.itemPhotos}>
                      {urgency.photoCount}{' '}
                      {urgency.photoCount === 1 ? 'foto adjunta' : 'fotos adjuntas'}
                    </Text>
                  )}

                  <Text style={styles.itemSurcharge}>
                    Recargo por urgencia: entre {URGENCY_SURCHARGE.min}% y{' '}
                    {URGENCY_SURCHARGE.max}% sobre tu tarifa.
                  </Text>

                  <Button
                    fullWidth
                    loading={isAccepting}
                    onPress={() => void handleAccept(urgency.id, urgency.title)}
                    style={styles.accept}
                    testID={`urgency-${urgency.id}-accept`}
                  >
                    Aceptar y ver la dirección
                  </Button>
                </InfoCard>
              ))}
            </View>

            <Text style={styles.note}>
              La dirección exacta se te muestra al aceptar. Si otro profesional
              acepta antes, la urgencia desaparece de tu lista.
            </Text>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
