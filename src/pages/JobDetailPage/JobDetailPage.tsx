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
import { useEffect, useState } from 'react'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Dialog } from '@/components/organisms/Dialog'
import { Avatar } from '@/components/atoms/Avatar'
import { formatAmount } from '@/components/atoms/Money'
import { Countdown } from '@/components/atoms/Countdown'
import { WorkTimer } from '@/components/molecules/WorkTimer'
import { StartJobButton } from '@/components/molecules/StartJobButton'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoPicker } from '@/components/molecules/PhotoPicker'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { DateTimeField } from '@/components/molecules/DateTimeField'
import { QuoteCard } from '@/components/organisms/QuoteCard'
import { DisputeCard } from '@/components/organisms/DisputeCard'
import {
  useJob,
  useCancelJob,
  useCancelContract,
  useJobProgress,
  useApproveStart,
  useCompleteJob,
  useHoldJob,
  useReviewJob,
  useRejectQuote,
  useAcceptQuote,
  useCancelSession,
  useReschedule,
  useMarkFixed,
  useOpenDispute,
  useAddEvidence,
} from '@/hooks/domain/useJob'
import { StarRating } from '@/components/atoms/StarRating'
import { Checkbox } from '@/components/atoms/Checkbox'
import { overtimeNow } from '@/utils/overtime'
import { API_BASE_URL } from '@/api'
import type { ApiJobDetail, ApiJobSession, ApiJobType } from '@/api/jobs.api'
import type { PickedImage } from '@/hooks/media/usePickImage'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { formatJobWhen } from '@/utils/dates'
import { describeRecurrence } from '@/utils/recurrence'
import { jobStatusLook, jobTypeLabel, jobStateSignature } from '@/utils/jobStatus'
import { useUser } from '@/stores/useAuthStore'
import { useMarkJobStateSeen } from '@/stores/useSeenJobStatesStore'
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
    otherUserId: string,
    otherName: string,
    otherAvatarUrl: string | null,
  ) => void
  /**
   * Escribir el presupuesto, del lado profesional (`CICLOS` §C5).
   *
   * En pantalla aparte y no aquí dentro: son varias líneas con su cantidad y
   * su precio, y meterlas en la ficha convertiría una pantalla de leer en un
   * formulario largo que hay que recorrer para llegar a lo demás.
   */
  onQuote?: (jobId: string) => void
  /**
   * A guardar una tarjeta, para quien va a aceptar un presupuesto y no tiene
   * ninguna. Sin esto, el aviso sería un callejón.
   */
  onAddPaymentMethod?: () => void
}

export function JobDetailPage({
  jobId,
  onBack,
  onReassign,
  onOpenChat,
  onQuote,
  onAddPaymentMethod,
}: JobDetailPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data: job, isPending, isError, refetch } = useJob(jobId)
  const { cancel, isCancelling } = useCancelJob()
  const { cancelContract, isCancelling: isBreaking } = useCancelContract()
  const { start, finish, isStarting, isFinishing } = useJobProgress()
  const { complete, isCompleting } = useCompleteJob()
  const { approveStart, isApproving } = useApproveStart()
  const { hold, isHolding } = useHoldJob()
  const { review, isReviewing } = useReviewJob()
  const { rejectQuote, isRejecting } = useRejectQuote()
  const { acceptQuote, isAccepting } = useAcceptQuote()
  const { cancelSession, isCancelling: isDroppingSession } = useCancelSession()
  const { proposeTime, acceptTime, isRescheduling } = useReschedule()
  const { markFixed, isMarkingFixed } = useMarkFixed()
  const { openDispute, isOpeningDispute } = useOpenDispute()
  const { addEvidence, isAddingEvidence } = useAddEvidence()

  /**
   * Todo el estado va **aquí arriba, con el resto de hooks**, y no junto a lo
   * que lo usa.
   *
   * Más abajo hay dos salidas —cargando y error— y un hook detrás de un
   * `return` no se ejecuta en esos renders. React cuenta los hooks, y en cuanto
   * el número baila la pantalla revienta entera con «Rendered more hooks than
   * during the previous render». Pasó el 3 de septiembre de 2026 al añadir los
   * diálogos: se veían bien al abrir un trabajo ya cargado y tumbaban la ficha
   * al entrar desde cero, que es como se entra de verdad.
   */

  /** Qué foto del resultado se está mirando a pantalla completa. `null` es ninguna */
  const [viewingResult, setViewingResult] = useState<number | null>(null)
  /** Y qué ticket del material, que también hay que poder leer de cerca */
  const [viewingReceipt, setViewingReceipt] = useState<number | null>(null)
  /** Si cobra el rato de más al terminar (`CICLOS` §A6) */
  const [chargeExtra, setChargeExtra] = useState(false)
  /** Y las pruebas de la revisión: las del formulario de abrirla y las de después */
  const [disputing, setDisputing] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeProof, setDisputeProof] = useState<PickedImage[]>([])
  const [newEvidence, setNewEvidence] = useState<PickedImage[]>([])
  /** Qué prueba del expediente se está mirando a pantalla completa */
  const [viewingEvidence, setViewingEvidence] = useState<number | null>(null)
  /** El motivo que escribe el cliente cuando algo no ha quedado bien */
  const [holdReason, setHoldReason] = useState('')
  /** Y el de por qué no le vale el presupuesto (`CICLOS` §C5) */
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  /** Aceptarlo mueve dinero, así que se pregunta antes (§C6) */
  const [accepting, setAccepting] = useState(false)
  /**
   * La sesión del contrato fijo que se está a punto de saltar, si alguna.
   *
   * Se guarda la sesión entera y no su id porque el diálogo tiene que decir
   * **cuál** y **cuánto cuesta**: "¿cancelar la sesión?" sin fecha delante, en
   * una lista de dieciocho, es una pregunta que no se puede contestar.
   */
  const [droppingSession, setDroppingSession] = useState<ApiJobSession | null>(null)
  /**
   * La hora que se está proponiendo para un trabajo que no empezó a la suya
   * (§A9). `null` es "el selector no está abierto".
   *
   * Arranca en media hora a partir de ahora y no en la hora de antes: quien
   * abre esto llega tarde, y proponerle de vuelta la hora que acaba de
   * incumplir no ayuda a nadie.
   */
  const [proposing, setProposing] = useState<Date | null>(null)

  /**
   * Lo que ya se le ha preguntado al cliente en esta visita, si hay algo.
   *
   * Los dos avisos que le llegan al móvil —«han empezado» y «han terminado»—
   * le traen aquí a contestar algo, y lo que se encontraba era un botón más
   * entre otros en mitad de una ficha larga. El diálogo lo convierte en una
   * pregunta: se abre solo al llegar, cuenta qué ha pasado y qué significa
   * responder.
   *
   * Cerrarlo sin responder es válido —quien abre la app para otra cosa tiene
   * derecho a hacerla— y por eso no vuelve a saltar: lo que quedó pendiente
   * sigue en su botón, más abajo.
   */
  const [asked, setAsked] = useState<Record<'start' | 'complete', boolean>>({
    start: false,
    complete: false,
  })

  /** Si está escribiendo el motivo de que algo no haya quedado bien */
  const [holding, setHolding] = useState(false)

  /**
   * La valoración, que se pide **justo al dar por bueno el trabajo**.
   *
   * Es el único momento en que alguien se acuerda de cómo fue: al día
   * siguiente ya no entra nadie a valorar, y un profesional sin valoraciones
   * no se distingue en el directorio de uno malo.
   *
   * Se puede cerrar sin contestar —igual que los otros dos diálogos—, y por
   * eso el trabajo se cierra y se paga **antes** de preguntar: valorar no es
   * una condición para nada, es lo último que se le pide a alguien que ya ha
   * terminado con esto.
   */
  const [reviewing, setReviewing] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  /** Lo que se le acaba de pagar, para decirlo dentro del mismo diálogo */
  const [paidNote, setPaidNote] = useState('')

  /**
   * Abrir la ficha es mirarlo: se apunta en qué estado se ha visto.
   *
   * Es lo que apaga el punto rojo de «esto se ha movido» en Mis trabajos. Va
   * aquí y no en la lista porque mirar la lista no es enterarse: se ve el
   * rótulo, no lo que ha pasado.
   *
   * Solo del lado del cliente, que es de quien es esa lista. Y arriba con el
   * resto de hooks, por lo que dice el apunte de más arriba.
   */
  const user = useUser()
  const markSeen = useMarkJobStateSeen()

  useEffect(() => {
    if (!user || !job || job.viewer !== 'client') return
    markSeen(user.id, job.id, jobStateSignature(job))
  }, [user, job, markSeen])

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
   * El presupuesto vigente: el primero de la lista, que viene del más nuevo al
   * más viejo. `null` en cualquier trabajo que no sea del ciclo de la visita.
   */
  const quote = job.quotes[0] ?? null

  /**
   * Presupuestar, del lado profesional (§C5).
   *
   * Se ofrece con el trabajo contratado o en marcha —ha ido o está yendo— y
   * también después de un rechazo, que es de donde sale la v2: volver con otra
   * versión más ajustada es el camino normal, no una excepción.
   *
   * Y con uno suyo encima de la mesa, para corregir una cifra mal puesta antes
   * de que el cliente conteste. Son las mismas condiciones que comprueba el
   * servidor, escritas aquí para que el botón no salga cuando pulsarlo daría
   * error.
   */
  const canQuote =
    job.viewer === 'pro' &&
    job.type === 'QUOTE' &&
    onQuote !== undefined &&
    ['CONTRACTED', 'IN_PROGRESS', 'QUOTED', 'QUOTE_REJECTED'].includes(job.status)

  /**
   * Y contestarlo, del lado del cliente.
   *
   * Solo al que está pendiente y sin caducar: uno vencido ya no es un precio
   * —el trabajo se cierra solo— y rechazarlo a posteriori pondría un motivo
   * en un documento que ya no decidía nada.
   */
  /**
   * El reparo y la revisión (`CICLOS` §C9).
   *
   * Contestar al reparo es del lado profesional: volver y arreglarlo, o decir
   * que no está de acuerdo. **Pedir revisión pueden los dos**, y solo con un
   * reparo encima de la mesa: sin reparo el trabajo se cierra y se paga solo a
   * las 24 h, así que no hay nada atascado que desatascar.
   */
  /**
   * Lo que lleva de más, si lleva algo. Se recalcula en cada render, que es lo
   * que hace que la cifra siga al reloj mientras el trabajo sigue abierto.
   */
  const overtime = overtimeNow({
    startedAt: job.startedAt,
    bookedMinutes: job.bookedMinutes,
    hourlyRate: job.hourlyRate,
  })

  const conReparo = job.status === 'IN_PROGRESS' && job.holdReason !== null
  const canAnswerHold = conReparo && job.viewer === 'pro'
  /**
   * **Y revisar solo donde tenemos dinero.** Revisar es decidir qué hacemos
   * con lo retenido; del ciclo del presupuesto no retenemos nada desde el 12 de
   * septiembre de 2026 —el arreglo se paga fuera de la app—, así que ahí el
   * botón no aparece. Enseñarlo sería ofrecer una protección que no existe, y
   * el servidor lo rechazaría de todos modos.
   */
  const canOpenDispute = conReparo && job.retained > 0
  const enRevision = job.dispute !== null && job.dispute.resolvedAt === null

  const canAnswerQuote =
    job.viewer === 'client' &&
    quote !== null &&
    quote.status === 'SENT' &&
    new Date(quote.validUntil) > new Date()

  const doRejectQuote = (id: string) => {
    const motivo = rejectReason.trim()
    if (motivo.length < 5) return

    void (async () => {
      const { ok, error } = await rejectQuote(id, motivo)

      if (!ok) {
        Alert.alert(
          'No se ha podido enviar',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
        return
      }

      setRejecting(false)
      setRejectReason('')
    })()
  }

  /**
   * Aceptar el presupuesto (`CICLOS` §C6).
   *
   * **Sin tarjeta y sin cobro desde el 12 de septiembre de 2026**: el arreglo
   * se lo paga el cliente al profesional directamente. Lo que se firma aquí es
   * el acuerdo, y lo que se abre es la cita para ir a hacerlo.
   */
  const doAcceptQuote = (id: string) => {
    void (async () => {
      const { ok, error } = await acceptQuote(id)

      if (!ok) {
        Alert.alert(
          'No se ha podido aceptar',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
        return
      }

      setAccepting(false)
    })()
  }

  /** «He vuelto y ya está arreglado»: el cliente recupera sus 24 horas */
  const doMarkFixed = (id: string) => {
    void (async () => {
      const { ok, error } = await markFixed(id)

      if (!ok) {
        Alert.alert('No se ha podido', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      Alert.alert(
        'Se lo hemos dicho',
        'Tiene 24 horas para mirarlo. Si no dice lo contrario, se da por bueno y se te paga.',
      )
    })()
  }

  /**
   * Pedir que lo revisemos, con lo que tenga para enseñar.
   *
   * Las pruebas van dentro de la misma acción y no en un paso aparte: quien
   * abre una revisión está contando algo, y la foto es la mitad de lo que
   * cuenta. Si alguna no sube se abre igual y se dice cuántas faltaron — una
   * foto perdida no puede dejar a nadie sin poder pedir que le revisen su
   * dinero.
   */
  const doOpenDispute = (id: string) => {
    void (async () => {
      const { ok, error, photosFailed } = await openDispute(
        id,
        disputeReason.trim(),
        disputeProof,
      )

      if (!ok) {
        Alert.alert('No se ha podido', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      setDisputing(false)
      setDisputeReason('')
      setDisputeProof([])

      Alert.alert(
        'Lo estamos mirando',
        photosFailed > 0
          ? `Tendrás respuesta en quince días como mucho. ${photosFailed} de tus fotos no han subido: puedes volver a añadirlas desde la ficha.`
          : 'Tendrás respuesta en quince días como mucho. El dinero sigue retenido mientras tanto.',
      )
    })()
  }

  /** Añadir algo más al expediente, mientras siga abierto */
  const doAddEvidence = (id: string) => {
    void (async () => {
      const { ok, error } = await addEvidence(id, newEvidence)

      if (!ok) {
        Alert.alert('No se ha podido', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      setNewEvidence([])
    })()
  }

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

      /*
        Y en vez del aviso de "cerrado", el mismo dato dentro del diálogo que
        pide la valoración: dos ventanas seguidas se cierran de un manotazo sin
        leer ninguna, y la segunda es la que trae la pregunta.
      */
      setPaidNote(
        result.released > 0
          ? `Cerrado. Se le han pagado ${formatAmount(result.released)} €.`
          : 'Cerrado.',
      )
      setReviewing(true)
    })()
  }

  /**
   * Y la valoración se manda. La nota es obligatoria —es lo que se pinta en su
   * ficha— y el comentario no: quien tiene algo que contar lo escribe sin que
   * se lo exijan, y exigirlo solo produce un "bien" de relleno.
   */
  const doReview = (id: string) => {
    if (rating === 0) return

    void (async () => {
      const { ok, error } = await review(id, rating, reviewComment.trim() || null)

      if (!ok) {
        Alert.alert('No se ha podido enviar', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      setReviewing(false)
      Alert.alert(
        'Gracias',
        'Tu valoración ya está en su ficha. Es lo que mira el siguiente cliente para decidir.',
      )
    })()
  }

  const doApproveStart = (id: string) => {
    closeAsk('start')
    void approveStart(id)
  }

  /**
   * «Falta algo.» Apaga el cierre por silencio y le manda el motivo a quien
   * tiene que volver. No cierra ninguna puerta: dar por bueno sigue estando ahí
   * en cuanto se arregle.
   */
  const doHold = (id: string) => {
    const motivo = holdReason.trim()
    if (motivo.length < 10) return

    setHolding(false)
    closeAsk('complete')

    void (async () => {
      const { ok, error } = await hold(id, motivo)

      if (!ok) {
        Alert.alert('No se ha podido enviar', error ?? 'Inténtalo de nuevo en un momento.')
        return
      }

      setHoldReason('')
      Alert.alert(
        'Se lo hemos dicho',
        'Le llega ahora mismo, con lo que has escrito. Mientras tanto el trabajo no se cierra ni se le paga; cuando lo arregle, podrás darlo por bueno.',
      )
    })()
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
          El trabajo que no ha empezado a su hora (§A9), y lo primero de todo.

          Es lo más urgente que puede haber en esta pantalla: hay diez minutos
          y una decisión, y pasados esos diez minutos el trabajo se cae entero
          —la cita, la agenda y el dinero—. Debajo del estado se leería
          después, y aquí "después" es tarde.
        */}
        {job.lateStart && (
          <InfoCard variant="accent" style={styles.late} testID="job-detail-late">
            <Text style={styles.lateTitle}>
              {job.viewer === 'client'
                ? 'El trabajo no ha empezado'
                : 'No has empezado este trabajo'}
            </Text>

            <View style={styles.deadline}>
              <Text style={styles.deadlineLabel}>Se cancela en</Text>
              <Countdown
                target={job.lateStart.decideByAt}
                expiredLabel="Se está cancelando"
                testID="job-detail-late-countdown"
              />
            </View>

            {/*
              Y qué hacer con ese reloj. Tres estados y tres frases distintas,
              porque son tres situaciones distintas: no hay ninguna hora
              encima de la mesa, la ha puesto el otro, o la he puesto yo y
              estoy esperando.
            */}
            <Text style={styles.lateText}>
              {job.lateStart.proposedAt === null
                ? 'Podéis acordar otra hora. Si no hay ninguna acordada cuando se acabe el tiempo, el trabajo se cancela y no se cobra nada.'
                : job.lateStart.proposedByMe
                  ? `Has propuesto las ${soloHora(job.lateStart.proposedAt)}. Falta que la acepten.`
                  : `Te proponen las ${soloHora(job.lateStart.proposedAt)}.`}
            </Text>

            {/* Aceptar solo lo ve el que no propuso: el otro está esperando */}
            {job.lateStart.proposedAt !== null && !job.lateStart.proposedByMe && (
              <Button
                fullWidth
                loading={isRescheduling}
                disabled={isRescheduling}
                onPress={() => {
                  void (async () => {
                    const { ok, error } = await acceptTime(job.id)

                    Alert.alert(
                      ok ? 'Hora acordada' : 'No se ha podido',
                      ok
                        ? 'El trabajo queda para esa hora. Se lo hemos dicho.'
                        : (error ?? 'Inténtalo de nuevo en un momento.'),
                    )
                  })()
                }}
                style={styles.lateAction}
                testID="job-detail-late-accept"
              >
                Aceptar esa hora
              </Button>
            )}

            {proposing === null ? (
              <Pressable
                onPress={() => setProposing(new Date(Date.now() + 30 * 60_000))}
                disabled={isRescheduling}
                accessibilityRole="button"
                style={styles.lateLink}
                testID="job-detail-late-open"
              >
                <Text style={styles.lateLinkText}>
                  {job.lateStart.proposedAt === null ? 'Proponer otra hora' : 'Proponer otra'}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.lateForm}>
                <DateTimeField
                  value={proposing}
                  onChange={setProposing}
                  mode="datetime"
                  disabled={isRescheduling}
                  testID="job-detail-late-picker"
                />

                <Button
                  fullWidth
                  loading={isRescheduling}
                  disabled={isRescheduling}
                  onPress={() => {
                    void (async () => {
                      const { ok, error } = await proposeTime(job.id, proposing)

                      if (!ok) {
                        Alert.alert(
                          'No se ha podido proponer',
                          error ?? 'Inténtalo de nuevo en un momento.',
                        )
                        return
                      }

                      setProposing(null)

                      Alert.alert(
                        'Hora propuesta',
                        'Se lo hemos dicho. En cuanto la acepten, el trabajo queda para esa hora.',
                      )
                    })()
                  }}
                  style={styles.lateAction}
                  testID="job-detail-late-send"
                >
                  Proponer esta hora
                </Button>
              </View>
            )}
          </InfoCard>
        )}

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

              {/*
                El plazo para revisar, al lado de quien lo ha hecho.

                Estaba suelto entre los dos botones del final, y allí era un
                número sin nombre: se veía "23h 05m" en medio de la pantalla y
                no había forma de saber qué contaba. Aquí va en grande, con su
                rótulo y con lo que pasa al llegar a cero, en la tarjeta que se
                mira para saber quién ha estado en casa.
              */}
              {canComplete && job.confirmByAt && (
                <View style={styles.confirmBox}>
                  <Text style={styles.confirmLabel}>Para revisarlo</Text>
                  <Countdown
                    target={job.confirmByAt}
                    expiredLabel="Se acabó"
                    style={styles.confirmValue}
                    testID="job-detail-confirm-countdown"
                  />
                  <Text style={styles.confirmHint}>
                    Si no dices nada, se da por bueno y se le paga
                  </Text>
                </View>
              )}
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
          El contrato fijo, si lo es (§F).

          Primero el acuerdo en una frase y después sus días, en ese orden:
          quien firmó una limpieza de meses viene a comprobar qué firmó, y
          deducirlo de una lista de dieciocho citas no es comprobarlo.

          Las canceladas se quedan a la vista, tachadas. El hueco **es** la
          información: una semana sin limpieza se ve mirando dónde falta.
        */}
        {job.recurrence && (
          <InfoCard style={styles.block} testID="job-detail-recurrence">
            <Text style={styles.blockTitle}>El contrato fijo</Text>
            <Text style={styles.recurrenceLine}>
              {describeRecurrence(job.recurrence)}
            </Text>

            <Text style={styles.recurrenceNote}>
              {job.recurrence.active
                ? 'Sin fecha de fin: sigue hasta que alguien lo corte.'
                : 'Cortado: no va a haber más sesiones.'}
            </Text>

            {job.sessions.length > 0 && (
              <View style={styles.sessions} testID="job-detail-sessions">
                {job.sessions.map((session) => {
                  const cancelada = session.status === 'CANCELLED'

                  return (
                    <View
                      key={session.id}
                      style={styles.sessionRow}
                      testID={`job-detail-session-${session.id}`}
                    >
                      <Text
                        style={[
                          styles.sessionWhen,
                          cancelada && styles.sessionGone,
                        ]}
                      >
                        {formatJobWhen(session.scheduledAt) ?? '—'}
                      </Text>

                      {cancelada ? (
                        <Text style={styles.sessionTag}>Cancelada</Text>
                      ) : (
                        <View style={styles.sessionRow}>
                          {session.amount !== null && (
                            <Text style={styles.sessionAmount}>
                              {formatAmount(session.amount)}
                            </Text>
                          )}
                          {/*
                            Saltarse un día es la vida normal de un acuerdo de
                            meses, así que el botón está en su fila y no
                            escondido: sin esta puerta, la única salida de "el
                            viernes no puedo" sería cortar el contrato entero.
                          */}
                          {job.status === 'CONTRACTED' && (
                            <Pressable
                              onPress={() => setDroppingSession(session)}
                              disabled={isDroppingSession}
                              accessibilityRole="button"
                              testID={`job-detail-session-drop-${session.id}`}
                            >
                              <Text style={styles.sessionDrop}>Cancelar</Text>
                            </Pressable>
                          )}
                        </View>
                      )}
                    </View>
                  )
                })}
              </View>
            )}
          </InfoCard>
        )}

        {/*
          El presupuesto, o los que haya (§C5).

          **Todos y no solo el vigente**: el rechazado lleva el motivo, y ese
          motivo es la mitad de la conversación —sin él, la v2 aparece de la
          nada y nadie recuerda por qué la v1 no valía—. Del más nuevo al más
          viejo, que es el orden en que se pregunta por ellos.
        */}
        {job.quotes.map((entry, index) => (
          <QuoteCard
            key={entry.id}
            quote={entry}
            testID={`job-detail-quote-${entry.version}`}
          >
            {/*
              Contestar, solo bajo el vigente. Aceptar todavía no está: mueve
              dinero y va con el paso siguiente (§C6). Rechazar sí, porque es
              lo que desbloquea la v2 y no cuesta nada.
            */}
            {index === 0 && canAnswerQuote && (
              <>
                <Button
                  fullWidth
                  onPress={() => setAccepting(true)}
                  loading={isAccepting}
                  style={styles.quoteAction}
                  testID="job-detail-quote-accept"
                >
                  {entry.total > 0
                    ? `Aceptar ${formatAmount(entry.total)} €`
                    : 'Aceptar'}
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onPress={() => setRejecting(true)}
                  style={styles.quoteAction}
                  testID="job-detail-quote-reject"
                >
                  No me vale, dile por qué
                </Button>
              </>
            )}
          </QuoteCard>
        ))}

        {/**
          * El plazo para presupuestar después de la visita (`CICLOS` §C5).
          *
          * Lo ven los dos, y dice lo mismo a cada uno: al que tiene que
          * escribirlo, cuánto le queda; al que espera, cuándo lo tendrá. Antes
          * del 12 de septiembre de 2026 esto no existía porque la visita
          * cerraba el trabajo — y con él, la posibilidad de presupuestar.
          */}
        {job.quoteByAt !== null && (
          <Text style={styles.quoteDeadline} testID="job-detail-quote-deadline">
            {job.viewer === 'pro'
              ? `Tienes hasta el ${formatJobWhen(job.quoteByAt)} para mandarle el presupuesto. Después, el trabajo se cierra con la visita cobrada.`
              : `Te mandará el presupuesto antes del ${formatJobWhen(job.quoteByAt)}. Si no llega, el trabajo se cierra: la visita ya estaba pagada.`}
          </Text>
        )}

        {/*
          Y el botón de hacerlo, del lado del profesional. El texto cambia
          según haya algo ya: "otro" después de un rechazo dice, sin explicarlo,
          que reemitir es lo que toca.
        */}
        {canQuote && (
          <Button
            fullWidth
            onPress={() => onQuote?.(job.id)}
            style={styles.quoteAction}
            testID="job-detail-quote"
          >
            {job.quotes.length === 0
              ? 'Hacer el presupuesto'
              : job.status === 'QUOTE_REJECTED'
                ? 'Mandarle otro presupuesto'
                : 'Cambiar el presupuesto'}
          </Button>
        )}

        {/*
          El día del trabajo, arriba de las demás acciones: cuando toca, es lo
          único a lo que se entra aquí.
        */}
        {canStart && (
          /*
            Con la misma hora que la agenda: el botón es el mismo y está en dos
            pantallas, así que no puede estar encendido en una y apagado en la
            otra —bastaría con entrar en la ficha para saltarse el cierre—.
          */
          <StartJobButton
            canStartAt={job.canStartAt}
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
            isStarting={isStarting}
            style={styles.bids}
            testID="job-detail-start"
          />
        )}

        {/**
          * El rato de más (`CICLOS` §A6), con la cifra hecha.
          *
          * **Apagado por defecto**: que la app lo cobrara sola sería cobrarle
          * al cliente una charla en el rellano, y quien sabe si la media hora
          * de más fue trabajo es quien estaba allí. El importe definitivo lo
          * calcula el servidor con la tarifa congelada; esto es para decidir.
          */}
        {canFinish && overtime !== null && (
          <View style={styles.overtime} testID="job-detail-overtime">
            <Checkbox
              checked={chargeExtra}
              onChange={setChargeExtra}
              testID="job-detail-charge-extra"
            >
              {`Cobrar los ${overtime.minutes} minutos de más (${formatAmount(overtime.amount)} €)`}
            </Checkbox>
            <Text style={styles.overtimeHint}>
              Se le retiene con el resto y tiene 24 horas para decir que no fue
              así, como con todo lo demás.
            </Text>
          </View>
        )}

        {canFinish && (
          <Button
            fullWidth
            onPress={() => {
              void (async () => {
                const { ok, error } = await finish(job.id, [], chargeExtra)

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

        {/**
          * Cómo ha quedado, según quien lo ha hecho.
          *
          * No es una galería: es la prueba sobre la que el cliente da el visto
          * bueno, y el visto bueno suelta el dinero. Por eso va **antes** del
          * botón que paga y no al final de la ficha: la decisión se toma
          * mirando esto.
          */}
        {job.resultPhotos.length > 0 && (
          <InfoCard style={styles.block} testID="job-detail-result-photos">
            <Text style={styles.blockTitle}>Cómo ha quedado</Text>

            <View style={styles.photos}>
              {job.resultPhotos.map((photo, index) => (
                <Pressable
                  key={photo.url}
                  onPress={() => setViewingResult(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver la foto ${index + 1} de cómo ha quedado`}
                  style={styles.photo}
                  testID={`job-detail-result-photo-${index}`}
                >
                  <RemotePhoto
                    uri={`${API_BASE_URL}${photo.url}`}
                    style={styles.photoImage}
                    fallback="No carga"
                  />
                </Pressable>
              ))}
            </View>
          </InfoCard>
        )}

        {/* Y lo que el propio cliente dijo que faltaba, para que no se le olvide */}
        {job.holdReason ? (
          <View style={styles.hold} testID="job-detail-hold">
            <Text style={styles.holdTitle}>
              {job.viewer === 'client'
                ? 'Dijiste que faltaba esto'
                : 'El cliente pide una corrección'}
            </Text>
            <Text style={styles.holdReason}>{job.holdReason}</Text>

            {/**
              * El plazo, y lo que pasa cuando se acabe (`CICLOS` §C9).
              *
              * Las dos partes lo ven, y dice lo mismo para los dos: a las 72 h
              * sin respuesta esto pasa a revisión. Es lo que convierte un
              * reparo en algo que **termina** — antes se quedaba ahí para
              * siempre con el dinero parado.
              */}
            {job.holdAnswerByAt !== null && (
              <Text style={styles.holdDeadline} testID="job-detail-hold-deadline">
                {job.viewer === 'pro'
                  ? 'Si no contestas antes de que se acabe el plazo, lo revisamos nosotros.'
                  : 'Tiene tres días para volver o decir que no está de acuerdo. Si no contesta, lo revisamos nosotros.'}
              </Text>
            )}

            {job.holdAnswerByAt !== null && (
              <Countdown
                target={job.holdAnswerByAt}
                prefix="Plazo para contestar:"
                expiredLabel="El plazo se ha pasado: pasa a revisión"
                testID="job-detail-hold-countdown"
              />
            )}

            {/*
              Sin dinero retenido no hay revisión que ofrecer, y callarlo sería
              dejar a alguien esperando un botón. Se dice qué hay de verdad.
            */}
            {conReparo && job.retained === 0 && (
              <Text style={styles.holdDeadline} testID="job-detail-hold-no-cover">
                Este importe se paga directamente entre vosotros, así que no hay
                nada retenido que podamos decidir. Si no llegáis a un acuerdo,
                te quedan las vías de siempre: reclamarle, consumo o el juzgado.
              </Text>
            )}

            {/* Del lado del profesional: volver, o no estar de acuerdo */}
            {canAnswerHold && (
              <Button
                fullWidth
                onPress={() => doMarkFixed(job.id)}
                disabled={isMarkingFixed}
                style={styles.quoteAction}
                testID="job-detail-fixed"
              >
                {isMarkingFixed ? 'Un momento…' : 'Ya lo he arreglado'}
              </Button>
            )}

            {/*
              Y pedir que lo miremos, que pueden los dos. Para el profesional es
              su única salida si cree que el reparo no tiene fundamento: el
              cierre por silencio está apagado y no puede depender de que el
              cliente se acuerde de pulsar.
            */}
            {canOpenDispute && (
              <Button
                variant="secondary"
                fullWidth
                onPress={() => setDisputing(true)}
                style={styles.quoteAction}
                testID="job-detail-dispute"
              >
                {job.viewer === 'pro' ? 'No estoy de acuerdo' : 'Que lo reviséis vosotros'}
              </Button>
            )}
          </View>
        ) : null}

        {/**
          * La revisión (`CICLOS` §C9), abierta o ya resuelta.
          *
          * Con el expediente dentro: lo que dijo quien la abrió y lo que ha
          * aportado cada parte, con su fecha. Los dos ven lo mismo — un
          * expediente en el que cada uno solo ve lo suyo son dos monólogos.
          */}
        {job.dispute !== null && (
          <DisputeCard
            dispute={job.dispute}
            viewer={job.viewer === 'client' ? 'client' : 'pro'}
            evidence={job.evidence}
            onOpenEvidence={setViewingEvidence}
            testID="job-detail-dispute-card"
          >
            {enRevision && (
              <View style={styles.evidenceAdd}>
                <Text style={styles.evidenceAddTitle}>Aportar algo más</Text>
                <Text style={styles.evidenceAddHint}>
                  Se guarda con la fecha de hoy y lo ve la otra parte. Mientras la
                  revisión siga abierta puedes añadir lo que haga falta.
                </Text>

                <PhotoPicker
                  value={newEvidence}
                  onChange={setNewEvidence}
                  disabled={isAddingEvidence}
                  testID="job-detail-evidence-picker"
                />

                <Button
                  fullWidth
                  variant="secondary"
                  onPress={() => doAddEvidence(job.id)}
                  disabled={isAddingEvidence || newEvidence.length === 0}
                  style={styles.quoteAction}
                  testID="job-detail-evidence-send"
                >
                  {isAddingEvidence ? 'Subiendo…' : 'Aportar como prueba'}
                </Button>
              </View>
            )}
          </DisputeCard>
        )}

        {/*
          Y el botón que paga. Con el plazo a la vista: es lo que convierte
          "confirma" en una decisión con fecha, y lo que explica que no hacer
          nada también sea una respuesta.
        */}
        {/**
          * El contador, suelto y a lo ancho.
          *
          * Iba dentro de `deadline`, que es una fila con línea encima —la caja
          * de «Queda: 3 h»— y ahí el reloj no se podía centrar: una fila mide
          * lo que miden sus hijos, así que el `alignSelf: 'stretch'` del propio
          * componente no tenía a qué estirarse y el número quedaba pegado a la
          * izquierda. Fuera de ella ocupa el ancho y cae en el centro, que es
          * donde tiene que estar lo que se mira de reojo.
          */}
        {showTimer && job.startedAt && (
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
            hint={
              job.workFinishedAt
                ? undefined
                : job.viewer === 'client'
                  ? 'Corre desde que dijo que empezaba'
                  : undefined
            }
            testID="job-detail-timer"
          />
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

            {/*
              Y la otra respuesta, aquí y no en el diálogo: se dice que falta
              algo mirando lo que falta.

              En contorno porque la que se espera es la de arriba, pero en la
              misma columna y del mismo tamaño: no estar conforme no es una
              salida de emergencia escondida al pie de la ficha.
            */}
            <Button
              fullWidth
              onPress={() => setHolding(true)}
              disabled={isCompleting || isHolding}
              style={[styles.bids, styles.holdButton]}
              pressedStyle={styles.holdButtonPressed}
              textStyle={styles.holdButtonText}
              testID="job-detail-hold-open"
            >
              Falta algo
            </Button>

          </>
        )}

        {job.chatWith && onOpenChat && (
          <Button
            fullWidth
            onPress={() => {
              const chatWith = job.chatWith
              if (chatWith) onOpenChat(chatWith.id, chatWith.name, chatWith.avatarUrl)
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
              {/*
                Y en un contrato fijo se dice que es el contrato: en una
                pantalla que acaba de enseñar el botón de cancelar una sesión,
                "cancelar el trabajo" se lee como "cancelar esta cita", y lo
                que hace es llevarse dieciocho.
              */}
              {job.recurrence
                ? job.viewer === 'client'
                  ? 'Cancelar el contrato fijo'
                  : 'No puedo seguir con este contrato'
                : job.viewer === 'client'
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
          job.recurrence
            ? '¿Cancelar el contrato entero?'
            : job.viewer === 'client'
              ? '¿Cancelar el trabajo?'
              : '¿No puedes hacerlo?'
        }
        message={
          /*
            En un fijo lo primero es el tamaño: se caen todas las sesiones que
            quedaban, no la de esta semana. Quien solo quería saltarse un día
            tiene el otro botón, y este es el momento de recordárselo.
          */
          job.recurrence
            ? `Se cancelan ${
                job.sessions.filter((session) => session.status !== 'CANCELLED').length
              } sesiones y el acuerdo se acaba. Si solo no puedes un día, cancela esa sesión y el contrato sigue.`
            : job.viewer === 'client'
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
            label: isBreaking
              ? 'Cancelando…'
              : job.recurrence
                ? 'Cancelar el contrato'
                : 'Cancelar el trabajo',
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

                /* Y en un fijo, cuántas mañanas se ha llevado por delante */
                const sesiones =
                  result.cancelledSessions > 0
                    ? ` Se han cancelado las ${result.cancelledSessions} sesiones que quedaban.`
                    : ''

                Alert.alert(
                  job.recurrence ? 'Contrato cancelado' : 'Trabajo cancelado',
                  `Hemos avisado a la otra parte.${sesiones}${dinero}`,
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

      {/*
        Saltarse un día, con lo que cuesta dicho antes.

        Se pregunta aunque sea gratis: en una lista de dieciocho fechas, el
        toque de al lado cancela la semana que viene, y deshacerlo no existe.
      */}
      <Dialog
        visible={droppingSession !== null}
        tone="danger"
        title="¿Cancelar esta sesión?"
        message={
          droppingSession === null
            ? ''
            : `${formatJobWhen(droppingSession.scheduledAt) ?? 'Esa sesión'}. El contrato sigue: solo se cae ese día.${
                /*
                  Y el dinero, antes de pulsar. Enterarse de una penalización
                  por el extracto del banco es la peor forma de enterarse, y
                  aquí todavía se está a tiempo de no hacerlo.

                  Solo al cliente: quien deja el hueco no paga por dejarlo, así
                  que al profesional decirle nada de cobros sería asustarle con
                  algo que no va a pasar.
                */
                job.viewer !== 'client' || droppingSession.freeCancel
                  ? ' No cuesta nada.'
                  : ' Quedan menos de 24 horas, así que se cobra el mínimo del contrato.'
              }`
        }
        onDismiss={() => setDroppingSession(null)}
        actions={[
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setDroppingSession(null),
            testID: 'job-detail-session-back',
          },
          {
            label: isDroppingSession ? 'Cancelando…' : 'Cancelar la sesión',
            disabled: isDroppingSession,
            onPress: () => {
              void (async () => {
                if (!droppingSession) return

                const { ok, result, error } = await cancelSession(
                  job.id,
                  droppingSession.id,
                )

                if (!ok) {
                  Alert.alert(
                    'No se ha podido cancelar',
                    error ?? 'Inténtalo de nuevo en un momento.',
                  )
                  return
                }

                setDroppingSession(null)

                /*
                  Lo que queda en pie va en el mismo aviso, y no es cortesía:
                  quien acaba de cancelar algo de un contrato de meses necesita
                  ver que no se ha llevado el resto por delante.
                */
                const resto =
                  result.remaining > 0
                    ? ` Quedan ${result.remaining} ${result.remaining === 1 ? 'sesión' : 'sesiones'}.`
                    : ' No quedan más sesiones por delante.'

                const cobro =
                  result.fee > 0
                    ? ` Se ha cobrado el mínimo del contrato: ${formatAmount(result.fee)}.`
                    : ''

                Alert.alert(
                  'Sesión cancelada',
                  `Hemos avisado a la otra parte.${cobro}${resto}`,
                )
              })()
            },
            testID: 'job-detail-session-confirm',
          },
        ]}
        testID="job-detail-session-dialog"
      />

      <PhotoViewer
        photos={job.resultPhotos.map((photo) => `${API_BASE_URL}${photo.fullUrl}`)}
        openAt={viewingResult}
        onClose={() => setViewingResult(null)}
        testID="job-detail-result-viewer"
      />

      {/* El expediente se mira de cerca: en una miniatura no se ve un desconchón */}
      <PhotoViewer
        photos={job.evidence.map((prueba) => `${API_BASE_URL}${prueba.fullUrl}`)}
        openAt={viewingEvidence}
        onClose={() => setViewingEvidence(null)}
        testID="job-detail-evidence-viewer"
      />

      {/**
        * Pedir que lo revisemos nosotros (`CICLOS` §C9).
        *
        * Se dice lo que va a pasar y **lo que no**: el dinero sigue retenido,
        * hay fecha, y esto no decide quién tiene razón ni cierra ninguna
        * puerta. Quien pulsa esto está entregando una decisión sobre su dinero
        * a un tercero; merece saber exactamente qué está entregando.
        *
        * Y se puede aportar la prueba aquí mismo, porque es cuando se tiene
        * delante: el goteo se fotografía cuando se ve, no cuando alguien abre
        * un expediente.
        */}
      <Dialog
        visible={disputing}
        title="¿Lo revisamos nosotros?"
        message={`Lo mira una persona de Lughly con lo que contéis los dos. El dinero sigue retenido y tendrás respuesta en quince días como mucho.\n\nDecidimos qué hacemos con lo retenido, no quién tiene razón: conservas tu derecho a acudir a consumo o a los tribunales.`}
        actions={[
          {
            label: isOpeningDispute ? 'Enviando…' : 'Pedir revisión',
            onPress: () => doOpenDispute(job.id),
            disabled: isOpeningDispute || disputeReason.trim().length < 10,
            testID: 'job-detail-dispute-confirm',
          },
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setDisputing(false),
            testID: 'job-detail-dispute-cancel',
          },
        ]}
        onDismiss={() => setDisputing(false)}
        testID="job-detail-dispute-dialog"
      >
        <Input
          value={disputeReason}
          onChangeText={setDisputeReason}
          placeholder="Cuenta qué ha pasado: quien lo lea no estuvo allí"
          multiline
          numberOfLines={3}
          editable={!isOpeningDispute}
          testID="job-detail-dispute-reason"
        />

        <PhotoPicker
          value={disputeProof}
          onChange={setDisputeProof}
          disabled={isOpeningDispute}
          testID="job-detail-dispute-photos"
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
        * «Han terminado». Mismo sitio y misma razón que el de arriba: es a
        * donde lleva el aviso del móvil.
        *
        * **Aquí no se decide.** Antes preguntaba «¿ha quedado todo bien?» con
        * el sí y el no dentro, y la respuesta a esa pregunta no está en el
        * diálogo: está en las fotos que ha mandado el profesional, y el
        * diálogo las tapa. Se daba el visto bueno —que paga y no se deshace—
        * a ciegas, con lo único que hay que mirar debajo.
        *
        * Así que esto avisa y manda a mirar. Los dos botones que responden
        * viven en la ficha, pegados a las fotos, que es el sitio donde se
        * puede contestar sabiendo qué se contesta.
        */}
      <Dialog
        visible={canComplete && !asked.complete}
        title={`${job.assignedPro?.name.split(' ')[0] ?? 'El profesional'} ha terminado`}
        message={`${job.assignedPro?.name ?? 'El profesional'} ha dado por terminado "${job.title}".

${
  job.resultPhotos.length > 0
    ? 'Mira antes las fotos de cómo ha quedado: están en la ficha, y justo debajo tienes las dos respuestas.'
    : 'En la ficha tienes las dos respuestas.'
} Darlo por bueno cierra el trabajo y le paga lo que teníamos retenido; si algo falta, se lo dices y no se cierra ni se le paga.

Y si no dices nada, a las 24 horas se da por bueno solo.`}
        actions={[
          {
            label: job.resultPhotos.length > 0 ? 'Ver cómo ha quedado' : 'Ver el trabajo',
            onPress: () => closeAsk('complete'),
            testID: 'job-detail-complete-review',
          },
        ]}
        onDismiss={() => closeAsk('complete')}
        testID="job-detail-complete-dialog"
      />

      {/**
        * «¿Cómo ha ido?»: la valoración, nada más dar por bueno el trabajo.
        *
        * Sale aquí porque es el único momento en que alguien se acuerda de
        * cómo fue. Una nota y, si quiere, lo que tenga que contar; y se dice
        * dónde va a salir, que es lo que hace que valga la pena escribirla.
        *
        * **Una nota y no las ocho del desglose.** Ocho preguntas en un modal
        * que sale sin avisar no las contesta nadie: se empieza la primera, se
        * abandona, y no queda ninguna.
        *
        * Se puede cerrar sin valorar: el trabajo ya está cerrado y pagado, y
        * esto no es una condición de nada.
        */}
      <Dialog
        visible={reviewing}
        title="¿Cómo ha ido?"
        message={`${paidNote} Ponle una nota a ${job.assignedPro?.name.split(' ')[0] ?? 'quien lo ha hecho'} y, si quieres, cuenta cómo fue.

Sale en su ficha, con tu nombre y la inicial de tu apellido. Es lo que mira el siguiente cliente para decidir.`}
        actions={[
          {
            label: isReviewing ? 'Enviando…' : 'Enviar valoración',
            onPress: () => doReview(job.id),
            disabled: rating === 0 || isReviewing,
            testID: 'job-detail-review-send',
          },
          {
            label: 'Ahora no',
            variant: 'secondary',
            onPress: () => setReviewing(false),
            testID: 'job-detail-review-later',
          },
        ]}
        onDismiss={() => setReviewing(false)}
        testID="job-detail-review-dialog"
      >
        <StarRating
          rating={rating}
          interactive
          onChange={setRating}
          size={32}
          testID="job-detail-review-stars"
        />

        <Input
          value={reviewComment}
          onChangeText={setReviewComment}
          placeholder="Si quieres, cuenta cómo fue (opcional)"
          multiline
          numberOfLines={3}
          maxLength={1000}
          editable={!isReviewing}
          testID="job-detail-review-comment"
        />
      </Dialog>

      {/**
        * «Falta algo»: por qué no lo da por bueno.
        *
        * Es la salida que faltaba. Antes de esto, un cliente al que el trabajo
        * no le convencía solo podía **callar**, y callar se trataba igual que
        * decir que sí: a las 24 horas se cerraba y se pagaba. Así que la única
        * forma de que no se cerrara era no responder —y el reloj corría igual—.
        *
        * Con esto puesto se apaga ese reloj y el motivo le llega a quien tiene
        * que volver, al móvil y a su agenda. No es una disputa ni un castigo:
        * dar por bueno sigue estando ahí en cuanto se arregle.
        *
        * Diez caracteres mínimo, como al romper un contrato: «mal» no le dice
        * a nadie a qué tiene que volver, y quien lee esto va a coger la
        * furgoneta.
        */}
      <Dialog
        visible={holding}
        tone="danger"
        title="¿Qué falta?"
        message={`Se lo mandamos a ${job.assignedPro?.name.split(' ')[0] ?? 'quien lo ha hecho'} tal cual lo escribas, y mientras tanto el trabajo no se cierra ni se le paga. Cuéntale qué tiene que revisar.`}
        actions={[
          {
            label: isHolding ? 'Enviando…' : 'Enviárselo',
            onPress: () => doHold(job.id),
            disabled: isHolding || holdReason.trim().length < 10,
            testID: 'job-detail-hold-confirm',
          },
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setHolding(false),
            testID: 'job-detail-hold-cancel',
          },
        ]}
        onDismiss={() => setHolding(false)}
        testID="job-detail-hold-dialog"
      >
        <Input
          value={holdReason}
          onChangeText={setHoldReason}
          placeholder="Ej. El grifo sigue goteando por la junta de abajo"
          multiline
          numberOfLines={3}
          editable={!isHolding}
          testID="job-detail-hold-reason"
        />
      </Dialog>

      {/**
        * Decir que no al presupuesto, con el motivo.
        *
        * **El motivo se exige**, y no por burocracia: es lo único que le dice
        * al profesional qué cambiar en la versión siguiente. Un "no" a secas
        * convierte reemitir en adivinar, y lo que sigue a un presupuesto
        * rechazado sin motivo es casi siempre nada.
        *
        * Y se dice lo que **no** pasa al rechazar, que es lo que la gente teme:
        * el trabajo no se cierra, y sigue pudiendo llegar otro precio.
        */}
      <Dialog
        visible={rejecting}
        title="¿Qué no te encaja?"
        message="Se lo mandamos tal cual lo escribas. El trabajo no se cierra: puede mandarte otro presupuesto con lo que le digas. La visita que ya pagaste no se devuelve —el viaje se hizo—, pero se descuenta igual del próximo."
        actions={[
          {
            label: isRejecting ? 'Enviando…' : 'Enviárselo',
            onPress: () => doRejectQuote(job.id),
            disabled: isRejecting || rejectReason.trim().length < 5,
            testID: 'job-detail-quote-reject-confirm',
          },
          {
            label: 'Volver',
            variant: 'secondary',
            onPress: () => setRejecting(false),
            testID: 'job-detail-quote-reject-cancel',
          },
        ]}
        onDismiss={() => setRejecting(false)}
        testID="job-detail-quote-reject-dialog"
      >
        <Input
          value={rejectReason}
          onChangeText={setRejectReason}
          placeholder="Ej. El material me parece caro, ¿hay otra marca?"
          multiline
          numberOfLines={3}
          editable={!isRejecting}
          testID="job-detail-quote-reject-reason"
        />
      </Dialog>

      {/**
        * Aceptar el presupuesto (§C6).
        *
        * **No se cobra nada aquí desde el 12 de septiembre de 2026**, y el
        * diálogo lo dice con esas palabras. Es lo más importante de esta
        * pantalla: un cliente que crea que ya ha pagado se planta delante del
        * profesional sin dinero, y un profesional que espere una transferencia
        * nuestra la espera para siempre.
        *
        * La cuenta entera sigue estando —la visita que ya pagó va descontada, y
        * si no se dice parece que se le cobra dos veces el mismo viaje— porque
        * lo que se acepta es ese número, aunque lo pague fuera.
        */}
      <Dialog
        visible={accepting}
        title="¿Aceptas el presupuesto?"
        message={
          quote === null
            ? ''
            : [
                quote.visitCredit > 0
                  ? `${formatAmount(quote.linesTotal)} € del arreglo, menos los ${formatAmount(quote.visitCredit)} € de la visita que ya pagaste: ${formatAmount(quote.total)} €.`
                  : `Son ${formatAmount(quote.total)} €.`,
                'Este importe se lo pagas directamente a quien hace el trabajo, como acordéis entre vosotros: Lughly no lo cobra ni lo retiene.',
                'Aceptar cierra el acuerdo y abre la cita para que vaya.',
              ].join('\n\n')
        }
        actions={[
          {
            label: isAccepting ? 'Aceptando…' : 'Aceptar el presupuesto',
            onPress: () => doAcceptQuote(job.id),
            disabled: isAccepting,
            testID: 'job-detail-quote-accept-confirm',
          },
          {
            label: 'Ahora no',
            variant: 'secondary',
            onPress: () => setAccepting(false),
            testID: 'job-detail-quote-accept-cancel',
          },
        ]}
        onDismiss={() => setAccepting(false)}
        testID="job-detail-quote-accept-dialog"
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

/** "11:30", que es como se dice una hora cuando el día es hoy */
function soloHora(iso: string): string {
  const date = new Date(iso)

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
