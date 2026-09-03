/**
 * JobDetailPage
 * La ficha de un trabajo: qué pasa con él y quién lo tiene.
 *
 * Faltaba, y se notaba: tocar la tarjeta de un trabajo no hacía nada, así que
 * quien encargaba algo a alguien no tenía dónde ver a quién estaba esperando
 * ni en qué punto estaba. La información existía toda en el servidor,
 * repartida entre la tarjeta y la agenda del profesional; lo que no había
 * era una pantalla que contara la historia.
 *
 * **Lo primero es el estado, y en una frase.** No un rótulo con el nombre
 * interno del estado, sino qué está pasando y a quién se espera, que es la
 * única pregunta que trae aquí a alguien.
 *
 * Sirve a los dos lados: el servidor decide qué campos manda según quién
 * pregunte —al cliente su dirección, a quien va a ir el teléfono del
 * cliente—, así que aquí solo hay que no enseñar lo que llegue vacío.
 */

import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FormScrollView } from '@/components/templates/FormScrollView'
import { useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Dialog } from '@/components/organisms/Dialog'
import { Avatar } from '@/components/atoms/Avatar'
import { formatAmount } from '@/components/atoms/Money'
import { Countdown } from '@/components/atoms/Countdown'
import { WorkTimer } from '@/components/molecules/WorkTimer'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import {
  useJob,
  useCancelJob,
  useCancelContract,
  useJobProgress,
  useApproveStart,
  useCompleteJob,
} from '@/hooks/domain/useJob'
import { API_BASE_URL } from '@/api'
import type { ApiJobDetail, ApiJobType } from '@/api/jobs.api'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
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
      case 'CONTRACTED':
        return 'Es tuyo. Tienes la dirección y el teléfono del cliente.'
      case 'IN_PROGRESS':
        /*
          Terminado no es un estado aparte: es el mismo trabajo esperando al
          cliente, y lo que lo dice es la hora de fin. Aquí importa porque
          cambia lo único que quiere saber quien acaba de terminar — cuándo
          cobra.
        */
        return job.workFinishedAt
          ? 'Has terminado. Falta que el cliente lo dé por bueno; si no dice nada, se da por bueno solo y cobras.'
          : 'Estás con ello. Cuando acabes, márcalo aquí.'
      case 'COMPLETED':
        return 'Cerrado. El importe va de camino a tu cuenta de cobro.'
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

      return 'Publicado y esperando.'
    case 'PENDING_PRO':
      if (job.appointmentStatus === 'PENDING_WORKER') {
        return `${quien} lo ha asignado y falta que quien va a ir lo confirme. Te avisaremos en cuanto esté cerrado.`
      }
      if (job.appointmentStatus === 'SUBSTITUTE_PROPOSED') {
        return `${quien} propone mandar a ${job.substituteProName ?? 'otra persona'}. Decides tú: puedes aceptarlo o cancelar sin coste, desde Mis trabajos.`
      }
      return `Esperando la respuesta de ${quien}. Si no contesta en el plazo, quedarás libre para encargárselo a otro.`
    case 'CONTRACTED':
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
      return job.workFinishedAt
        ? `${quien} dice que ha terminado. Si no nos dices lo contrario, lo damos por bueno y se le paga.`
        : `${quien} está con ello.`
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
  /**
   * Escribirle a quien está al otro lado. Solo se ofrece cuando hay alguien
   * concreto con quien hablar —el mismo criterio que usa el chat en el
   * servidor (`resolveJobThreadSides`): con la asignación ya cerrada, no
   * antes. Sin esto, la pantalla no sabría el nombre ni la foto de quien
   * abre la conversación.
   */
  onOpenChat?: (
    jobId: string,
    title: string,
    otherName: string,
    otherAvatarUrl: string | null,
  ) => void
}

export function JobDetailPage({
  jobId,
  onBack,
  onReassign,
  onOpenChat,
}: JobDetailPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data: job, isPending, isError, refetch } = useJob(jobId)
  const { cancel, isCancelling } = useCancelJob()
  const { cancelContract, isCancelling: isBreaking } = useCancelContract()
  const { start, finish, isStarting, isFinishing } = useJobProgress()
  const { complete, isCompleting } = useCompleteJob()
  const { approveStart, isApproving } = useApproveStart()

  /**
   * El diálogo de romper un contrato, con su motivo.
   *
   * Aparte del `Alert` de cancelar un anuncio: aquí hay que **escribir** algo,
   * y `Alert.prompt` solo existe en iOS. Además la decisión pesa más —al otro
   * lado hay alguien que había apartado la mañana—, así que merece una
   * pantalla que se lea antes de responder.
   */
  const [breaking, setBreaking] = useState(false)
  const [reason, setReason] = useState('')

  /** Se pregunta antes, y con lo que pasa dicho: cancelar no se deshace. */
  const confirmCancel = (id: string) => {
    Alert.alert(
      '¿Cancelar este trabajo?',
      'Se avisará a quien estuviera esperando respuesta. No se puede deshacer.',
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
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
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

  const look = jobStatusLook(job.status, job.appointmentStatus, job.workFinishedAt)
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

  /**
   * Y romperlo cuando ya está contratado, **desde los dos lados**.
   *
   * Estuvo cerrado a propósito —"hay quien ha reservado sus horas, y eso no se
   * deshace con un botón"— y el razonamiento sigue valiendo para un
   * arrepentimiento. Pero las incidencias existen: el profesional se pone
   * malo, al cliente se le inunda el piso el día antes. Sin salida, lo que se
   * hacía era no aparecer, que es peor para los dos y no deja rastro.
   *
   * Por eso pide motivo y no se resuelve con un toque: ver `breaking`.
   */
  const canBreak = job.status === 'CONTRACTED'

  /**
   * El día del trabajo, del lado de quien lo hace.
   *
   * Empezar pide la cita confirmada y terminar pide haber empezado: son las
   * mismas condiciones que el servidor, escritas aquí para que el botón no
   * aparezca cuando pulsarlo daría error. Terminar no cobra —abre el plazo
   * del cliente—, y por eso el texto no promete dinero.
   */
  const canStart =
    job.viewer === 'pro' &&
    job.status === 'CONTRACTED' &&
    job.appointmentStatus === 'CONFIRMED'

  const canFinish =
    job.viewer === 'pro' &&
    job.status === 'IN_PROGRESS' &&
    job.appointmentStatus === 'STARTED' &&
    !job.workFinishedAt

  /**
   * Y el último paso, del cliente: dar por bueno lo terminado.
   *
   * **Es lo que suelta el dinero.** Lo contratado desde la carta se cobró al
   * contratar y sigue retenido; hasta que existió este botón —y su plazo— no
   * había forma de que llegara al profesional.
   */
  const canComplete =
    job.viewer === 'client' && job.status === 'IN_PROGRESS' && Boolean(job.workFinishedAt)

  /**
   * El reloj: al profesional desde que empieza, al cliente **desde que lo
   * reconoce**.
   *
   * Los dos ven el mismo número —cuenta desde `startedAt`, la hora del
   * servidor— pero no en el mismo momento. Al cliente le llega el aviso y un
   * modal preguntándole si ha llegado; hasta que conteste no se le pinta un
   * contador corriendo de algo que todavía no ha dado por cierto. Al confirmar
   * aparece **con el tiempo ya corrido**, que es lo honesto: el trabajo empezó
   * cuando empezó, no cuando él abrió la app.
   *
   * Es la línea que separa las dos cosas que se confundían: el reloj que
   * **cuenta** —del servidor, y no lo mueve nadie— y el reloj que **se ve**.
   * Atarlos dejaría a alguien trabajando sin horas contadas cada vez que un
   * cliente tuviera el móvil en silencio.
   */
  const showTimer =
    Boolean(job.startedAt) &&
    (job.viewer === 'pro' ||
      Boolean(job.startApprovedAt) ||
      Boolean(job.workFinishedAt))

  /**
   * Y el cliente puede reconocer que ha empezado, mientras no lo haya hecho ya
   * ni el profesional haya terminado.
   *
   * **No autoriza nada**: el tiempo corre desde que él pulsó Empezar. Es para
   * que le llegue que del otro lado se han enterado.
   */
  const canApproveStart =
    job.viewer === 'client' &&
    job.status === 'IN_PROGRESS' &&
    Boolean(job.startedAt) &&
    !job.startApprovedAt &&
    !job.workFinishedAt

  /**
   * Lo que hay que preguntarle al cliente nada más abrir, si hay algo.
   *
   * Los dos avisos que le llegan al móvil —«han empezado» y «han terminado»—
   * le traen aquí a contestar algo, y lo que se encontraba era un botón más
   * entre otros en mitad de una ficha larga. El modal es lo que convierte el
   * aviso en una pregunta: se abre solo al llegar, cuenta qué ha pasado y qué
   * significa responder.
   *
   * Cerrarlo sin responder es válido —quien abre la app para otra cosa tiene
   * derecho a hacerla— y por eso no vuelve a saltar en esta visita: lo que
   * quedó pendiente sigue en su botón, más abajo.
   */
  const [asked, setAsked] = useState<Record<'start' | 'complete', boolean>>({
    start: false,
    complete: false,
  })

  const closeAsk = (which: 'start' | 'complete') =>
    setAsked((antes) => ({ ...antes, [which]: true }))

  /** Dar por bueno paga, y pagar no se deshace con otro toque. */
  const doComplete = (id: string) => {
    closeAsk('complete')

    void (async () => {
      const { ok, result, error } = await complete(id)

      if (!ok) {
        Alert.alert('No se ha podido cerrar', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      Alert.alert(
        'Trabajo cerrado',
        result.released > 0
          ? `Gracias. Se le han pagado ${formatAmount(result.released)} € al profesional.`
          : 'Gracias. Queda cerrado.',
      )
    })()
  }

  const doApproveStart = (id: string) => {
    closeAsk('start')
    void approveStart(id)
  }

  /** Diez caracteres, lo mismo que exige el servidor */
  const reasonOk = reason.trim().length >= 10

  return (
    <View style={styles.screen} testID="job-detail-page">
      {header}

      <FormScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
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
          Por qué se canceló, cuando hay motivo escrito.
          
          En su propia tarjeta y justo debajo del estado, porque es lo único
          que se viene a mirar cuando un trabajo aparece cancelado: el aviso al
          móvil llega una vez, y quien tenía el teléfono en silencio se
          encuentra aquí con un "cancelado" y nada más.

          Solo con `reason`: las canceladas antes de que esto se guardara traen
          fecha pero no motivo, y una tarjeta vacía diciendo "se canceló"
          repetiría el estado sin añadir nada.
        */}
        {job.cancellation?.reason && (
          <InfoCard style={styles.block} testID="job-detail-cancellation">
            <Text style={styles.blockTitle}>
              {job.cancellation.byMe
                ? 'Lo cancelaste tú'
                : job.cancellation.side === 'client'
                  ? 'Lo canceló el cliente'
                  : 'Lo canceló el profesional'}
            </Text>
            <Text style={styles.happening}>{job.cancellation.reason}</Text>
          </InfoCard>
        )}

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

          {/*
            Lo contratado de la carta, si nació de ahí: copiado al pedirlo,
            así que sigue enseñando lo que se vio y se pagó aunque el
            profesional haya cambiado su carta después.
          */}
          {job.serviceLines.length > 0 && (
            <View style={styles.serviceLines} testID="job-detail-service-lines">
              {job.serviceLines.map((line, index) => (
                <Text key={`${line.name}-${index}`} style={styles.serviceLine}>
                  {line.name} · {line.price} €
                </Text>
              ))}
            </View>
          )}
        </InfoCard>

        {/*
          El día del trabajo, arriba de las demás acciones: cuando toca, es lo
          único a lo que se entra aquí.
        */}
        {canStart && (
          <Button
            fullWidth
            onPress={() => {
              void (async () => {
                const { ok, error } = await start(job.id)
                if (!ok) {
                  Alert.alert(
                    'No se ha podido empezar',
                    error ?? 'Inténtalo de nuevo en un momento.',
                  )
                }
              })()
            }}
            disabled={isStarting}
            style={styles.bids}
            testID="job-detail-start"
          >
            {isStarting ? 'Un momento…' : 'He llegado, empiezo'}
          </Button>
        )}

        {canFinish && (
          <Button
            fullWidth
            onPress={() => {
              void (async () => {
                const { ok, error } = await finish(job.id)

                if (!ok) {
                  Alert.alert(
                    'No se ha podido marcar como terminado',
                    error ?? 'Inténtalo de nuevo en un momento.',
                  )
                  return
                }

                /*
                  Se dice lo que pasa ahora. Quien acaba de terminar espera
                  cobrar, y encontrarse el trabajo todavía "en curso" sin
                  explicación se lee como que no se ha guardado.
                */
                Alert.alert(
                  'Terminado',
                  'Se lo hemos dicho al cliente. Si no dice lo contrario en 24 horas, se da por bueno y se te paga.',
                )
              })()
            }}
            disabled={isFinishing}
            style={styles.bids}
            testID="job-detail-finish"
          >
            {isFinishing ? 'Un momento…' : 'He terminado'}
          </Button>
        )}

        {/*
          Y el botón que paga. Con el plazo a la vista: es lo que convierte
          "confirma" en una decisión con fecha, y lo que explica que no hacer
          nada también sea una respuesta.
        */}
        {showTimer && job.startedAt && (
          <View style={styles.deadline}>
            <WorkTimer
              startedAt={job.startedAt}
              finishedAt={job.workFinishedAt}
              label={
                job.workFinishedAt
                  ? 'Tiempo trabajado'
                  : job.viewer === 'pro'
                    ? 'Llevas trabajando'
                    : 'Lleva trabajando'
              }
              testID="job-detail-timer"
            />
          </View>
        )}

        {canApproveStart && (
          <Button
            fullWidth
            variant="secondary"
            onPress={() => doApproveStart(job.id)}
            disabled={isApproving}
            style={styles.bids}
            testID="job-detail-approve-start"
          >
            {isApproving ? 'Confirmando…' : 'Confirmar que ha empezado'}
          </Button>
        )}

        {canComplete && (
          <>
            <Button
              fullWidth
              onPress={() => doComplete(job.id)}
              disabled={isCompleting}
              style={styles.bids}
              testID="job-detail-complete"
            >
              {isCompleting ? 'Cerrando…' : 'Todo bien, dalo por bueno'}
            </Button>

            {job.confirmByAt && (
              <View style={styles.deadline}>
                <Text style={styles.deadlineLabel}>Si no dices nada, se cierra en</Text>
                <Countdown
                  target={job.confirmByAt}
                  expiredLabel="Dado por bueno"
                  testID="job-detail-confirm-countdown"
                />
              </View>
            )}
          </>
        )}

        {job.chatWith && onOpenChat && (
          <Button
            fullWidth
            onPress={() => {
              const chatWith = job.chatWith
              if (chatWith) onOpenChat(job.id, job.title, chatWith.name, chatWith.avatarUrl)
            }}
            style={styles.bids}
            testID="job-detail-chat"
          >
            Enviar mensaje
          </Button>
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
            onPress={() => confirmCancel(job.id)}
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

        {/*
          Y la salida cuando ya está contratado. El texto no es el mismo para
          los dos: el cliente cancela un trabajo suyo, y el profesional está
          diciendo que no puede con algo a lo que se comprometió. Llamar a las
          dos cosas "cancelar" le quitaría peso a la segunda.
        */}
        {canBreak && (
          <Pressable
            onPress={() => {
              setReason('')
              setBreaking(true)
            }}
            disabled={isBreaking}
            accessibilityRole="button"
            style={styles.cancel}
            testID="job-detail-break"
          >
            <Text style={styles.cancelText}>
              {job.viewer === 'client'
                ? 'Cancelar el trabajo'
                : 'No puedo hacer este trabajo'}
            </Text>
          </Pressable>
        )}
      </FormScrollView>

      <Dialog
        visible={breaking}
        tone="danger"
        title={
          job.viewer === 'client'
            ? '¿Cancelar el trabajo?'
            : '¿No puedes hacerlo?'
        }
        message={
          job.viewer === 'client'
            ? 'Hay alguien que ha apartado ese rato para ti. Cuéntale qué ha pasado: lo va a leer.'
            : 'El cliente contaba contigo. Cuéntale qué ha pasado: lo va a leer, y cancelar sin explicación cuenta como un plantón.'
        }
        onDismiss={() => setBreaking(false)}
        actions={[
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setBreaking(false),
            testID: 'job-detail-break-back',
          },
          {
            label: isBreaking ? 'Cancelando…' : 'Cancelar el trabajo',
            /*
              Apagado hasta que haya motivo. El servidor lo rechazaría igual,
              pero enterarse después de pulsar convierte en error lo que aquí
              es solo un campo a medio rellenar.
            */
            disabled: !reasonOk || isBreaking,
            onPress: () => {
              void (async () => {
                const { ok, result, error } = await cancelContract(
                  job.id,
                  reason.trim(),
                )

                if (!ok) {
                  Alert.alert(
                    'No se ha podido cancelar',
                    error ?? 'Inténtalo de nuevo en un momento.',
                  )
                  return
                }

                setBreaking(false)

                /*
                  Y se dice qué ha pasado con el dinero, que es lo primero que
                  se pregunta quien cancela algo que ya había pagado. Callarlo
                  obligaría a ir a buscarlo a Pagos.
                */
                /*
                  Soltar una retención y devolver un cobro no son lo mismo
                  para quien lo lee: en el primer caso nunca le llegó a salir
                  el cargo, así que "se te ha devuelto" le mandaría a buscar al
                  banco algo que no existe.
                */
                const dinero =
                  result.releasedCharges > 0
                    ? ' Parte del importe ya se había liberado al profesional: escríbenos y lo revisamos.'
                    : result.refunded > 0
                      ? ` Se han devuelto ${result.refunded} € al método de pago.`
                      : result.voided > 0
                        ? ' Se ha soltado la retención de tu tarjeta: no se te ha cobrado nada.'
                        : ''

                Alert.alert(
                  'Trabajo cancelado',
                  `Hemos avisado a la otra parte.${dinero}`,
                )
              })()
            },
            testID: 'job-detail-break-confirm',
          },
        ]}
        testID="job-detail-break-dialog"
      >
        <Input
          value={reason}
          onChangeText={setReason}
          placeholder="Ej. Me he puesto malo y no puedo ir"
          multiline
          numberOfLines={3}
          editable={!isBreaking}
          testID="job-detail-break-reason"
        />
      </Dialog>

      {/**
        * «Han empezado». Se abre solo al entrar, que es a donde lleva el aviso
        * del móvil.
        *
        * No autoriza nada —el tiempo corre desde que el profesional pulsó
        * Empezar, y eso no lo mueve nadie—: sirve para dos cosas que sí valen.
        * Le dice a quien acaba de entrar en casa de un desconocido que del otro
        * lado se han enterado, y deja las dos versiones de la hora por si un
        * día alguien la discute.
        *
        * Y es lo que le destapa el contador al cliente: hasta que no da por
        * cierto que ha llegado, no se le pinta un reloj corriendo.
        */}
      <Dialog
        visible={canApproveStart && !asked.start}
        title={`¿Ha llegado ${job.assignedPro?.name.split(' ')[0] ?? 'el profesional'}?`}
        message={`${job.assignedPro?.name ?? 'El profesional'} nos ha dicho que ha empezado con "${job.title}". Confírmanoslo y verás el tiempo que lleva trabajando.

El reloj ya corre desde que él lo marcó, así que no pierdes nada por confirmarlo más tarde: solo dejas de verlo hasta entonces.`}
        actions={[
          {
            label: 'Sí, ha llegado',
            onPress: () => doApproveStart(job.id),
            disabled: isApproving,
            testID: 'job-detail-approve-start-confirm',
          },
          {
            label: 'Todavía no',
            variant: 'secondary',
            onPress: () => closeAsk('start'),
            testID: 'job-detail-approve-start-later',
          },
        ]}
        onDismiss={() => closeAsk('start')}
        testID="job-detail-approve-start-dialog"
      />

      {/**
        * «Han terminado». Mismo sitio, misma razón — y aquí además **paga**.
        *
        * Por eso dice lo que significa contestar que sí antes de que se pulse:
        * el dinero retenido sale hacia el profesional y eso no se deshace con
        * otro toque. Y dice también qué pasa si no se contesta, porque callar
        * es una respuesta con fecha: a las 24 horas se da por bueno solo.
        */}
      <Dialog
        visible={canComplete && !asked.complete}
        title="¿Ha quedado todo bien?"
        message={`${job.assignedPro?.name ?? 'El profesional'} ha dado por terminado "${job.title}". Si lo das por bueno cerramos el trabajo y se le paga lo que teníamos retenido.

Si algo no ha ido bien, cierra esto y escríbenos antes de confirmar. Y si no dices nada, a las 24 horas se da por bueno solo.`}
        actions={[
          {
            label: 'Sí, todo bien',
            onPress: () => doComplete(job.id),
            disabled: isCompleting,
            testID: 'job-detail-complete-confirm',
          },
          {
            label: 'Ahora no',
            variant: 'secondary',
            onPress: () => closeAsk('complete'),
            testID: 'job-detail-complete-later',
          },
        ]}
        onDismiss={() => closeAsk('complete')}
        testID="job-detail-complete-dialog"
      />
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
