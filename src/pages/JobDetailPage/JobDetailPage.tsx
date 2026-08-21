/**
 * JobDetailPage
 * La ficha de un trabajo: qué pasa con él y quién lo tiene.
 *
 * Faltaba, y se notaba: tocar la tarjeta de un trabajo no hacía nada salvo en
 * las subastas, así que quien encargaba algo a alguien no tenía dónde ver a
 * quién estaba esperando ni en qué punto estaba. La información existía toda
 * en el servidor, repartida entre la tarjeta, las pujas y la agenda del
 * profesional; lo que no había era una pantalla que contara la historia.
 *
 * **Lo primero es el estado, y en una frase.** No un rótulo con el nombre
 * interno del estado, sino qué está pasando y a quién se espera, que es la
 * única pregunta que trae aquí a alguien.
 *
 * Sirve a los dos lados: el servidor decide qué campos manda según quién
 * pregunte —al cliente su dirección y sus pujas, a quien va a ir el teléfono
 * del cliente—, así que aquí solo hay que no enseñar lo que llegue vacío.
 */

import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Avatar } from '@/components/atoms/Avatar'
import { Countdown } from '@/components/atoms/Countdown'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useJob, useCancelJob } from '@/hooks/domain/useJob'
import { API_BASE_URL } from '@/api'
import type { ApiJobDetail, ApiJobType } from '@/api/jobs.api'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { formatJobWhen } from '@/utils/dates'
import { jobStatusLook, jobTypeLabel } from '@/utils/jobStatus'
import { theme } from '@/theme'
import { styles } from './JobDetailPage.styles'

/**
 * Qué está pasando, en una frase y con nombres.
 *
 * Es lo que sustituye al "esperando respuesta" a secas: quien encarga un
 * trabajo no quiere saber el estado, quiere saber **a quién espera y hasta
 * cuándo**.
 */
function whatIsHappening(job: ApiJobDetail): string {
  const quien = job.assignedPro?.name ?? 'el profesional'

  if (job.viewer === 'pro') {
    switch (job.status) {
      case 'PENDING_PRO':
        /*
          En el aire, pero a quién se espera lo dice la cita: a quien recibió
          el encargo, al trabajador que tiene que confirmar, o al cliente
          ante un cambio de persona.
        */
        if (job.appointmentStatus === 'PENDING_WORKER') {
          return 'Te lo han asignado y falta que confirmes que puedes.'
        }
        if (job.appointmentStatus === 'SUBSTITUTE_PROPOSED') {
          return 'Habéis propuesto mandar a otra persona y falta que el cliente lo acepte.'
        }
        return 'Te lo han encargado y esperan tu respuesta.'
      case 'AWARDED':
        return 'Es tuyo. Tienes la dirección y el teléfono del cliente.'
      default:
        return ''
    }
  }

  switch (job.status) {
    case 'OPEN':
      /*
        Una urgencia abierta no está esperando nada: está esperándole a él.
        No se avisa a nadie por su cuenta, así que decirle "publicado y
        esperando" sería dejarle mirando un trabajo que no se mueve.
      */
      if (job.type === 'URGENT') {
        return 'Falta que elijas a quién llamar. Hasta entonces no lo sabe nadie.'
      }

      return job.type === 'AUCTION'
        ? 'Abierta a pujas. Cuando cierre, eliges tú comparando precio, plazo y valoración.'
        : 'Publicado y esperando.'
    case 'PENDING_PRO':
      if (job.appointmentStatus === 'PENDING_WORKER') {
        return `${quien} lo ha asignado y falta que quien va a ir lo confirme. Te avisaremos en cuanto esté cerrado.`
      }
      if (job.appointmentStatus === 'SUBSTITUTE_PROPOSED') {
        return `${quien} propone mandar a ${job.substituteProName ?? 'otra persona'}. Decides tú: puedes aceptarlo o cancelar sin coste, desde Mis trabajos.`
      }
      return `Esperando la respuesta de ${quien}. Si no contesta en el plazo, quedarás libre para encargárselo a otro.`
    case 'AWARDED':
      /*
        El teléfono solo se promete si está. No todo el mundo lo tiene en la
        app —un trabajador dado de alta por su empresa puede no haberlo dejado—
        y prometer un número que luego no aparece por ninguna parte es peor que
        no decir nada.
      */
      return job.assignedPro?.phone
        ? `Cerrado. Lo hará ${quien}, y ya tienes su teléfono por si necesitas hablar con alguien.`
        : `Cerrado. Lo hará ${quien}.`
    case 'IN_PROGRESS':
      return `${quien} está con ello.`
    case 'COMPLETED':
      return 'Terminado. Si aún no lo has valorado, tu opinión ayuda a quien busque después.'
    case 'DECLINED':
      return `${quien} no puede hacerlo. Ya puedes encargárselo a otro sin esperar nada.`
    case 'EXPIRED':
      return 'Se cumplió el plazo sin respuesta. Puedes encargárselo a otro.'
    case 'CANCELLED':
      return 'Cancelado. No se te ha cobrado nada.'
    default:
      return ''
  }
}

export interface JobDetailPageProps {
  jobId: string | undefined
  onBack: () => void
  /** Ver las pujas de una subasta, que es donde se adjudica */
  onSeeBids: (jobId: string, title: string) => void
  /**
   * Buscar a otro, cuando el elegido no puede o se le pasó el plazo.
   *
   * La pantalla ya decía "ya puedes encargárselo a otro" y no daba por dónde:
   * el botón estaba solo en la tarjeta de Mis trabajos, así que entrar en la
   * ficha era meterse en un callejón. Va aquí también, y desde el mismo sitio
   * en el que se lee la frase.
   */
  onReassign?: (
    jobId: string,
    trade: string,
    declinedProId: string | null,
    type: ApiJobType,
  ) => void
}

export function JobDetailPage({
  jobId,
  onBack,
  onSeeBids,
  onReassign,
}: JobDetailPageProps) {
  const onScroll = useNavScrollHandler()
  const { data: job, isPending, isError, refetch } = useJob(jobId)
  const { cancel, isCancelling } = useCancelJob()

  /**
   * Se pregunta antes, y con lo que pasa dicho: cancelar no se deshace, y si
   * había pujas se caen con el trabajo.
   */
  const confirmCancel = (id: string, hasBids: boolean) => {
    Alert.alert(
      '¿Cancelar este trabajo?',
      hasBids
        ? 'Se cerrarán las pujas que has recibido y se avisará a quien estuviera esperando. No se puede deshacer.'
        : 'Se avisará a quien estuviera esperando respuesta. No se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar el trabajo',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const { ok, error } = await cancel(id)
              if (!ok) {
                Alert.alert(
                  'No se ha podido cancelar',
                  error ?? 'Inténtalo de nuevo en un momento.',
                )
              }
            })()
          },
        },
      ],
    )
  }

  const header = (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {job?.title ?? 'El trabajo'}
      </Text>
    </View>
  )

  if (isPending) {
    return (
      <View style={styles.screen} testID="job-detail-page">
        {header}
        <View style={styles.state} testID="job-detail-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError || !job) {
    return (
      <View style={styles.screen} testID="job-detail-page">
        {header}
        <EmptyState
          title="No hemos podido abrir el trabajo"
          message="Puede que ya no exista o que no tengas nada que ver con él. Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'job-detail-retry',
            },
            { label: 'Volver', variant: 'secondary', onPress: onBack },
          ]}
          testID="job-detail-error"
        />
      </View>
    )
  }

  const look = jobStatusLook(job.status, job.appointmentStatus)
  /**
   * Esperando a alguien del lado profesional, con su reloj a la vista. Ante
   * un cambio de persona quien tiene que contestar es el propio cliente, y
   * eso se resuelve en Mis trabajos, no con una cuenta atrás aquí.
   */
  const isWaiting =
    job.status === 'PENDING_PRO' && job.appointmentStatus !== 'SUBSTITUTE_PROPOSED'

  /**
   * Se puede cancelar mientras nadie ha movido nada. Adjudicado ya no: hay
   * quien ha reservado sus horas, y eso no se deshace con un botón.
   */
  /**
   * Se quedó sin nadie: lo único que queda por hacer es buscar a otro.
   *
   * También una urgencia recién publicada, que está esperando a que elija a
   * quién llamar. Si salió de esa pantalla sin elegir, no se avisa a nadie por
   * su cuenta y la urgencia se queda quieta.
   */
  const pickUrgencyPro = job.type === 'URGENT' && job.status === 'OPEN'

  const canReassign =
    job.viewer === 'client' &&
    (job.status === 'DECLINED' || job.status === 'EXPIRED' || pickUrgencyPro)

  const canCancel =
    job.viewer === 'client' && ['DRAFT', 'OPEN', 'PENDING_PRO'].includes(job.status)

  return (
    <View style={styles.screen} testID="job-detail-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/*
          El estado, arriba y contado: es la única pregunta que trae aquí a
          alguien, y un rótulo con el nombre del estado no la responde.
        */}
        <InfoCard variant="accent">
          <View style={styles.statusHead}>
            <Text style={styles.statusLabel}>{look.label}</Text>
            <Text style={styles.typeLabel}>{jobTypeLabel(job.type)}</Text>
          </View>

          <Text style={styles.happening}>{whatIsHappening(job)}</Text>

          {isWaiting && job.respondByAt && (
            <View style={styles.deadline}>
              <Text style={styles.deadlineLabel}>Queda</Text>
              <Countdown
                target={job.respondByAt}
                expiredLabel="Plazo cumplido"
                testID="job-detail-countdown"
              />
            </View>
          )}
        </InfoCard>

        {/*
          Quién lo tiene. Cuando trabaja para alguien se dice también quién va
          a ir: se contrata a la empresa, pero a la casa entra una persona.
        */}
        {job.assignedPro && (
          <InfoCard style={styles.block}>
            <Text style={styles.blockTitle}>Quién lo hace</Text>

            <View style={styles.proRow}>
              {/*
                La cara de quien va a ir, aunque se contratara a la empresa:
                quien llama al timbre es una persona, y es a quien hay que
                reconocer al abrir la puerta.
              */}
              <Avatar
                uri={
                  job.assignedPro.avatarUrl
                    ? `${API_BASE_URL}${job.assignedPro.avatarUrl}`
                    : null
                }
                size={52}
              />

              <View style={styles.proText}>
                <Text style={styles.proName}>{job.assignedPro.name}</Text>

                {job.assignedPro.workerName && (
                  <Text style={styles.proWorker}>
                    Va {job.assignedPro.workerName}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.proRating}>
              ★ {job.assignedPro.rating.toFixed(1)} ·{' '}
              {job.assignedPro.reviewCount === 0
                ? 'sin reseñas'
                : `${job.assignedPro.reviewCount} reseñas`}
            </Text>

            {/*
              Y si no hay teléfono se dice, en vez de dejar el hueco: quien
              espera en casa mirando esta pantalla necesita saber si tiene por
              dónde llamar o si tiene que esperar al timbre.
            */}
            {job.viewer === 'client' &&
              (job.assignedPro.phone ? (
                <Text style={styles.proPhone} selectable>
                  {job.assignedPro.phone}
                </Text>
              ) : (
                <Text style={styles.noPhone}>
                  No tenemos su teléfono en la app. Te avisará al llegar.
                </Text>
              ))}
          </InfoCard>
        )}

        {/* Al revés: quien va a ir necesita saber a casa de quién */}
        {job.clientName && (
          <InfoCard style={styles.block}>
            <Text style={styles.blockTitle}>El cliente</Text>
            <Text style={styles.proName}>{job.clientName}</Text>
            {job.clientPhone && (
              <Text style={styles.proPhone} selectable>
                {job.clientPhone}
              </Text>
            )}
          </InfoCard>
        )}

        <InfoCard style={styles.block}>
          <Text style={styles.blockTitle}>El trabajo</Text>
          <Text style={styles.description}>{job.description}</Text>

          <View style={styles.facts}>
            <Fact label="Oficio" value={job.tradeLabel} />
            <Fact label="Dónde" value={job.addressLine ?? job.city} />
            {job.preferredDate && (
              <Fact
                label="Cuándo"
                value={formatJobWhen(job.preferredDate) ?? '—'}
              />
            )}
            {job.amount !== null && (
              <Fact label="Precio acordado" value={`${job.amount} €`} />
            )}
            {job.amount === null && job.maxBudget !== null && (
              <Fact label="Tu tope" value={`${job.maxBudget} €`} />
            )}
            {job.photoCount > 0 && (
              <Fact
                label="Fotos"
                value={job.photoCount === 1 ? 'Una' : `${job.photoCount}`}
              />
            )}
          </View>
        </InfoCard>

        {/*
          Las pujas siguen viviendo en su pantalla: ahí es donde se comparan y
          se adjudica. Desde aquí solo se llega.
        */}
        {job.viewer === 'client' && job.type === 'AUCTION' && (
          <>
            {job.bidCount !== null && job.bidCount > 0 ? (
              <Button
                fullWidth
                onPress={() => onSeeBids(job.id, job.title)}
                style={styles.bids}
                testID="job-detail-bids"
              >
                {job.bidCount === 1
                  ? 'Ver la puja recibida'
                  : `Ver las ${job.bidCount} pujas`}
              </Button>
            ) : (
              <Text style={styles.noBids}>
                Todavía no has recibido ninguna puja.
              </Text>
            )}
          </>
        )}

        {canReassign && onReassign && (
          <Button
            fullWidth
            onPress={() =>
              onReassign(
                job.id,
                job.trade,
                job.assignedPro?.id ?? null,
                job.type,
              )
            }
            style={styles.bids}
            testID="job-detail-reassign"
          >
            {pickUrgencyPro ? 'Elegir profesional' : 'Buscar'}
          </Button>
        )}

        {/*
          Cancelar, al final y en contorno: es la salida, no lo que se viene a
          hacer aquí. En rojo de urgencia porque no se deshace.
        */}
        {canCancel && (
          <Pressable
            onPress={() => confirmCancel(job.id, (job.bidCount ?? 0) > 0)}
            disabled={isCancelling}
            accessibilityRole="button"
            style={styles.cancel}
            testID="job-detail-cancel"
          >
            <Text style={styles.cancelText}>
              {isCancelling ? 'Cancelando…' : 'Cancelar este trabajo'}
            </Text>
          </Pressable>
        )}
      </Animated.ScrollView>
    </View>
  )
}

/** Un dato con su rótulo, de los que van en fila */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  )
}
