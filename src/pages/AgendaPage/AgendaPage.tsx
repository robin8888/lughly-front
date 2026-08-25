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
import { Money } from '@/components/atoms/Money'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { API_BASE_URL } from '@/api'
import { InfoCard } from '@/components/molecules/InfoCard'
import { RemotePhoto } from '@/components/molecules/RemotePhoto'
import { PhotoViewer } from '@/components/organisms/PhotoViewer'
import { useAssignedJobs } from '@/hooks/domain/useInbox'
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
              {jobs.map((job) => {
                const status = jobStatusLook(job.status)

                return (
                  <InfoCard key={job.id} testID={`assigned-${job.id}`}>
                    <View style={styles.cardHead}>
                      <Text style={styles.jobTitle}>{job.title}</Text>
                      <Tag variant={status.variant}>{status.label}</Tag>
                    </View>

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
