/**
 * HomePage
 * Home del cliente (HOME_MOBILE.md).
 *
 * **Rehecha el 25 Agosto 2026.** El carrusel de oficios se fue: era un
 * coverflow que gastaba 410 px —casi media pantalla— en enseñar UN oficio
 * de dieciocho, y obligaba a diecisiete arrastres para verlos todos. Pasó a
 * cuadrícula, y de ahí a `ReceptionStage`: un solo dibujo del tamaño que
 * tenían cuatro casillas.
 *
 * Con eso, **el buscador del hero es el único camino a un oficio**, y esta
 * pantalla guarda cuál se buscó. Antes elegir un oficio saltaba derecho al
 * directorio; ahora la respuesta se da aquí —Uhiro dice cuántos hay— y solo
 * se sale al directorio si el cliente pulsa "Ver". Buscar deja de ser un
 * salto a ciegas: se ve si hay alguien antes de cambiar de pantalla.
 *
 * La cabecera también: `HeroCard` centraba logotipo, foto y nombre en otros
 * 260 px de presentación para alguien que ya ha entrado. `ClientHero` deja
 * eso en una franja y pone delante lo que se viene a hacer, que es buscar.
 * `HeroCard` sigue en pie porque la home del profesional sí necesita esa
 * ficha suya, y entra a verla a diario.
 *
 * Los mensajes pasan de botón flotante a la cabecera: el flotante tapaba la
 * esquina de la última fila de oficios.
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
 * Queda lo que se usa: quién eres, el buscador, lo que el buscador conteste,
 * y dos salidas que no repiten a la barra de abajo —cómo funciona y la
 * urgencia—.
 */

import { useState } from 'react'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL } from '@/api'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { ClientHero } from '@/components/organisms/ClientHero'
import { JobAnswer, isAnswer } from '@/components/organisms/JobAnswer'
import { ReceptionStage } from '@/components/organisms/ReceptionStage'
import { useMyJobs } from '@/hooks/domain/useMyJobs'
import { usePros } from '@/hooks/domain/usePros'
import { useUserLocation } from '@/hooks/ui/useUserLocation'
import { useSeenAnswers, useMarkAnswerSeen } from '@/stores/useSeenAnswersStore'
import type { TradeSlug } from '@/utils/trades'
import type { LatLng } from '@/utils/geo'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePage.styles'

export interface HomePageProps {
  onUrgent: () => void
  /**
   * Al directorio, ya filtrado por el oficio. Lo dispara el "Ver" del
   * bocadillo, no la búsqueda: la búsqueda se contesta sin salir de aquí.
   *
   * El punto viaja con él para que la lista sea exactamente la que se acaba
   * de contar. Sin llevarlo, el bocadillo prometería siete y el directorio
   * enseñaría a todos los del oficio en España.
   */
  onSelectTrade: (slug: TradeSlug, point?: LatLng) => void
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
  onUrgent,
  onSelectTrade,
  onHowItWorks,
  onSeeJob,
  onMessages,
}: HomePageProps) {
  // Al bajar el scroll, la barra inferior se encoge
  const onScroll = useNavScrollHandler()
  const user = useUser()

  /** El último oficio buscado en el hero. `null` mientras no se ha buscado */
  const [buscado, setBuscado] = useState<TradeSlug | null>(null)

  /**
   * Desde dónde busca.
   *
   * El permiso se pide **en la primera búsqueda** y no al abrir la app: un
   * diálogo del sistema nada más entrar se deniega por reflejo, y luego el
   * sistema ya no deja volver a preguntar. Buscar un oficio es justo el
   * momento en que la ubicación sirve para algo que se ve.
   */
  const { position, status, request } = useUserLocation()

  const buscar = (slug: TradeSlug) => {
    setBuscado(slug)
    if (status === 'idle') void request()
  }

  /*
    Cuántos hay de ese oficio, para decirlo en el bocadillo. Con punto son
    los que **llegan hasta aquí**; sin él, todos los del oficio, y entonces
    el bocadillo no dice "cerca de ti".

    Son los MISMOS filtros que usa el directorio, así que comparten clave de
    caché: al pulsar "Ver" la lista ya está puesta y la pantalla abre con
    ella en vez de con el esqueleto de carga.
  */
  const filtros =
    buscado === null
      ? {}
      : {
          trade: buscado,
          ...(position && { lat: position.lat, lng: position.lng, nearby: true }),
        }

  /*
    Nada que preguntar hasta saber si hay ubicación o no. Preguntar mientras
    el diálogo del permiso está abierto traería el recuento nacional, y al
    conceder el permiso el número cambiaría solo delante del cliente.
  */
  const pros = usePros(filtros, {
    enabled: buscado !== null && status !== 'idle' && status !== 'requesting',
  })

  /**
   * Si alguien le ha contestado desde la última vez que abrió la app.
   *
   * El aviso al móvil llega en el momento y llega una vez: con el teléfono
   * silenciado, nadie se entera de que su urgencia ya tiene a alguien de
   * camino. Aquí se lo decimos otra vez, igual que al profesional se le dice
   * lo que tiene sin responder.
   */
  const { data: jobsData } = useMyJobs(true)
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
        onSee={async (jobId) => {
          /*
           * Se espera a que la escritura llegue a AsyncStorage antes de
           * navegar: si no, cerrar la app justo después de tocar "Ver el
           * trabajo" —lo primero que se hace tras verlo— puede perder el
           * "visto" y el aviso vuelve a salir la próxima vez.
           */
          if (answered) await markSeen(answered.id, answered.status)
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
        <ClientHero
          userName={user?.name}
          /*
           * `avatarUrl` llega como ruta relativa a la API, así que el prefijo
           * se pone aquí, igual que en Mi cuenta y en la home del profesional.
           */
          avatarUri={user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null}
          onSelectTrade={buscar}
          onUrgent={onUrgent}
          onHowItWorks={onHowItWorks}
          onMessages={onMessages}
          testID="home-hero"
        />

        <ReceptionStage
          trade={buscado}
          total={pros.data?.total}
          nearby={position !== null}
          /*
            `isLoading` y no `isPending`: una consulta apagada se queda en
            "pendiente" para siempre, y el bocadillo diría "un momento, que
            miro" sin estar mirando nada.
          */
          isLoading={pros.isLoading}
          isError={pros.isError}
          onSee={() => buscado && onSelectTrade(buscado, position ?? undefined)}
          testID="home-stage"
        />
      </Animated.ScrollView>

    </SafeAreaView>
  )
}
