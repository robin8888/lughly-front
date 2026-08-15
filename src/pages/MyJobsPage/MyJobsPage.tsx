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

import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { JobCard } from '@/components/molecules/JobCard'
import { useMyJobs } from '@/hooks/domain/useMyJobs'
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

  const jobs = data?.items ?? []

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
