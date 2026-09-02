/**
 * InboxPage
 * Los encargos que hay pendientes de responder.
 *
 * El cliente eligió a una persona del directorio, pero si trabaja para
 * alguien el encargo llega aquí, a su empresa: es quien contrata, presupuesta
 * y factura. Aquí se decide a quién se manda, y el trabajador se entera
 * entonces.
 *
 * Un autónomo sin gente a cargo ve lo suyo y se asigna a sí mismo de un
 * toque. No se le esconde la pantalla: el encargo directo también le llega
 * a él y también tiene 24 horas para contestar.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Countdown } from '@/components/atoms/Countdown'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { AssignmentConfirm } from '@/components/organisms/AssignmentConfirm'
import { InfoCard } from '@/components/molecules/InfoCard'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { useInbox, useAssignJob } from '@/hooks/domain/useInbox'
import { useEmployees, useEmployer } from '@/hooks/domain/useEmployees'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useProfileChecklist } from '@/hooks/domain/useProfileChecklist'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { useUser } from '@/stores/useAuthStore'
import type { ApiInboxItem } from '@/api/assignments.api'
import { formatJobWhen, timeLeft } from '@/utils/dates'
import { jobTypeLabel } from '@/utils/jobStatus'
import type { ApiJobType } from '@/api/jobs.api'
import { API_BASE_URL } from '@/api'
import { theme } from '@/theme'
import { styles } from './InboxPage.styles'

export interface InboxPageProps {
  onBack: () => void
  /** A poner el horario, que sin él no se puede aceptar */
  onGoToSchedule: () => void
  /** A subir el documento de identidad, por lo mismo */
  onGoToDocuments: () => void
}

export function InboxPage({
  onBack,
  onGoToSchedule,
  onGoToDocuments,
}: InboxPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const user = useUser()
  const isEmployee = useIsEmployee()

  /**
   * También para un empleado desde el 20 Agosto 2026: aquí es donde confirma
   * lo que su empresa le asigna. Antes no se le pedía nada porque no tenía
   * nada que responder.
   */
  const { data, isPending, isError, refetch } = useInbox()

  /** El que se está respondiendo en el diálogo, si hay alguno */
  const [confirming, setConfirming] = useState<ApiInboxItem | null>(null)

  /** La foto que se está mirando a pantalla completa, si hay alguna */
  const [viewing, setViewing] = useState<{ jobId: string; index: number } | null>(
    null,
  )
  const { assign, isAssigning } = useAssignJob()

  /**
   * Qué le falta para poder aceptar.
   *
   * Se mira **aquí**, en la pantalla a la que lleva el aviso de «te han
   * elegido», y no en Mi cuenta: es el único momento en que a nadie le da
   * pereza rellenarlo, porque hay un trabajo de verdad esperando. El servidor
   * lo comprueba igual al aceptar; esto es para que no se entere pulsando.
   */
  const { data: checklist } = useProfileChecklist()

  const missingToAccept = [
    checklist?.schedule === 'MISSING' && 'tu horario de trabajo',
    checklist?.identityDocuments === 'MISSING' && 'tu documento de identidad',
  ].filter((entry): entry is string => typeof entry === 'string')

  /**
   * Los suyos, para poder mandar a otro. Solo se piden si tiene empresa: a
   * un autónomo la llamada le devolvería un 403.
   */
  const { data: employerData } = useEmployer(!isEmployee)
  const employer = employerData?.employer ?? null
  const { data: employeesData } = useEmployees(employer !== null)
  const employees = employeesData?.items ?? []

  const items = data?.items ?? []

  /** El encargo cuya foto se está mirando, para dárselas al visor */
  const viewingJob = viewing
    ? (items.find((item) => item.id === viewing.jobId) ?? null)
    : null

  /**
   * Trabaja solo: ni tiene empresa ni gente a cargo.
   *
   * Para él la pregunta "¿quién va?" no existe —el encargo es suyo y no hay a
   * quién mandar—, así que en vez de una lista de una sola opción se le dan
   * los dos botones que de verdad tiene: aceptar o rechazar.
   *
   * Se mira `employer` **y** la plantilla: un autónomo puede haberse declarado
   * empleador y no haber dado de alta a nadie todavía, y hasta que tenga a
   * alguien su decisión sigue siendo la de uno solo.
   */
  const trabajaSolo = employer === null || employees.length === 0

  const doAssign = (job: ApiInboxItem, proId: string, proName: string) => {
    void assign(job.id, proId).then(({ ok, result, error }) => {
      if (!ok) {
        Alert.alert(
          'No se ha podido asignar',
          error ?? 'Inténtalo de nuevo en un momento.',
        )
        return
      }

      Alert.alert(
        result?.awaitingClient ? 'Propuesta enviada' : 'Trabajo asignado',
        result?.awaitingClient
          ? `El cliente pidió a ${job.requestedProName}, así que tiene que aceptar el cambio a ${proName} antes de que el trabajo sea vuestro. Si lo rechaza, el encargo se cancela sin coste.`
          : `${proName} ya lo tiene asignado, con la dirección y la fecha.`,
      )
    })
  }

  /**
   * Se pregunta antes de mandar a alguien distinto, porque no es lo mismo:
   * asignar al que pidió el cliente cierra el encargo, y proponer a otro lo
   * deja en el aire hasta que él conteste.
   */
  const confirmAssign = (job: ApiInboxItem, proId: string, proName: string) => {
    if (proId === job.requestedProId) {
      doAssign(job, proId, proName)
      return
    }

    Alert.alert(
      `¿Mandar a ${proName}?`,
      `El cliente eligió a ${job.requestedProName} mirando su ficha. Le preguntaremos si acepta el cambio, y hasta que conteste el trabajo no es vuestro.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Proponer el cambio', onPress: () => doAssign(job, proId, proName) },
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
      <Text style={styles.title}>Encargos</Text>
    </View>
  )

  /**
   * A un empleado se le explica solo cuando no tiene nada: los encargos los
   * responde su empresa, pero **lo que ella le asigna lo confirma él**, y eso
   * sí vive aquí. Antes se le cerraba la pantalla entera.
   */
  if (isEmployee && !isPending && items.length === 0) {
    return (
      <View style={styles.screen} testID="inbox-page">
        {header}
        <EmptyState
          title="Los encargos los lleva tu empresa"
          message="Cuando un cliente te elige, el encargo le llega a quien te dio de alta. Lo que te asigne aparecerá aquí para que digas si puedes hacerlo."
          actions={[{ label: 'Volver', onPress: onBack, testID: 'inbox-employee-back' }]}
          testID="inbox-employee"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="inbox-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="inbox-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar los encargos"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'inbox-retry' },
            ]}
            testID="inbox-error"
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Ningún encargo pendiente"
            message="Aquí aparecerán los trabajos que un cliente os encargue eligiéndoos en el directorio. Tenéis 24 horas para responder a cada uno."
            testID="inbox-empty"
          />
        ) : (
          <View style={styles.list}>
            {/**
             * Lo que le falta para poder aceptar, encima de todo y antes de
             * tocar nada.
             *
             * Aceptar es comprometerse a presentarse en casa de alguien y
             * cobrar: sin horario puesto, lo que vio el cliente era una
             * suposición nuestra, y sin documento no hay nada con lo que
             * responder. El servidor lo rechaza igual, pero enterarse al
             * pulsar «Aceptar» —con el reloj de 24 horas corriendo— es la
             * peor forma de saberlo.
             */}
            {missingToAccept.length > 0 && (
              <InfoCard style={styles.blocked} testID="inbox-missing">
                <Text style={styles.blockedTitle}>
                  Te falta algo para poder aceptar
                </Text>
                <Text style={styles.blockedBody}>
                  Antes de aceptar un trabajo tienes que poner{' '}
                  {missingToAccept.join(' y ')}. Se hace una vez.
                </Text>

                <View style={styles.blockedActions}>
                  {checklist?.schedule === 'MISSING' && (
                    <Pressable
                      onPress={onGoToSchedule}
                      accessibilityRole="button"
                      style={styles.blockedAction}
                      testID="inbox-missing-schedule"
                    >
                      <Text style={styles.blockedActionText}>Poner mi horario</Text>
                    </Pressable>
                  )}

                  {checklist?.identityDocuments === 'MISSING' && (
                    <Pressable
                      onPress={onGoToDocuments}
                      accessibilityRole="button"
                      style={styles.blockedAction}
                      testID="inbox-missing-documents"
                    >
                      <Text style={styles.blockedActionText}>Subir mi documento</Text>
                    </Pressable>
                  )}
                </View>
              </InfoCard>
            )}

            {items.map((job) => {
              const deadline = job.respondByAt ? new Date(job.respondByAt) : null
              const isProposed = job.appointmentStatus === 'SUBSTITUTE_PROPOSED'

              /**
               * Los que esperan una respuesta suya, que son los que hay que
               * encontrar de un vistazo en una lista larga. Un sustituto
               * propuesto no cuenta: ese espera al cliente, no a él.
               */
              const unanswered = !isProposed

              return (
                <InfoCard
                  key={job.id}
                  style={unanswered ? styles.cardUnanswered : undefined}
                  testID={`inbox-${job.id}`}
                >
                  <Text style={styles.jobTitle}>{job.title}</Text>

                  <View style={styles.cardTags}>
                    {/*
                      En rojo y con palabras, no solo con color: quien no
                      distingue el rojo tiene que poder encontrarlos igual.
                      Va delante del tipo porque es lo que se busca.
                    */}
                    {unanswered && (
                      <View style={styles.unansweredTag}>
                        <Text style={styles.unansweredTagText}>Sin responder</Text>
                      </View>
                    )}
                    <Tag variant="outline">
                      {jobTypeLabel(job.type as ApiJobType)}
                    </Tag>
                  </View>

                  <Text style={styles.meta}>
                    {job.tradeLabel} · {job.city}
                    {job.preferredDate
                      ? ` · para el ${formatJobWhen(job.preferredDate)}`
                      : ''}
                  </Text>

                  <Text style={styles.requested}>
                    El cliente pidió a{' '}
                    <Text style={styles.strong}>{job.requestedProName}</Text>
                  </Text>

                  <Text style={styles.description} numberOfLines={4}>
                    {job.description}
                  </Text>

                  {/*
                    Las fotos del cliente, **antes de responder**. Es lo que
                    separa decidir de adivinar: una fuga, un mueble roto o una
                    pared con humedad se valoran mirándolos, y hasta ahora aquí
                    solo viajaba el recuento.
                  */}
                  {job.photos.length > 0 && (
                    <View style={styles.photosBlock}>
                      <Text style={styles.photosLabel}>
                        {job.photos.length === 1
                          ? 'Una foto del cliente'
                          : `${job.photos.length} fotos del cliente`}
                      </Text>

                      <View style={styles.photos}>
                        {job.photos.map((photo, index) => (
                          <Pressable
                            key={photo.fullUrl}
                            onPress={() => setViewing({ jobId: job.id, index })}
                            accessibilityRole="imagebutton"
                            accessibilityLabel="Ver la foto más grande"
                            style={styles.photo}
                            testID={`inbox-${job.id}-photo-${index}`}
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

                  {job.maxBudget !== null && (
                    <Text style={styles.budget}>
                      Presupuesto máximo del cliente: {job.maxBudget} €
                    </Text>
                  )}

                  {deadline && (
                    <View style={styles.deadline}>
                      <Text style={styles.deadlineLabel}>Para responder</Text>
                      <Countdown
                        target={job.respondByAt}
                        expiredLabel="Plazo cumplido"
                        testID={`inbox-${job.id}-countdown`}
                      />
                      {timeLeft(deadline) === null && (
                        <Text style={styles.expired}>
                          El cliente ya puede contratar a otro.
                        </Text>
                      )}
                    </View>
                  )}

                  {job.appointmentStatus === 'PENDING_WORKER' ? (
                    /**
                     * Lo que le han asignado y tiene que confirmar. Se responde
                     * en el mismo diálogo que sale al entrar en la app, para
                     * que la pregunta y el motivo se pidan igual en los dos
                     * sitios.
                     */
                    <Pressable
                      onPress={() => setConfirming(job)}
                      style={styles.primaryChoice}
                      accessibilityRole="button"
                      testID={`inbox-${job.id}-answer`}
                    >
                      <Text style={styles.primaryChoiceText}>
                        ¿Puedes hacerlo?
                      </Text>
                      <Text style={styles.primaryChoiceHint}>
                        Te lo ha asignado tu empresa
                      </Text>
                    </Pressable>
                  ) : isProposed ? (
                    /**
                     * Ya se propuso a alguien y toca esperar. Se deja a la
                     * vista en vez de sacarlo de la lista: si desapareciera,
                     * la empresa no tendría dónde ver que sigue en el aire.
                     */
                    <Text style={styles.waiting}>
                      Has propuesto mandar a{' '}
                      <Text style={styles.strong}>{job.substituteProName}</Text>.
                      Esperando a que el cliente acepte el cambio.
                    </Text>
                  ) : trabajaSolo ? (
                    /**
                     * Trabaja solo: el encargo es para él y no hay a quién
                     * mandar, así que la pregunta "¿quién va?" sobra. Se le
                     * dan las dos respuestas que de verdad tiene.
                     *
                     * Aceptar es asignárselo al profesional que pidió el
                     * cliente, que es él mismo: por eso no hace falta mirar
                     * `canAssignToSelf` —el servidor ya comprobó que tiene el
                     * oficio cuando dejó que le pidieran el encargo—.
                     */
                    <View style={styles.actions}>
                      <Pressable
                        onPress={() =>
                          confirmAssign(job, job.requestedProId, job.requestedProName)
                        }
                        disabled={isAssigning}
                        style={styles.primaryChoice}
                        accessibilityRole="button"
                        testID={`inbox-${job.id}-accept`}
                      >
                        <Text style={styles.primaryChoiceText}>Aceptar</Text>
                        <Text style={styles.primaryChoiceHint}>
                          El trabajo pasa a ser tuyo
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setConfirming(job)}
                        disabled={isAssigning}
                        style={styles.choice}
                        accessibilityRole="button"
                        testID={`inbox-${job.id}-decline`}
                      >
                        <Text style={styles.choiceText}>Rechazar</Text>
                        <Text style={styles.choiceHint}>
                          El cliente queda libre para buscar a otro
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <Text style={styles.actionsLabel}>¿Quién va?</Text>

                      {/**
                       * El que pidió el cliente va primero y destacado: es lo
                       * que menos fricción tiene para todos y lo que no
                       * necesita que nadie más apruebe nada.
                       */}
                      <Pressable
                        onPress={() =>
                          confirmAssign(job, job.requestedProId, job.requestedProName)
                        }
                        disabled={isAssigning}
                        style={styles.primaryChoice}
                        accessibilityRole="button"
                        testID={`inbox-${job.id}-assign-requested`}
                      >
                        <Text style={styles.primaryChoiceText}>
                          {job.requestedProName}
                        </Text>
                        <Text style={styles.primaryChoiceHint}>
                          El que pidió el cliente
                        </Text>
                      </Pressable>

                      {/*
                        "Yo mismo" estaba condicionado a no tener empresa, y
                        eso dejaba fuera al autónomo con gente a cargo: él
                        también trabaja, pero no sale en su propia lista de
                        empleados, así que solo podía asignarse un encargo si el
                        cliente le había pedido a él por su nombre.

                        Se excluye cuando ya es el profesional pedido, porque
                        entonces el botón de arriba es él y saldrían dos para la
                        misma persona.

                        `canAssignToSelf` lo dice el servidor. Antes no venía y
                        el botón se ofrecía siempre: una empresa a la que
                        piden un encargo de fontanería pero está dada de alta
                        como electricista lo pulsaba y se comía el error. Deducirlo
                        aquí exigiría pedir los oficios propios en otra llamada
                        y copiar una regla que ya vive en el servidor.
                      */}
                      {user?.id && user.id !== job.requestedProId && (
                        <Pressable
                          onPress={() => confirmAssign(job, user.id, 'Tú')}
                          disabled={isAssigning || !job.canAssignToSelf}
                          style={[
                            styles.choice,
                            !job.canAssignToSelf && styles.choiceBlocked,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: !job.canAssignToSelf }}
                          testID={`inbox-${job.id}-assign-self`}
                        >
                          <Text style={styles.choiceText}>Yo mismo</Text>
                          {!job.canAssignToSelf && (
                            <Text style={styles.choiceHint}>
                              No tienes este oficio dado de alta
                            </Text>
                          )}
                        </Pressable>
                      )}

                      {/*
                        La misma regla vale para la plantilla, y aquí no hace
                        falta preguntar al servidor porque los oficios de cada
                        uno ya vienen en la lista de empleados. Se apagan en vez
                        de esconderse: quien no encuentra a los suyos en la
                        lista cree que la app falla.
                      */}
                      {employees
                        .filter((employee) => employee.id !== job.requestedProId)
                        .map((employee) => {
                          const canDoIt = employee.trades.some(
                            (trade) => trade.slug === job.trade,
                          )

                          return (
                            <Pressable
                              key={employee.id}
                              onPress={() =>
                                confirmAssign(job, employee.id, employee.name)
                              }
                              disabled={isAssigning || !canDoIt}
                              style={[
                                styles.choice,
                                !canDoIt && styles.choiceBlocked,
                              ]}
                              accessibilityRole="button"
                              accessibilityState={{ disabled: !canDoIt }}
                              testID={`inbox-${job.id}-assign-${employee.id}`}
                            >
                              <Text style={styles.choiceText}>{employee.name}</Text>
                              <Text style={styles.choiceHint}>
                                {canDoIt
                                  ? employee.trades.map((t) => t.label).join(' · ')
                                  : `No tiene ${job.tradeLabel.toLowerCase()} dado de alta`}
                              </Text>
                            </Pressable>
                          )
                        })}

                      {/*
                        Decir que no, sin esperar a que caduque. Hasta ahora la
                        única forma era dejarlo morir: el cliente pasaba 24
                        horas mirando un "esperando respuesta" que ya no iba a
                        llegar, y quien no podía no tenía cómo decirlo.

                        Va al final y en contorno: lo que se espera de esta
                        pantalla es repartir trabajo, no soltarlo.
                      */}
                      <Pressable
                        onPress={() => setConfirming(job)}
                        disabled={isAssigning}
                        style={styles.choice}
                        accessibilityRole="button"
                        testID={`inbox-${job.id}-decline`}
                      >
                        <Text style={styles.choiceText}>No podemos</Text>
                        <Text style={styles.choiceHint}>
                          El cliente queda libre para buscar a otro
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </InfoCard>
              )
            })}
          </View>
        )}
      </Animated.ScrollView>

      <AssignmentConfirm
        job={confirming}
        onDismiss={() => setConfirming(null)}
        testID="inbox-confirm"
      />

      {/* Igual que en la agenda: se toca una miniatura y se abre entera */}
      <PhotoViewer
        photos={(viewingJob?.photos ?? []).map(
          (photo) => `${API_BASE_URL}${photo.fullUrl}`,
        )}
        openAt={viewingJob ? (viewing?.index ?? 0) : null}
        onClose={() => setViewing(null)}
        testID="inbox-photo-viewer"
      />
    </View>
  )
}
