/**
 * AgendaPage
 * Los trabajos que este profesional tiene asignados.
 *
 * Es la otra cara de "Mis trabajos": esa es del cliente y enseña lo que ha
 * publicado; esta es de quien va a hacerlo. Sin ella, a un trabajador se le
 * avisaba por el móvil de que le habían asignado algo y no tenía dónde
 * mirarlo.
 *
 * Aquí sí va la dirección completa y el teléfono del cliente. Es la regla del
 * README al revés: se ocultan mientras el trabajo esté en el aire, y se
 * entregan en cuanto hay alguien asignado, porque a partir de ese momento
 * hacen falta para trabajar.
 *
 * Lo que **no** va, si es empleado, es el importe: el dinero es de la empresa
 * que le dio de alta. El servidor lo manda ya en null; aquí solo se respeta.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable, Linking, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Button } from '@/components/atoms/Button'
import { Money } from '@/components/atoms/Money'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { API_BASE_URL } from '@/api'
import { InfoCard } from '@/components/molecules/InfoCard'
import { WorkTimer } from '@/components/molecules/WorkTimer'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { useAssignedJobs } from '@/hooks/domain/useInbox'
import { useJobProgress } from '@/hooks/domain/useJob'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { formatJobWhen } from '@/utils/dates'
import { jobStatusLook, jobTypeLabel } from '@/utils/jobStatus'
import { theme } from '@/theme'
import { styles } from './AgendaPage.styles'

export interface AgendaPageProps {
  onBack: () => void
}

export function AgendaPage({ onBack }: AgendaPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data, isPending, isError, refetch, isFetching } = useAssignedJobs()
  const { start, finish, isStarting, isFinishing } = useJobProgress()

  const jobs = data?.items ?? []

  /**
   * Qué foto se está mirando, y de qué trabajo. Con el trabajo dentro porque
   * la agenda tiene varios y cada uno sus fotos: solo con el índice, abrir la
   * segunda del segundo trabajo enseñaría la segunda del primero.
   */
  const [viewing, setViewing] = useState<{ jobId: string; index: number } | null>(
    null,
  )
  const viewingJob = jobs.find((job) => job.id === viewing?.jobId)

  /**
   * Llamar al cliente es lo que más se hace desde aquí: se va de camino y se
   * avisa. Se abre el marcador con el número puesto, sin llamar solo: quien
   * toca sin querer no debe encontrarse una llamada en marcha.
   */
  const call = (phone: string, name: string) => {
    void Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert(
        `Teléfono de ${name}`,
        `${phone}\n\nNo hemos podido abrir el marcador. Puedes copiarlo a mano.`,
      )
    })
  }

  return (
    <View style={styles.screen} testID="agenda-page">
      <View style={styles.header}>
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mi agenda</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="agenda-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tu agenda"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'agenda-retry' },
            ]}
            testID="agenda-error"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="Nada asignado por ahora"
            message="Aquí aparecerán los trabajos que tengas que hacer, con la dirección, cuándo es y el teléfono del cliente."
            testID="agenda-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {jobs.length} {jobs.length === 1 ? 'trabajo' : 'trabajos'}
              {isFetching ? ' · actualizando…' : ''}
            </Text>

            <View style={styles.list}>
              {/*
                Uno cada vez: con otro en marcha no se puede empezar el
                siguiente. Lo decide el servidor —ahí está la regla— pero el
                botón se apaga aquí y dice por qué: dejarle pulsar para
                devolverle un error es hacerle descubrir la norma a base de
                topetazos, y encima de pie en un portal.
              */}
              {jobs.map((job) => {
                const status = jobStatusLook(job.status)

                const enCurso = jobs.find(
                  (otro) => otro.status === 'IN_PROGRESS' && !otro.workFinishedAt,
                )
                const bloqueadoPor =
                  enCurso && enCurso.id !== job.id ? enCurso : null

                /**
                 * El fondo, por el punto en que está. Del mismo color que su
                 * etiqueta: el color no dice nada nuevo, subraya lo que ya
                 * pone. Ver `cardContracted` y sus hermanos.
                 */
                const tint =
                  job.status === 'IN_PROGRESS'
                    ? styles.cardInProgress
                    : job.status === 'COMPLETED'
                      ? styles.cardCompleted
                      : styles.cardContracted

                /*
                  El contador va en la tarjeta y no solo en la ficha: quien
                  está dentro de una casa trabajando no debería tener que
                  abrir un trabajo para ver cuánto lleva. Se para solo cuando
                  marca "He terminado" —`workFinishedAt`—, aunque el cliente
                  aún no lo haya dado por bueno: el reloj mide el trabajo, no
                  el papeleo.
                */
                const showTimer =
                  job.startedAt !== null && job.status === 'IN_PROGRESS'

                return (
                  <InfoCard key={job.id} style={tint} testID={`assigned-${job.id}`}>
                    <View style={styles.cardHead}>
                      <Text
                        style={[
                          styles.jobTitle,
                          job.status === 'COMPLETED' && styles.jobTitleDone,
                        ]}
                      >
                        {job.title}
                      </Text>
                      <Tag variant={status.variant}>{status.label}</Tag>
                    </View>

                    {showTimer && (
                      <WorkTimer
                        startedAt={job.startedAt!}
                        finishedAt={job.workFinishedAt}
                        label={job.workFinishedAt ? 'Duró' : 'Llevas trabajando'}
                        testID={`assigned-${job.id}-timer`}
                      />
                    )}

                    <Text style={styles.meta}>
                      {job.tradeLabel} · {jobTypeLabel(job.type)}
                    </Text>

                    {/**
                     * El día, lo primero después del título: es una agenda y
                     * lo que se viene a mirar es cuándo toca.
                     */}
                    {/*
                      `formatJobWhen` y no `formatLongDateTime`: los trabajos
                      publicados antes de que se pidiera la hora no la tienen, y
                      pintársela diría "a las 02:00" —medianoche UTC—, una hora
                      a la que nadie va a ir. El helper enseña la hora solo
                      cuando el dato la trae.
                    */}
                    <View style={styles.whenBox}>
                      <Text style={styles.whenLabel}>Cuándo</Text>
                      <Text style={styles.when}>
                        {(job.preferredDate && formatJobWhen(job.preferredDate)) ??
                          'Sin fecha acordada todavía'}
                      </Text>
                    </View>

                    <View style={styles.block}>
                      <Text style={styles.blockLabel}>Dónde</Text>
                      <Text style={styles.address}>
                        {job.addressLine ?? 'Dirección pendiente de que la dé el cliente'}
                      </Text>
                      <Text style={styles.city}>{job.city}</Text>
                    </View>

                    <View style={styles.block}>
                      <Text style={styles.blockLabel}>Cliente</Text>
                      <Text style={styles.client}>{job.clientName}</Text>

                      {job.clientPhone ? (
                        <Pressable
                          onPress={() => call(job.clientPhone!, job.clientName)}
                          accessibilityRole="button"
                          accessibilityLabel={`Llamar a ${job.clientName}`}
                          style={styles.call}
                          testID={`assigned-${job.id}-call`}
                        >
                          <Text style={styles.callText}>
                            Llamar · {job.clientPhone}
                          </Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.noPhone}>Sin teléfono en su cuenta</Text>
                      )}
                    </View>

                    <View style={styles.block}>
                      <Text style={styles.blockLabel}>El trabajo</Text>
                      <Text style={styles.description}>{job.description}</Text>
                    </View>

                    {/*
                      Las fotos que puso el cliente. Se ven aquí y se abren de
                      una en una: en una miniatura de 90 px no se distingue el
                      modelo de un grifo, y es justo lo que hay que saber antes
                      de coger las herramientas.
                    */}
                    {job.photos.length > 0 && (
                      <View style={styles.block}>
                        <Text style={styles.blockLabel}>
                          {job.photos.length === 1
                            ? 'Una foto del cliente'
                            : `${job.photos.length} fotos del cliente`}
                        </Text>

                        <View style={styles.photos}>
                          {job.photos.map((photo, index) => (
                            <Pressable
                              key={photo.fullUrl}
                              onPress={() =>
                                setViewing({ jobId: job.id, index })
                              }
                              accessibilityRole="imagebutton"
                              accessibilityLabel="Ver la foto más grande"
                              style={styles.photo}
                              testID={`assigned-${job.id}-photo-${index}`}
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

                    {/**
                     * El día del trabajo, en la pantalla en la que se vive.
                     *
                     * Aquí y no solo en la ficha porque esta es la lista que
                     * se abre estando en el portal: dos toques menos para lo
                     * que se hace de pie en la calle. Terminar no cobra —abre
                     * el plazo del cliente—, así que el texto no lo promete.
                     */}
                    {job.status === 'CONTRACTED' &&
                      job.appointmentStatus === 'CONFIRMED' && (
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
                          disabled={isStarting || bloqueadoPor !== null}
                          style={styles.action}
                          testID={`assigned-${job.id}-start`}
                        >
                          {isStarting ? 'Un momento…' : 'He llegado, empiezo'}
                        </Button>
                      )}

                    {/* Y por qué está apagado, que si no parece que la app falla */}
                    {job.status === 'CONTRACTED' &&
                      job.appointmentStatus === 'CONFIRMED' &&
                      bloqueadoPor !== null && (
                        <Text
                          style={styles.blocked}
                          testID={`assigned-${job.id}-blocked`}
                        >
                          Tienes «{bloqueadoPor.title}» en curso. Termina ese antes de
                          empezar este: el tiempo no puede correr en dos a la vez.
                        </Text>
                      )}

                    {job.status === 'IN_PROGRESS' &&
                      job.appointmentStatus === 'STARTED' &&
                      !job.workFinishedAt && (
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

                              Alert.alert(
                                'Terminado',
                                'Se lo hemos dicho al cliente. Si no dice lo contrario en 24 horas, se da por bueno y se te paga.',
                              )
                            })()
                          }}
                          disabled={isFinishing}
                          style={styles.action}
                          testID={`assigned-${job.id}-finish`}
                        >
                          {isFinishing ? 'Un momento…' : 'He terminado'}
                        </Button>
                      )}

                    {/*
                      Y cuando ya se ha terminado, lo que hay que saber es
                      cuándo se cobra. Sin esta línea el trabajo se queda en la
                      agenda sin botón y sin explicación, que se lee como que
                      algo no se ha guardado.
                    */}
                    {job.workFinishedAt && job.status === 'IN_PROGRESS' && (
                      <Text
                        style={styles.awaitingClient}
                        testID={`assigned-${job.id}-awaiting`}
                      >
                        Terminado. Falta que el cliente lo dé por bueno; si no
                        dice nada, se da por bueno solo y cobras.
                      </Text>
                    )}

                    {/**
                     * El importe solo si es suyo. A un empleado el servidor
                     * lo manda en null, y en su lugar se le dice por qué en
                     * vez de dejar un hueco que parezca un fallo.
                     */}
                    {job.amount !== null ? (
                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Importe</Text>
                        <Money amount={job.amount} size="small" style={styles.amount} />
                      </View>
                    ) : (
                      <Text style={styles.noAmount}>
                        El importe y la factura los lleva la empresa que te dio de
                        alta.
                      </Text>
                    )}
                  </InfoCard>
                )
              })}
            </View>
          </>
        )}
      </Animated.ScrollView>

      <PhotoViewer
        photos={(viewingJob?.photos ?? []).map(
          (photo) => `${API_BASE_URL}${photo.fullUrl}`,
        )}
        openAt={viewingJob ? (viewing?.index ?? 0) : null}
        onClose={() => setViewing(null)}
        testID="agenda-photo-viewer"
      />
    </View>
  )
}
