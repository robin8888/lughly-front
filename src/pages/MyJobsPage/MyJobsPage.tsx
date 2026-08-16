/**
 * MyJobsPage
 * Los trabajos que ha publicado el cliente (MobileApp.dc.html, `isMisTrabajos`).
 *
 * Del diseño falta un bloque, y no por descuido:
 *
 * - **Historial con valoraciones**: hace falta que un trabajo llegue a
 *   terminarse, y el flujo de hitos es de la Fase 10.
 *
 * Se dice al pie en vez de dejar huecos silenciosos.
 */

import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { JobCard } from '@/components/molecules/JobCard'
import { useMyJobs } from '@/hooks/domain/useMyJobs'
import { useRespondSubstitute } from '@/hooks/domain/useInbox'
import type { ApiJob } from '@/api/jobs.api'
import { theme } from '@/theme'
import { styles } from './MyJobsPage.styles'

export interface MyJobsPageProps {
  onPublish: () => void
  onBack: () => void
  onSelectJob?: (jobId: string) => void
}

export function MyJobsPage({ onPublish, onBack, onSelectJob }: MyJobsPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

  const { data, isPending, isError, refetch, isFetching } = useMyJobs()
  const { respond, isResponding } = useRespondSubstitute()

  const jobs = data?.items ?? []

  /**
   * Rechazar cancela el encargo, así que se pregunta antes. Aceptar no: es
   * confirmar lo que la tarjeta acaba de explicar, y meter un diálogo en
   * medio solo añadiría un toque.
   */
  const decideSubstitute = (job: ApiJob, accept: boolean) => {
    const send = () => {
      void respond(job.id, accept).then(({ ok, error }) => {
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
            `${job.substituteProName} hará el trabajo. Ya tiene la dirección y la fecha.`,
          )
        }
      })
    }

    if (accept) {
      send()
      return
    }

    Alert.alert(
      'Cancelar el encargo',
      `Si no aceptas a ${job.substituteProName}, el encargo se cancela y no se te cobra nada. Podrás buscar a otro profesional.`,
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar el encargo', style: 'destructive', onPress: send },
      ],
    )
  }

  return (
    <View style={styles.screen} testID="my-jobs-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mis trabajos</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="my-jobs-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus trabajos"
            message="Revisa tu conexión e inténtalo de nuevo."
            illustration="greeting"
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'my-jobs-retry',
              },
            ]}
            testID="my-jobs-error"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="Todavía no has publicado nada"
            message="Publica un trabajo y recibirás pujas de profesionales valorados. Es gratis y no te compromete a nada: eliges tú."
            actions={[
              {
                label: 'Publicar un trabajo',
                onPress: onPublish,
                testID: 'my-jobs-publish-empty',
              },
            ]}
            testID="my-jobs-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {data?.total} {data?.total === 1 ? 'trabajo' : 'trabajos'}
              {isFetching ? ' · actualizando…' : ''}
            </Text>

            <View style={styles.list}>
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  {...(onSelectJob && { onPress: () => onSelectJob(job.id) })}
                  onRespondSubstitute={(accept) => decideSubstitute(job, accept)}
                  isRespondingSubstitute={isResponding}
                  testID={`job-${job.id}`}
                />
              ))}
            </View>

            <Button
              fullWidth
              onPress={onPublish}
              style={styles.publish}
              testID="my-jobs-publish"
            >
              Publicar nuevo trabajo
            </Button>

            <Text style={styles.pending}>
              El historial de trabajos terminados llega en las siguientes
              fases del roadmap.
            </Text>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
