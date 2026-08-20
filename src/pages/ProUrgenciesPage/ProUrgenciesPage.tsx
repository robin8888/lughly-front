/**
 * ProUrgenciesPage
 * Las urgencias que le han pedido **a él**.
 *
 * Era un tablón: salían todas las urgencias sueltas de su zona y se la
 * llevaba el primero que aceptara. Desde el 20 Agosto 2026 el cliente elige a
 * quién llama, así que esto es su bandeja: lo que sale aquí es lo que tiene
 * que contestar, con su reloj corriendo.
 *
 * De ahí lo que cambia en la pantalla:
 *
 * - **Se ve el plazo.** Son cinco minutos, no las veinticuatro horas de un
 *   encargo normal, y sin el contador delante no se nota la diferencia.
 * - **Se ven las fotos.** Se decide en cinco minutos y sin tiempo de preguntar
 *   nada, así que decide con lo que vea. Un "3 fotos adjuntas" no vale.
 * - **Se puede decir que no.** Antes solo se podía ignorar, y como la urgencia
 *   era de todos daba igual. Ahora el cliente está esperando a este y a nadie
 *   más: callarse le cuesta cinco minutos de una avería.
 *
 * Sigue teniendo **dos caras excluyentes**: si está atendiendo una se enseña
 * esa y nada más —ofrecerle otras mientras va de camino sería empujarle a
 * llegar tarde a las dos—, y si no, lo que tiene pendiente de contestar.
 *
 * Y un tercer caso que no es un vacío: tiene el interruptor apagado. Ahí no
 * hay nada roto, simplemente no quiere avisos, y lo que procede es recordarle
 * dónde encenderlo.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Dialog } from '@/components/organisms/Dialog'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { API_BASE_URL } from '@/api'
import { useMyUrgencies } from '@/hooks/domain/useMyUrgencies'
import { useUrgencyActions } from '@/hooks/domain/useUrgencyActions'
import { useDeclineRequest } from '@/hooks/domain/useInbox'
import { useProProfile } from '@/hooks/domain/useProProfile'
import type { ApiUrgency } from '@/api/urgencies.api'
import { formatDistance } from '@/utils/geo'
import { theme } from '@/theme'
import { styles } from './ProUrgenciesPage.styles'

/**
 * Lo que queda de plazo, en palabras.
 *
 * Se redondea hacia arriba porque el número es un aviso y no un cronómetro:
 * decir "quedan 0 minutos" cuando todavía se puede contestar es lo mismo que
 * decirle que ya no llega.
 */
function timeLeft(respondByAt: string | null): string | null {
  if (!respondByAt) return null

  const remaining = new Date(respondByAt).getTime() - Date.now()
  if (remaining <= 0) return 'Se ha pasado el plazo'

  const minutes = Math.ceil(remaining / 60_000)

  return minutes === 1
    ? 'Queda menos de un minuto'
    : `Quedan ${minutes} minutos para contestar`
}

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
  const { decline, isDeclining } = useDeclineRequest()

  /** Cuál se está mirando de cerca, si alguna */
  const [viewing, setViewing] = useState<{ jobId: string; index: number } | null>(
    null,
  )
  /** A cuál se le está diciendo que no, y por qué */
  const [declining, setDeclining] = useState<ApiUrgency | null>(null)
  const [reason, setReason] = useState('')
  const [declineError, setDeclineError] = useState<string | null>(null)

  const busy = data?.busyWith ?? null
  const items = data?.items ?? []
  const viewingJob = items.find((urgency) => urgency.id === viewing?.jobId)

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

  const closeDecline = () => {
    setDeclining(null)
    setReason('')
    setDeclineError(null)
  }

  const sendDecline = async () => {
    if (!declining) return

    const { ok, error } = await decline(declining.id, reason.trim())

    if (!ok) {
      setDeclineError(error ?? 'No hemos podido enviar tu respuesta.')
      return
    }

    closeDecline()
    void refetch()
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
            message="Tienes el aviso de urgencias apagado, así que no sales en la lista de nadie aunque necesiten tu oficio en tu zona. Puedes encenderlo desde tu inicio."
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
            message="Estás disponible. Cuando alguien de tu zona te elija para una urgencia, aparecerá aquí y te avisaremos al móvil."
            testID="urgencies-empty"
          />
        ) : (
          <>
            <InfoCard variant="accent">
              <Text style={styles.intro}>
                {items.length === 1
                  ? 'Te han elegido para una urgencia.'
                  : `Te han elegido para ${items.length} urgencias.`}{' '}
                Contesta cuanto antes: si se pasa el plazo, el cliente podrá
                llamar a otro.
              </Text>
            </InfoCard>

            <View style={styles.list}>
              {items.map((urgency) => {
                const left = timeLeft(urgency.respondByAt)

                return (
                  <InfoCard key={urgency.id} testID={`urgency-${urgency.id}`}>
                    <Text style={styles.itemTitle}>{urgency.title}</Text>

                    <Text style={styles.itemMeta}>
                      {urgency.tradeLabel} · {urgency.city}
                      {urgency.distanceKm !== null &&
                        ` · a ${formatDistance(urgency.distanceKm)}`}
                    </Text>

                    {/*
                      El plazo, en su propia línea. Cinco minutos no se parecen
                      en nada a las veinticuatro horas de un encargo normal, y
                      metido entre el resto de datos no se distinguiría.
                    */}
                    {left && (
                      <View style={styles.deadline}>
                        <Text style={styles.deadlineText}>{left}</Text>
                      </View>
                    )}

                    <Text style={styles.itemBody}>{urgency.description}</Text>

                    {/*
                      Las fotos que puso el cliente, y no un recuento. Se
                      contesta en cinco minutos y sin tiempo de preguntar nada
                      por chat, así que decide con lo que vea —y es también lo
                      que le dice qué herramienta meter en la furgoneta.
                    */}
                    {urgency.photos.length > 0 && (
                      <View style={styles.block}>
                        <Text style={styles.blockLabel}>
                          {urgency.photos.length === 1
                            ? 'Una foto de la avería'
                            : `${urgency.photos.length} fotos de la avería`}
                        </Text>

                        <View style={styles.photos}>
                          {urgency.photos.map((photo, index) => (
                            <Pressable
                              key={photo.fullUrl}
                              onPress={() =>
                                setViewing({ jobId: urgency.id, index })
                              }
                              accessibilityRole="imagebutton"
                              accessibilityLabel="Ver la foto más grande"
                              style={styles.photo}
                              testID={`urgency-${urgency.id}-photo-${index}`}
                            >
                              <RemotePhoto
                                uri={`${API_BASE_URL}${photo.url}`}
                                style={styles.photoImage}
                                fallback="No carga"
                              />
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    <Button
                      fullWidth
                      loading={isAccepting}
                      onPress={() => void handleAccept(urgency.id, urgency.title)}
                      style={styles.accept}
                      testID={`urgency-${urgency.id}-accept`}
                    >
                      Aceptar y ver la dirección
                    </Button>

                    <Button
                      fullWidth
                      variant="secondary"
                      disabled={isAccepting}
                      onPress={() => setDeclining(urgency)}
                      style={styles.declineButton}
                      testID={`urgency-${urgency.id}-decline`}
                    >
                      No puedo ir
                    </Button>
                  </InfoCard>
                )
              })}
            </View>

            <Text style={styles.note}>
              La dirección exacta se te enseña al aceptar. Si no contestas antes
              de que se cumpla el plazo, el cliente podrá elegir a otro.
            </Text>
          </>
        )}
      </Animated.ScrollView>

      <PhotoViewer
        photos={(viewingJob?.photos ?? []).map(
          (photo) => `${API_BASE_URL}${photo.fullUrl}`,
        )}
        openAt={viewingJob ? (viewing?.index ?? 0) : null}
        onClose={() => setViewing(null)}
        testID="urgencies-photo-viewer"
      />

      {/*
        El motivo es obligatorio y **no se le enseña al cliente**: aquí no hay
        jefe a quien contárselo, así que el único destinatario sería un
        desconocido. Se guarda para nosotros, que es lo que permite ver quién
        dice que no a todo. La pantalla lo dice, para que nadie se lo calle por
        miedo a que lo lea el cliente.
      */}
      <Dialog
        visible={declining !== null}
        tone="danger"
        title="¿Por qué no puedes ir?"
        message="Al cliente le diremos que no puedes y podrá elegir a otro, pero no verá lo que escribas aquí."
        onDismiss={closeDecline}
        testID="urgency-decline"
        actions={[
          {
            label: isDeclining ? 'Enviando…' : 'Enviar',
            onPress: () => void sendDecline(),
            disabled: reason.trim().length === 0 || isDeclining,
            testID: 'urgency-decline-send',
          },
          {
            label: 'Cancelar',
            variant: 'secondary',
            onPress: closeDecline,
            testID: 'urgency-decline-back',
          },
        ]}
      >
        <View style={styles.field}>
          <Input
            value={reason}
            onChangeText={setReason}
            placeholder="Estoy en otra urgencia, me pilla lejos…"
            multiline
            numberOfLines={3}
            maxLength={300}
            testID="urgency-decline-reason"
          />
          {declineError && <Text style={styles.error}>{declineError}</Text>}
        </View>
      </Dialog>
    </View>
  )
}
