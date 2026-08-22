/**
 * HomePage
 * Home del cliente (HOME_MOBILE.md).
 *
 * Solo compone organismos: cero estilos de contenido aquí.
 *
 * **Adelgazada el 18 Agosto 2026.** Tenía cinco secciones numeradas y cuatro
 * eran folleto: los tres pasos, la regla de la subasta inversa, una lista de
 * profesionales destacados con datos inventados y una tarjeta de cierre
 * invitando a publicar. Quien abre la home ya está dentro y viene a hacer
 * algo, no a que le expliquen el producto otra vez.
 *
 * Lo explicativo se mudó entero a la pantalla "Cómo funciona", que ocupa
 * ahora el botón secundario del hero: estaba "Ver profesionales", y era el
 * tercer camino al directorio después de la pestaña de la barra y del
 * buscador de oficios. Los destacados se retiraron sin sustituto:
 * eran tres personas escritas a mano en el código, y enseñar profesionales de
 * mentira en la portada no es un adelanto de nada. Y el cierre repetía un
 * destino —publicar— que es una pestaña fija de la barra de abajo, siempre
 * visible: gastaba el final de la pantalla en un atajo que nadie necesita.
 *
 * Queda lo que se usa: quién eres, el buscador, los oficios, y dos salidas
 * que no repiten a la barra de abajo —cómo funciona y la urgencia—.
 */

import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL } from '@/api'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { HeroCard } from '@/components/organisms/HeroCard'
import { JobAnswer, isAnswer } from '@/components/organisms/JobAnswer'
import { MessagesFab } from '@/components/molecules/MessagesFab'
import { TradesCarousel } from '@/components/organisms/TradesCarousel'
import { useMyJobs } from '@/hooks/domain/useMyJobs'
import { useSeenAnswers, useMarkAnswerSeen } from '@/stores/useSeenAnswersStore'
import type { TradeSlug } from '@/utils/trades'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePage.styles'

export interface HomePageProps {
  role: 'client' | 'pro'
  onUrgent: () => void
  onSelectTrade: (slug: TradeSlug) => void
  /**
   * Abre la pantalla que explica el modelo. Es el botón secundario del hero:
   * ocupó el sitio de "Ver profesionales", que era el tercer camino al
   * directorio y no hacía falta.
   */
  onHowItWorks: () => void
  /**
   * A la ficha de un trabajo. Se usa desde el aviso de "te han contestado":
   * el modal da la noticia y la ficha dice qué hacer con ella.
   */
  onSeeJob?: (jobId: string) => void
  /** Al botón flotante de Mensajes. Vivía como fila de Mi cuenta hasta el 22 Ago 2026 */
  onMessages: () => void
}

export function HomePage({
  role,
  onUrgent,
  onSelectTrade,
  onHowItWorks,
  onSeeJob,
  onMessages,
}: HomePageProps) {
  const isClient = role === 'client'
  // Al bajar el scroll, la barra inferior se encoge
  const onScroll = useNavScrollHandler()
  const user = useUser()

  /**
   * Si alguien le ha contestado desde la última vez que abrió la app.
   *
   * El aviso al móvil llega en el momento y llega una vez: con el teléfono
   * silenciado, nadie se entera de que su urgencia ya tiene a alguien de
   * camino. Aquí se lo decimos otra vez, igual que al profesional se le dice
   * lo que tiene sin responder.
   */
  const { data: jobsData } = useMyJobs(isClient)
  const seen = useSeenAnswers()
  const markSeen = useMarkAnswerSeen()

  /*
    Uno cada vez, el primero de la lista. Tres ventanas encadenadas al abrir
    la app se cierran de un manotazo sin leer ninguna; el resto sigue en Mis
    trabajos, que es donde se resuelven.
  */
  const answered =
    (jobsData?.items ?? []).find(
      (job) => isAnswer(job) && seen[job.id] !== job.status,
    ) ?? null

  return (
    <SafeAreaView style={styles.safeArea} testID="home-page">
      <JobAnswer
        job={answered}
        onSee={(jobId) => {
          if (answered) markSeen(answered.id, answered.status)
          onSeeJob?.(jobId)
        }}
        onDismiss={() => {
          if (answered) markSeen(answered.id, answered.status)
        }}
        testID="home-job-answer"
      />

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <HeroCard
          role={role}
          variant="light"
          userName={user?.name}
          /*
           * `avatarUrl` llega como ruta relativa a la API, así que el prefijo
           * se pone aquí, igual que en Mi cuenta y en la home del profesional.
           */
          avatarUri={user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null}
          onSecondary={onHowItWorks}
          onUrgent={isClient ? onUrgent : undefined}
          onSelectTrade={isClient ? onSelectTrade : undefined}
          testID="home-hero"
        />

        <TradesCarousel onSelect={onSelectTrade} testID="home-carousel" />
      </Animated.ScrollView>

      <MessagesFab onPress={onMessages} testID="home-messages-fab" />
    </SafeAreaView>
  )
}
