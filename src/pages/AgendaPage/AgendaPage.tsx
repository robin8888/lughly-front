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

import { View, Text, ActivityIndicator, Pressable, Linking, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { Money } from '@/components/atoms/Money'
import { Tag } from '@/components/atoms/Tag'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { useAssignedJobs } from '@/hooks/domain/useInbox'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { formatJobWhen } from '@/utils/dates'
import { jobStatusLook, jobTypeLabel } from '@/utils/jobStatus'
import { theme } from '@/theme'
import { styles } from './AgendaPage.styles'

export interface AgendaPageProps {
  onBack: () => void
}

export function AgendaPage({ onBack }: AgendaPageProps) {
  const onScroll = useNavScrollHandler()
  const { data, isPending, isError, refetch, isFetching } = useAssignedJobs()

  const jobs = data?.items ?? []

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
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mi agenda</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
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
                    <Text style={styles.when}>
                      {(job.preferredDate && formatJobWhen(job.preferredDate)) ??
                        'Sin fecha acordada todavía'}
                    </Text>

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
                          testID={`assigned-${job.id}-call`}
                        >
                          <Text style={styles.phone}>{job.clientPhone} · Llamar</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.noPhone}>Sin teléfono en su cuenta</Text>
                      )}
                    </View>

                    <Text style={styles.description} numberOfLines={5}>
                      {job.description}
                    </Text>

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
    </View>
  )
}
