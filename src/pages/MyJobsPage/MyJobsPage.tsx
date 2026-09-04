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

import { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { Button } from '@/components/atoms/Button'
import { EmptyState } from '@/components/molecules/EmptyState'
import { jobTypeLabel } from '@/utils/jobStatus'
import { JobCard } from '@/components/molecules/JobCard'
import { useMyJobs } from '@/hooks/domain/useMyJobs'
import { useJobNews } from '@/hooks/domain/useJobNews'
import { useRespondSubstitute } from '@/hooks/domain/useInbox'
import type { ApiJob, ApiJobType } from '@/api/jobs.api'
import { theme } from '@/theme'
import { styles } from './MyJobsPage.styles'

export interface MyJobsPageProps {
  /** Ir a encargar un trabajo nuevo: el directorio, donde se elige a alguien */
  onBrowse: () => void
  onBack: () => void
  /** Cualquier trabajo lleva a su ficha: qué pasa con él, a quién se espera y quién lo hace */
  onSelectJob?: (jobId: string, title: string) => void
  /**
   * Buscar otro profesional para un trabajo que se quedó sin nadie. Lleva el
   * oficio, para filtrar el directorio, y a quién dijo que no, para apagarlo
   * allí y que no se le vuelva a elegir por error.
   *
   * Y el tipo, porque una urgencia no se busca en el mismo sitio: manda a la
   * lista de los que están de guardia ahora, no al directorio entero. De poco
   * sirve una lista de carpinteros cuando lo que hace falta es uno que salga
   * de casa esta noche.
   */
  onReassign?: (
    jobId: string,
    trade: string,
    declinedProId: string | null,
    type: ApiJobType,
  ) => void
}

export function MyJobsPage({
  onBrowse,
  onBack,
  onSelectJob,
  onReassign,
}: MyJobsPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data, isPending, isError, refetch, isFetching } = useMyJobs()
  const { respond, isResponding } = useRespondSubstitute()

  const jobs = data?.items ?? []

  /**
   * Cuáles se han movido desde que se miraron.
   *
   * Es lo que la lista no decía: los trabajos están repartidos en pestañas y
   * el aviso al móvil llega una vez, así que para saber si había algo nuevo
   * había que entrar en las dos y leerlas enteras.
   */
  const hasNews = useJobNews(jobs)

  /**
   * Los trabajos, agrupados por cómo se contrata.
   *
   * Son formas distintas de esperar y se siguen distinto: una reserva espera
   * la confirmación de alguien concreto y una urgencia espera a que alguien
   * la coja en minutos. Mezcladas en una sola lista se leían igual.
   *
   * **Sin subasta** (v3 §0: "sin subasta en esta versión de la app"): ya no
   * se ofrece esa forma de contratar, así que no tiene pestaña propia aquí.
   * Retirarla del todo —el `JobType` del servidor, las pantallas de pujas—
   * es la Fase 7 del roadmap y no es este cambio; esto solo quita la pestaña
   * de esta lista, que es lo que se pidió.
   *
   * El orden es fijo y no el de llegada: es el mismo en el que se ofrecen al
   * publicar, y así la lista no cambia de forma cada vez que entra algo nuevo.
   *
   * Las etiquetas salen de `jobTypeLabel`, que es donde ya vive el nombre de
   * cada tipo: dos sitios con los mismos nombres acabarían discrepando.
   */
  const groups = (['QUOTE', 'INSTANT', 'URGENT'] as const)
    .map((type) => ({
      type,
      label: jobTypeLabel(type),
      jobs: jobs.filter((job) => job.type === type),
    }))
    .map((group) => ({ ...group, news: group.jobs.some(hasNews) }))
    .filter((group) => group.jobs.length > 0)

  /**
   * Se ve un grupo cada vez, con pestañas para cambiar.
   *
   * Con los cuatro seguidos, quien tiene diez trabajos abre la pantalla y ve
   * un muro: para llegar a sus urgencias hay que pasar por encima de todo lo
   * demás. Cada pestaña lleva su número, así que lo que no se está mirando
   * sigue estando a la vista.
   *
   * Sin pestaña de "todos" a propósito: sería volver al muro con un nombre.
   */
  const [openTab, setOpenTab] = useState<ApiJobType | null>(null)

  /**
   * La elegida, o la primera que tenga algo. Se resuelve al pintar y no al
   * elegir para que la pantalla nunca quede en una pestaña que se ha vaciado
   * —al adjudicar la última subasta, por ejemplo—.
   */
  const current =
    groups.find((group) => group.type === openTab) ?? groups[0] ?? null

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
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mis trabajos</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
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
            title="Todavía no has encargado nada"
            message="Busca en el directorio y encárgale el trabajo a un profesional valorado: por hora, a tarifa cerrada o pidiendo presupuesto."
            actions={[
              {
                label: 'Buscar un profesional',
                onPress: onBrowse,
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

            {/*
              Las pestañas solo si hay más de un tipo: con uno solo serían una
              pestaña sola, que no elige nada.
            */}
            {groups.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                /*
                  `flexGrow: 0` no es adorno: dentro de un scroll vertical, uno
                  horizontal se come todo el alto que quede, y las píldoras se
                  estiran con él. Se veía al elegir una —el fondo de color
                  ocupaba media pantalla— y cambiaba de tamaño según cuántos
                  trabajos tuviera la pestaña, porque cambiaba el alto de abajo.
                */
                style={styles.tabsScroll}
                contentContainerStyle={styles.tabs}
              >
                {groups.map((group) => {
                  const isOpen = group.type === current?.type
                  // La urgencia va en su propio rojo, cerrada o abierta: es
                  // lo que la distingue de un vistazo entre las pestañas.
                  const isUrgent = group.type === 'URGENT'

                  return (
                    <Pressable
                      key={group.type}
                      onPress={() => setOpenTab(group.type)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: isOpen }}
                      style={[
                        styles.tab,
                        isUrgent && !isOpen && styles.tabUrgent,
                        isOpen && (isUrgent ? styles.tabUrgentOpen : styles.tabOpen),
                      ]}
                      testID={`my-jobs-tab-${group.type}`}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          isUrgent && !isOpen && styles.tabTextUrgent,
                          isOpen && styles.tabTextOpen,
                        ]}
                      >
                        {group.label} · {group.jobs.length}
                      </Text>

                      {/*
                        Y el punto que dice en cuál hay algo nuevo. Sin él,
                        saber si se ha movido algo obliga a abrir las dos
                        pestañas y leerlas: la pestaña cerrada no cuenta nada
                        de lo suyo salvo cuántos hay.

                        Blanco sobre el rojo de urgencias, que es la única
                        píldora donde un punto rojo no se vería.
                      */}
                      {group.news && (
                        <View
                          style={[
                            styles.tabDot,
                            isUrgent && isOpen && styles.tabDotOnUrgent,
                          ]}
                          accessible
                          accessibilityLabel="Hay novedades"
                          testID={`my-jobs-tab-${group.type}-news`}
                        />
                      )}
                    </Pressable>
                  )
                })}
              </ScrollView>
            )}

            <View style={styles.list}>
              {current && (
                <View key={current.type} style={styles.group}>
                  {current.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      /*
                        Todas llevan a su ficha, no solo las subastas: hasta
                        ahora tocar un encargo directo no hacía nada, y era
                        justo donde había algo que preguntar —a quién se espera
                        y en qué punto está—.
                      */
                      {...(onSelectJob && {
                        onPress: () => onSelectJob(job.id, job.title),
                      })}
                      {...(onReassign && {
                        onReassign: () =>
                          onReassign(job.id, job.trade, job.proId, job.type),
                      })}
                      hasNews={hasNews(job)}
                      onRespondSubstitute={(accept) => decideSubstitute(job, accept)}
                      isRespondingSubstitute={isResponding}
                      testID={`job-${job.id}`}
                    />
                  ))}
                </View>
              )}
            </View>

            <Button
              fullWidth
              onPress={onBrowse}
              style={styles.publish}
              testID="my-jobs-publish"
            >
              Encargar un trabajo nuevo
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
