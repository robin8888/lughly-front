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
  useCancelSession,
  useReschedule,
  useMarkFixed,
  useOpenDispute,
  useAddEvidence,
} from '@/hooks/domain/useJob'
import { useRespondSubstitute } from '@/hooks/domain/useInbox'
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
        return `${quien} propone mandar a ${job.substituteProName ?? 'otra persona'}. Decides tú: aceptas, o se cancela y no se te cobra nada.`
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
   * A guardar una tarjeta, para quien va a contratar y no tiene ninguna. Sin
   * esto, el aviso sería un callejón.
   */
  onAddPaymentMethod?: () => void
}

export function JobDetailPage({
  jobId,
  onBack,
  onReassign,
  onOpenChat,
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
  const { cancelSession, isCancelling: isDroppingSession } = useCancelSession()
  const { proposeTime, acceptTime, isRescheduling } = useReschedule()
  const { markFixed, isMarkingFixed } = useMarkFixed()
  const { openDispute, isOpeningDispute } = useOpenDispute()
  const { addEvidence, isAddingEvidence } = useAddEvidence()
  const { respond: respondSubstitute, isResponding } = useRespondSubstitute()

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
   * Le proponen a otra persona y tiene que decir (`assign-job`, el camino del
   * sustituto).
   *
   * **Faltaba aquí**, y lo encontró Robin probándolo: el botón de aceptar solo
   * estaba en la tarjeta de Mis trabajos, y la ficha —que es donde entra
   * cualquiera desde el aviso— solo ofrecía cancelar y un texto que la mandaba
   * a otra pantalla. El camino se acababa ahí: quien quería aceptar no tenía
   * cómo, y lo único que podía pulsar era tirar el encargo.
   */
  const decideSustituto =
    job.viewer === 'client' && job.appointmentStatus === 'SUBSTITUTE_PROPOSED'

  const responderSustituto = (accept: boolean) => {
    const enviar = () => {
      void respondSubstitute(job.id, accept).then(({ ok, error }) => {
        if (!ok) {
          Alert.alert(
            'No se ha podido enviar tu respuesta',
            error ?? 'Inténtalo de nuevo en un momento.',
          )
          return
        }

        if (accept) {
          Alert.alert(
            'Cambio aceptado',
            `${job.substituteProName ?? 'Quien va a ir'} hará el trabajo. Ya tiene la dirección y la fecha.`,
          )
        }
      })
    }

    /*
      Aceptar no pregunta: es confirmar lo que la pantalla acaba de explicar, y
      un diálogo en medio solo añade un toque. Rechazar sí, porque **cancela el
      encargo** — y eso no se deshace.
    */
    if (accept) {
      enviar()
      return
    }

    Alert.alert(
      'Cancelar el encargo',
      `Si no aceptas a ${job.substituteProName ?? 'esa persona'}, el encargo se cancela y no se te cobra nada. Podrás buscar a otro profesional.`,
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar el encargo', style: 'destructive', onPress: enviar },
      ],
    )
  }

  /**
   * Lo que le va a costar cancelar, dicho **antes** de pulsar
   * (`COMO_SE_CONTRATA` §6).
   *
   * La cifra viene del servidor —es la misma cuenta que después cobra— y aquí
   * solo se envuelve en palabras. Decirlo antes no es cortesía: es la
   * diferencia entre una penalización y un cargo sorpresa, y lo segundo acaba
   * en una reclamación aunque el importe sea correcto.
   *
   * Cuando sale gratis **también se dice**. Quien tiene una cancelación
   * delante da por hecho que le va a costar algo, y callarlo hace que no
   * cancele: se limita a no aparecer, que es justo lo que esto viene a evitar.
   */
  const costeDeCancelar =
    job.viewer !== 'client'
      ? ''
      : job.cancelFee > 0
        ? ` Cancelar ahora cuesta ${formatAmount(job.cancelFee)} €: es lo que ya no puede recuperar de ese hueco. El resto se te devuelve.`
        : ' Avisas con tiempo, así que no te cuesta nada.'

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

  /**
   * Una visita cerrada a la que todavía le falta el presupuesto (`CICLOS` §C5).
   *
   * Se mira contra el reloj y no solo contra el campo: `quoteByAt` se queda
   * escrito en el trabajo para siempre, y lo que aquí importa es si ese plazo
   * sigue vivo — porque es el mismo que mantiene abierto el chat, que es por
   * donde tiene que llegar el documento.
   */
  const esperaPresupuesto =
    job.quoteByAt !== null && new Date(job.quoteByAt) > new Date()

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
            {/*
              El impuesto, debajo del precio y no dentro: el precio ya lo
              lleva —las tarifas de la app son finales— así que lo que falta
              no es sumar, es decir cuánto de eso es IVA. A un consumidor hay
              que enseñárselo, y a quien está exento hay que no inventárselo.
            */}
            {job.vat !== null && (
              <Fact
                label={job.vat.rate > 0 ? `IVA incluido (${job.vat.rate} %)` : 'IVA'}
                value={
                  job.vat.rate > 0
                    ? `${formatAmount(job.vat.vat)} €`
                    : (job.vat.exemptionReason ?? 'Exento')
                }
              />
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

          {/**
            * Lo que cobra de verdad quien hace el trabajo, y lo que se queda
            * Lughly. **Solo para él.**
            *
            * Se enseñó también al cliente durante unas horas del 20 de
            * septiembre de 2026, y Robin lo quitó el mismo día: él paga un
            * precio, no compra un desglose de nuestro negocio, y partírselo
            * delante solo consigue que el precio parezca hinchado.
            *
            * No hace falta preguntar el rol aquí: **el servidor manda `null` a
            * quien no le toca**, que es el sitio correcto para decidirlo — lo
            * que no es suyo ni siquiera viaja.
            *
            * Y solo cuando hay cobro: antes sería una cuenta sobre un dinero
            * que todavía no ha puesto nadie, y en lo que se paga fuera de la
            * app —un presupuesto— la respuesta honrada es cero.
            */}
          {job.commission !== null && job.commission > 0 && (
            <View style={styles.commission} testID="job-detail-commission">
              <Text style={styles.commissionTitle}>Lo que cobras</Text>
              <View style={styles.commissionRow}>
                <Text style={styles.commissionLabel}>Recibes</Text>
                <Text style={styles.commissionValue}>
                  {formatAmount(job.proNet ?? 0)} €
                </Text>
              </View>
              <View style={styles.commissionRow}>
                <Text style={styles.commissionLabel}>Comisión de Lughly</Text>
                <Text style={styles.commissionValue}>
                  {formatAmount(job.commission)} €
                </Text>
              </View>
              <Text style={styles.commissionNote}>
                Se descuenta al transferirte el dinero. La comisión quedó fijada
                al cobrar, así que no cambia aunque subas de nivel después.
              </Text>
            </View>
          )}

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

        {/**
          * La visita, cobrada y cerrada, con el presupuesto todavía por llegar
          * (`CICLOS` §C5).
          *
          * Lo ven los dos y dice lo mismo a cada uno: que lo que se contrató
          * —ir a verlo— está hecho y pagado, que el precio del arreglo llega
          * por el chat, y hasta cuándo se pueden escribir. Lo último no es un
          * detalle: pasada esa fecha el hilo se calla, y el profesional que lo
          * mande el día después descubriría que no tiene por dónde.
          *
          * **Y se dice quién cobra el arreglo**, aquí también. Un cliente que
          * crea que ya lo ha pagado se planta delante del profesional sin
          * dinero.
          *
          * Solo mientras el plazo está vivo: la fecha se queda escrita en el
          * trabajo para siempre, y enseñar «podéis escribiros hasta el 5 de
          * octubre» en noviembre sería mentir.
          */}
        {esperaPresupuesto && job.quoteByAt !== null && (
          <Text style={styles.quoteDeadline} testID="job-detail-quote-deadline">
            {job.viewer === 'pro'
              ? `La visita queda cobrada. Si le vas a pasar presupuesto, mándaselo por el chat: podéis escribiros hasta el ${formatJobWhen(job.quoteByAt)}. Lo que acordéis va entre vosotros — el arreglo no se paga por la app.`
              : `La visita ya está pagada. El presupuesto te lo pasará por el chat, donde podéis escribiros hasta el ${formatJobWhen(job.quoteByAt)}. Si lo aceptas, el arreglo se lo pagas a él directamente.`}
          </Text>
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

        {/*
          Aceptar o no al sustituto, arriba de todo lo demás: mientras esto
          esté sin contestar, es lo único que hay que hacer en esta pantalla.
        */}
        {decideSustituto && (
          <>
            <Button
              fullWidth
              onPress={() => responderSustituto(true)}
              disabled={isResponding}
              style={styles.bids}
              testID="job-detail-substitute-accept"
            >
              {`Aceptar a ${job.substituteProName ?? 'quien proponen'}`}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              onPress={() => responderSustituto(false)}
              disabled={isResponding}
              style={styles.quoteAction}
              testID="job-detail-substitute-decline"
            >
              No me vale: cancelar el encargo
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
              ? `Hay alguien que ha apartado ese rato para ti. Cuéntale qué ha pasado: lo va a leer.${costeDeCancelar}`
              : 'El cliente contaba contigo. Se le devuelve todo, aunque falten dos horas: quien deja el hueco no cobra por dejarlo. Cuéntale qué ha pasado, y ten en cuenta que queda anotado en tu ficha.'
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
                /*
                  La penalización primero, cuando la hay: es lo que va a
                  buscar quien acaba de cancelar tarde, y leer «se te han
                  devuelto 28 €» sin saber que se han quedado otros 28 se
                  entiende como un error nuestro.
                */
                const multa =
                  result.fee > 0
                    ? ` Se han cobrado ${formatAmount(result.fee)} € por avisar con poco margen, y van para quien tenía apartado el rato.`
                    : ''

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
                  `Hemos avisado a la otra parte.${sesiones}${multa}${dinero}`,
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
        {/*
          Las dos cosas en su propio bloque y con aire entre ellas: el diálogo
          pone sus hijos uno detrás de otro sin separación, así que las
          estrellas quedaban pegadas al campo de la reseña.
        */}
        <View style={styles.reviewForm}>
          <View style={styles.reviewStars}>
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size={34}
              testID="job-detail-review-stars"
            />
          </View>

          <Input
            value={reviewComment}
            onChangeText={setReviewComment}
            placeholder="Si quieres, cuenta cómo fue (opcional)"
            multiline
            numberOfLines={3}
            maxLength={1000}
            editable={!isReviewing}
            style={styles.reviewComment}
            testID="job-detail-review-comment"
          />
        </View>
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
