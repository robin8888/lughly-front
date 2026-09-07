/**
 * HomePagePro
 * Home del profesional, con lo esencial de `isPanel` (MobileApp.dc.html).
 *
 * No es la home del cliente con otros textos: el cliente viene a buscar a
 * alguien y el profesional viene a ver cómo le va. Por eso aquí no hay
 * carrusel de oficios ni destacados, y sí cifras propias.
 *
 * Todo lo que se muestra sale de la base de datos. Del panel del diseño
 * quedan fuera, por no tener tablas todavía:
 *
 * - Trabajos cerca de ti → sin construir todavía.
 * - Ingresos de los últimos 6 meses → `Payment` (Fase 9).
 *
 * El interruptor de "disponible ahora" sí es real y escribe en el perfil.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL, ApiError } from '@/api'
import { Button } from '@/components/atoms/Button'
import { Switch } from '@/components/atoms/Switch'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatCard } from '@/components/molecules/StatCard'
import { HeroCard } from '@/components/organisms/HeroCard'
import { MessagesFab } from '@/components/molecules/MessagesFab'
import { useUnreadCount } from '@/hooks/domain/useChat'
import { ReviewList } from '@/components/organisms/ReviewList'
import { AssignmentConfirm } from '@/components/organisms/AssignmentConfirm'
import { Dialog } from '@/components/organisms/Dialog'
import { LocationAsk } from '@/components/organisms/LocationAsk'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { useLocateMyBase } from '@/hooks/domain/useLocateMyBase'
import { useAccountStatus } from '@/hooks/domain/usePaymentAccount'
import { useLocationGate } from '@/hooks/ui/useLocationGate'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { useAvailableNow } from '@/hooks/domain/useAvailableNow'
import { useEmployer } from '@/hooks/domain/useEmployees'
import { useInbox } from '@/hooks/domain/useInbox'
import { useMyUrgencies } from '@/hooks/domain/useMyUrgencies'
import {
  useDismissedReminders,
  useMarkReminderDismissed,
} from '@/stores/useDismissedRemindersStore'
import { theme } from '@/theme'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePagePro.styles'

export interface HomePageProProps {
  /** Id del usuario en sesión: su ficha es la de este profesional */
  userId: string | undefined
  /** A la agenda, que está a un toque en la barra de abajo */
  onSecondary: () => void
  onManageEmployees: () => void
  onInbox: () => void
  /** A la pantalla de urgencias, donde se contestan */
  onUrgencies: () => void
  /** A Mi zona de trabajo, para quien prefiera escribir su dirección */
  onZone: () => void
  /** A la cuenta de cobro, que es lo último que le falta del alta */
  onPayoutAccount: () => void
  /** Al botón flotante de Mensajes. Vivía como fila de Mi cuenta hasta el 22 Ago 2026 */
  onMessages: () => void
}

export function HomePagePro({
  userId,
  onSecondary,
  onManageEmployees,
  onInbox,
  onUrgencies,
  onZone,
  onPayoutAccount,
  onMessages,
}: HomePageProProps) {
  const onScroll = useNavScrollHandler()

  /**
   * Los mensajes que hay esperando, para la chapa del botón flotante. Se
   * pregunta al montar: es lo que hace que el aviso esté desde que se abre la
   * app, y no solo al entrar a la bandeja.
   */
  const unread = useUnreadCount()
  const user = useUser()

  /**
   * Si trabaja para otro. Sale de su propia ficha, que esta pantalla ya pide
   * —`useIsEmployee` lee esa misma caché, sin consulta nueva—.
   *
   * Manda en dos cosas de aquí: no ve su tarifa —la fija su empresa y es el
   * precio que ella cobra, no su sueldo— y no se le pregunta por la cuenta de
   * cobro, que es de ella.
   */
  const isEmployee = useIsEmployee()

  /**
   * Si está en el mapa, y el botón para ponerse de un toque.
   *
   * `hasBase` es `null` mientras no se sabe: la tarjeta no sale hasta que hay
   * respuesta, porque un aviso que aparece medio segundo después de abrir y
   * empuja todo hacia abajo se lee como un fallo de la app.
   */
  const { status: locateStatus, hasBase, locate } = useLocateMyBase()
  const zoneGate = useLocationGate(locate)

  /**
   * Si puede cobrar. **Solo del que va por su cuenta**: a un empleado le paga
   * su empresa y la cuenta es de ella, así que preguntarlo por él devuelve un
   * 403 y avisarle sería mandarle a una pantalla que no es suya.
   *
   * Se espera a que la consulta termine —`isPending`— antes de dar nada por
   * ausente: sin eso, el aviso aparece medio segundo en cada arranque, también
   * a quien la tiene puesta desde hace meses.
   *
   * Y **el fallo cuenta como que no la tiene**, a propósito: quien todavía no
   * ha llegado a abrir la cuenta no tiene ni `Employer`, y ahí el servidor
   * responde 403. Es justo el que más necesita el aviso.
   */
  const { data: account, isPending: askingAccount } = useAccountStatus(!isEmployee)
  const sinCobro = !isEmployee && !askingAccount && account?.transfersEnabled !== true

  /**
   * Las valoraciones empiezan plegadas. Quien abre su propia home viene a ver
   * si tiene avisos o a ponerse disponible, y con veinte reseñas desplegadas
   * todo lo demás quedaba debajo de un minuto de scroll.
   */
  const [showReviews, setShowReviews] = useState(false)
  const {
    data: pro,
    isPending,
    isError,
    isFetching,
    error,
    refetch,
  } = useProProfile(userId)

  /**
   * Solo un 404 significa "no tiene perfil". Cualquier otro fallo —el
   * servidor caído, el móvil sin cobertura— es un problema de esta pantalla,
   * no de su ficha, y confundirlos le diría a alguien con su perfil completo
   * que no lo tiene.
   */
  const hasNoProfile = error instanceof ApiError && error.status === 404
  const { setAvailableNow, isSaving } = useAvailableNow(userId)

  /**
   * Quien es empleado no puede tener empleados: no se le pregunta. Al resto
   * sí, porque el botón de trabajadores depende de la respuesta y no hay
   * otro sitio de donde sacarla.
   */
  const { data: employerData } = useEmployer(!isEmployee)
  const employer = employerData?.employer ?? null

  /**
   * Los encargos corren: hay 24 horas para contestar y hoy no hay aviso al
   * móvil. Por eso el número va aquí arriba, donde se entra todos los días,
   * y no escondido en Mi cuenta.
   */
  /**
   * También para un empleado, desde el 20 Agosto 2026: antes no se le pedía
   * —no tenía nada que responder— y ahora sí, porque lo que su empresa le
   * asigna espera aquí a que lo confirme.
   */
  const { data: inboxData } = useInbox()
  const items = inboxData?.items ?? []

  /** Lo que le han asignado y tiene que confirmar él */
  const toConfirm = items.filter((item) => item.appointmentStatus === 'PENDING_WORKER')
  /**
   * Lo que le han encargado y sigue sin respuesta.
   *
   * Sin cita, o con el hueco apartado de una reserva por horas: las dos
   * esperan por él. Lo ya propuesto a un sustituto no, que está esperando al
   * cliente, y contarlo aquí sería meterle prisa por algo que no depende de
   * él.
   */
  const pending = items.filter(
    (item) => item.appointmentStatus === null || item.appointmentStatus === 'RESERVED',
  )
  const pendingCount = pending.length

  /**
   * Qué diálogos ya se han cerrado con "Ahora no", recordado en el
   * dispositivo (`useDismissedReminders`). Sin esto, cerrar y volver a abrir
   * la app enseñaba otra vez cada aviso aunque nada hubiera cambiado desde
   * que se cerró —mismo fallo que ya se corrigió del lado del cliente con
   * `useSeenAnswersStore`—.
   *
   * Por id suelto: si entre medias llega un encargo o una urgencia nueva,
   * esa sí tiene que avisar aunque las demás ya estén vistas.
   */
  // Por cuenta: lo cerrado es de quien lo cerró (`useDismissedRemindersStore`)
  const dismissed = useDismissedReminders(user?.id)
  const markDismissed = useMarkReminderDismissed()

  /**
   * El diálogo sale una vez y con el más urgente —la bandeja viene ordenada
   * por plazo—, no con todos. Tres diálogos encadenados al abrir la app son
   * una encerrona; el resto espera en Encargos, que es donde también se
   * responden.
   */
  const confirming = toConfirm.find((item) => !dismissed[`confirm:${item.id}`]) ?? null

  /**
   * Y el aviso de los encargos sin responder, con cuántos quedan por ver.
   *
   * Va **detrás** del de confirmar y nunca a la vez: dos diálogos al abrir la
   * app se cierran los dos de un manotazo sin leer ninguno. Este solo sale
   * cuando no hay nada que confirmar o ya se ha respondido a eso.
   */
  const undismissedPending = pending.filter((item) => !dismissed[`inbox:${item.id}`])

  /**
   * Y delante de todo, las urgencias que le han pedido a él.
   *
   * Van primero porque el plazo es de cinco minutos y el de los encargos de
   * veinticuatro horas: si el orden fuera el otro, se le enseñaría lo que
   * puede contestar mañana tapando lo que caduca mientras lo lee. Es también
   * el respaldo del aviso al móvil, para quien lo tenga silenciado.
   */
  const { data: urgencyData } = useMyUrgencies()
  const urgencyItems = urgencyData?.items ?? []
  const undismissedUrgencies = urgencyItems.filter(
    (item) => !dismissed[`urgency:${item.id}`],
  )

  const showUrgencyDialog = undismissedUrgencies.length > 0
  const dismissUrgencies = () =>
    user && undismissedUrgencies.forEach((item) => markDismissed(user.id, `urgency:${item.id}`))

  const showInboxDialog =
    !showUrgencyDialog && confirming === null && undismissedPending.length > 0
  const dismissPending = () =>
    user && undismissedPending.forEach((item) => markDismissed(user.id, `inbox:${item.id}`))

  return (
    <SafeAreaView style={styles.safeArea} testID="home-page-pro">
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {/**
         * Hero claro: esta pantalla va sobre el fondo claro de la app, y la
         * tarjeta negra del diseño se leía ahí como un bloque pegado en vez
         * de como la cabecera de la pantalla. La home del cliente, que sí
         * tiene fondo negro, mantiene la variante oscura del diseño.
         */}
        <HeroCard
          role="pro"
          variant="light"
          userName={user?.name}
          /*
           * `avatarUrl` llega como ruta relativa a la API, así que el prefijo
           * se pone aquí: el mismo trato que en Mi cuenta y en la ficha del
           * profesional. Se lee del usuario en sesión y no de `pro`, que puede
           * estar todavía cargando o haber fallado —y la cabecera no debería
           * quedarse sin foto por eso.
           */
          avatarUri={
            user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null
          }
          /*
           * El anillo de disponibilidad alrededor de su foto, como en el
           * directorio: verde si atiende urgencias ahora y rojo si no. Es el
           * mismo dato que mueve el interruptor de más abajo, así que los dos
           * cambian a la vez.
           *
           * Mientras la ficha carga no hay anillo, en vez de uno rojo: decirle
           * que no está disponible antes de saberlo sería mentirle.
           */
          available={pro?.availableNow}
          /*
           * Su oficio, su ciudad y su valoración, que es lo que convierte la
           * cabecera en su ficha. Va sin comprobar `isPending`: mientras la
           * ficha carga se queda en `undefined` y el hero enseña foto y nombre,
           * que salen de la sesión y están desde el primer momento.
           */
          profile={
            pro && {
              tradeLabel: pro.tradeLabel,
              city: pro.city,
              rating: pro.rating,
              reviewCount: pro.reviewCount,
            }
          }
          onSecondary={onSecondary}
          testID="home-pro-hero"
        />

        <Dialog
          visible={showUrgencyDialog}
          title={
            undismissedUrgencies.length === 1
              ? 'Te han elegido para una urgencia'
              : `Te han elegido para ${undismissedUrgencies.length} urgencias`
          }
          message="Un cliente te está esperando ahora mismo. Tienes cinco minutos para contestar; pasado el plazo podrá llamar a otro."
          onDismiss={dismissUrgencies}
          testID="home-pro-urgency-dialog"
          actions={[
            {
              label: 'Ver la urgencia',
              onPress: () => {
                dismissUrgencies()
                onUrgencies()
              },
              testID: 'home-pro-urgency-dialog-go',
            },
            {
              label: 'Ahora no',
              variant: 'secondary',
              onPress: dismissUrgencies,
              testID: 'home-pro-urgency-dialog-later',
            },
          ]}
        />

        <AssignmentConfirm
          job={showUrgencyDialog ? null : confirming}
          onDismiss={() => {
            if (confirming && user) markDismissed(user.id, `confirm:${confirming.id}`)
          }}
          testID="home-pro-confirm"
        />

        <Dialog
          visible={showInboxDialog}
          title={
            undismissedPending.length === 1
              ? 'Tienes un encargo sin responder'
              : `Tienes ${undismissedPending.length} encargos sin responder`
          }
          message="Un cliente os ha elegido. Hay 24 horas para contestar; pasado el plazo queda libre para contratar a otro."
          onDismiss={dismissPending}
          testID="home-pro-inbox-dialog"
          actions={[
            {
              label: undismissedPending.length === 1 ? 'Ver el encargo' : 'Ver los encargos',
              onPress: () => {
                dismissPending()
                onInbox()
              },
              testID: 'home-pro-inbox-dialog-go',
            },
            {
              label: 'Ahora no',
              variant: 'secondary',
              onPress: dismissPending,
              testID: 'home-pro-inbox-dialog-later',
            },
          ]}
        />

        {toConfirm.length > 0 && (
          <Pressable
            onPress={onInbox}
            style={styles.inbox}
            accessibilityRole="button"
            testID="home-pro-to-confirm"
          >
            <View style={styles.inboxText}>
              <Text style={styles.inboxTitle}>
                {toConfirm.length === 1
                  ? 'Tienes un trabajo por confirmar'
                  : `Tienes ${toConfirm.length} trabajos por confirmar`}
              </Text>
              <Text style={styles.inboxBody}>
                Tu empresa te los ha asignado y espera que digas si puedes. Si
                no contestas, vuelven a ella para que mande a otro.
              </Text>
            </View>
            <Text style={styles.inboxArrow}>→</Text>
          </Pressable>
        )}

        {pendingCount > 0 && (
          <Pressable
            onPress={onInbox}
            style={styles.inbox}
            accessibilityRole="button"
            testID="home-pro-inbox"
          >
            <View style={styles.inboxText}>
              <Text style={styles.inboxTitle}>
                {pendingCount === 1
                  ? 'Tienes un encargo sin responder'
                  : `Tienes ${pendingCount} encargos sin responder`}
              </Text>
              <Text style={styles.inboxBody}>
                Un cliente os ha elegido. Hay 24 horas para contestar; pasado
                el plazo queda libre para contratar a otro.
              </Text>
            </View>
            <Text style={styles.inboxArrow}>→</Text>
          </Pressable>
        )}

        {/**
         * Lo que le impide trabajar, en una sola tarjeta.
         *
         * Son dos cosas y las dos se descubrían tarde y por las bravas: la
         * cuenta de cobro, al intentar aceptar un trabajo ya prometido; el
         * punto en el mapa, nunca —simplemente no le llegaba nada—.
         *
         * **Una tarjeta y no dos.** Dos avisos apilados en la primera pantalla
         * se leen como una app que se queja, y el segundo no lo lee nadie. La
         * cuenta de cobro va primero porque es la que cierra la puerta del
         * todo: sin ella el cliente ni siquiera ve el botón de contratar.
         *
         * **No se puede cerrar**, y es a propósito. Los otros avisos de esta
         * home sí —son cosas que pasan una vez y se resuelven—; éste dura lo
         * que dure el problema, y cerrarlo sería esconder justo lo que hace
         * que no le llegue trabajo. Se va solo en cuanto está resuelto.
         */}
        {(sinCobro || hasBase === false) && (
          <InfoCard style={styles.zone} testID="home-pro-setup">
            <Text style={styles.employeesTitle}>
              {sinCobro ? 'Todavía no pueden contratarte' : 'No sales en las búsquedas'}
            </Text>

            {sinCobro && (
              <>
                <Text style={styles.employeesBody}>
                  Te falta la cuenta de cobro, y sin ella no hay a dónde mandarte
                  el dinero: en tu ficha no sale el botón de contratar. Se hace
                  una vez y son unos minutos. Al mes de darte de alta, si sigue
                  sin estar, tu ficha deja de salir en el directorio.
                </Text>

                <Button
                  onPress={onPayoutAccount}
                  style={styles.employeesAction}
                  pressedStyle={styles.employeesActionPressed}
                  textStyle={styles.employeesActionText}
                  testID="home-pro-payout"
                >
                  Poner mi cuenta de cobro
                </Button>
              </>
            )}

            {hasBase === false && (
              <>
                <Text style={sinCobro ? styles.setupNext : styles.employeesBody}>
                  {sinCobro ? 'Y no estás en el mapa: ' : ''}
                  Los clientes buscan por cercanía, así que sin un punto no
                  apareces —ni aunque el trabajo sea en tu calle—. Tampoco te
                  llegan urgencias, que se reparten por distancia.
                </Text>

                <Button
                  onPress={() => void zoneGate.start()}
                  loading={locateStatus === 'locating' || locateStatus === 'saving'}
                  variant={sinCobro ? 'secondary' : undefined}
                  style={styles.employeesAction}
                  {...(!sinCobro && {
                    pressedStyle: styles.employeesActionPressed,
                    textStyle: styles.employeesActionText,
                  })}
                  testID="home-pro-zone-locate"
                >
                  Usar mi ubicación
                </Button>

                {/*
                  Y la salida para quien no quiere dar el permiso, o ya lo ha
                  denegado: la pantalla de siempre, donde se busca la dirección
                  a mano. Un aviso cuya única salida fuera ceder el GPS no sería
                  un aviso.
                */}
                <Pressable
                  onPress={onZone}
                  accessibilityRole="button"
                  style={styles.zoneManual}
                  testID="home-pro-zone-manual"
                >
                  <Text style={styles.zoneManualText}>
                    {locateStatus === 'denied'
                      ? 'Sin ubicación: buscar mi dirección'
                      : 'Prefiero escribir mi dirección'}
                  </Text>
                </Pressable>
              </>
            )}
          </InfoCard>
        )}

        {/**
         * Quien tiene gente a cargo entra a la app para dar de alta a los
         * suyos, sobre todo al principio. Por eso va aquí arriba y no
         * escondido en Mi cuenta: es lo primero que necesita hacer.
         */}
        {employer && (
          <InfoCard style={styles.employees} testID="home-pro-employees">
            <Text style={styles.employeesTitle}>
              {employer.employeeCount === 0
                ? 'Añade a tus trabajadores'
                : 'Mis trabajadores'}
            </Text>
            <Text style={styles.employeesBody}>
              {employer.employeeCount === 0
                ? `${employer.legalName} todavía no tiene a nadie dado de alta. Sin trabajadores no apareces en ningún oficio.`
                : `${employer.employeeCount} ${employer.employeeCount === 1 ? 'trabajador' : 'trabajadores'} · ${employer.trades.length} ${employer.trades.length === 1 ? 'oficio' : 'oficios'}`}
            </Text>

            {/*
              La tarjeta entera era el botón, con una flecha al final. Eso deja
              lo que hay que hacer a que alguien adivine que el bloque se
              pulsa; ahora lo dice un botón con su nombre, y la tarjeta vuelve
              a ser lo que es: blanca y de leer.

              Naranja y no azul porque en una pantalla donde ya hay botones
              azules éste es de otra cosa, y a media caja como el de la agenda:
              los dos son la misma clase de salida.
            */}
            <Button
              onPress={onManageEmployees}
              style={styles.employeesAction}
              pressedStyle={styles.employeesActionPressed}
              textStyle={styles.employeesActionText}
              testID="home-pro-employees-add"
            >
              Añadir trabajador
            </Button>
          </InfoCard>
        )}

        {isPending ? (
          <View style={styles.state} testID="home-pro-loading">
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : hasNoProfile ? (
          /**
           * Una cuenta profesional sin perfil: se registró y no completó el
           * alta. Solo un 404 significa esto, y por eso no se ofrece
           * reintentar sino completar lo que falta.
           */
          <InfoCard style={styles.stateCard} testID="home-pro-no-profile">
            <Text style={styles.stateTitle}>Aún no tienes perfil profesional</Text>
            <Text style={styles.stateBody}>
              Sin oficio, tarifa y ciudad no apareces en el directorio ni
              recibes avisos. El alta llega en la pantalla de configuración.
            </Text>
          </InfoCard>
        ) : isError || !pro ? (
          /**
           * Aquí llega todo lo demás: el servidor caído, el móvil sin red, un
           * 500. Antes se enseñaba el mensaje de arriba, que decía a alguien
           * con su ficha completa que no tenía perfil. Un fallo de red hay
           * que llamarlo por su nombre y ofrecer reintentar.
           */
          <InfoCard style={styles.stateCard} testID="home-pro-error">
            <Text style={styles.stateTitle}>No hemos podido cargar tu perfil</Text>
            <Text style={styles.stateBody}>
              Tu ficha sigue donde estaba; es esta pantalla la que no ha
              podido leerla. Revisa tu conexión e inténtalo de nuevo.
            </Text>
            <Button
              onPress={() => void refetch()}
              loading={isFetching}
              style={styles.retry}
              testID="home-pro-retry"
            >
              Reintentar
            </Button>
          </InfoCard>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tu actividad</Text>

              <View style={styles.grid}>
                <StatCard
                  label="Valoración"
                  value={pro.reviewCount > 0 ? pro.rating.toFixed(1) : '—'}
                  /*
                   * Sin valoraciones no van estrellas: cinco huecos grises
                   * bajo un guion se leen como un cero, y no es que le hayan
                   * puntuado mal, es que todavía no le han puntuado.
                   */
                  rating={pro.reviewCount > 0 ? pro.rating : undefined}
                  hint={
                    pro.reviewCount > 0
                      ? `de ${pro.reviewCount} ${pro.reviewCount === 1 ? 'valoración' : 'valoraciones'}`
                      : 'sin valoraciones todavía'
                  }
                  testID="stat-rating"
                />
                <StatCard
                  label="Trabajos"
                  value={String(pro.completedJobs)}
                  hint="terminados"
                  testID="stat-jobs"
                />
              </View>

              <View style={styles.grid}>
                {isEmployee ? (
                  <StatCard
                    label="Trabajas para"
                    value={pro.employerName ?? ''}
                    testID="stat-employer"
                  />
                ) : (
                  <StatCard
                    label={pro.trades.length > 1 ? 'Tus tarifas' : 'Tu tarifa'}
                    /**
                     * Con varios oficios no cabe un precio por cada uno, así
                     * que se enseña el más bajo como "desde". Decir solo el
                     * del principal daría a entender que es el único.
                     *
                     * Por hora o por visita, según lo que tenga la mayoría:
                     * se prioriza mostrar una tarifa por hora si tiene
                     * alguna, porque es la unidad que más gente reconoce de
                     * un vistazo; si todos sus oficios cobran por visita, se
                     * enseña esa.
                     */
                    value={(() => {
                      const hourly = pro.trades
                        .map((t) => t.hourlyRate)
                        .filter((rate): rate is number => rate !== null)
                      const visits = pro.trades
                        .map((t) => t.visitFee)
                        .filter((fee): fee is number => fee !== null)

                      if (pro.trades.length > 1) {
                        return hourly.length > 0
                          ? `desde ${Math.min(...hourly)} €/h`
                          : `desde ${Math.min(...visits)} € visita`
                      }

                      return pro.hourlyRate !== null
                        ? `${pro.hourlyRate} €/h`
                        : `Visita ${pro.visitFee} €`
                    })()}
                    hint={
                      pro.trades.length > 1
                        ? `en ${pro.trades.length} oficios`
                        : undefined
                    }
                    testID="stat-rate"
                  />
                )}
                <StatCard
                  label="Cobertura"
                  value={`${pro.radiusKm} km`}
                  hint={`desde ${pro.city}`}
                  testID="stat-radius"
                />
              </View>
            </View>

            {/**
             * Un trabajador por cuenta ajena no tiene interruptor.
             *
             * Su disponibilidad para urgencias sale de las franjas que le pone
             * su empresa, no de él: el servidor lo rechaza con
             * `EmployeeHasNoSwitchError` y la deriva de `urgency_windows`. Aquí
             * se enseñaba el interruptor igual, así que lo pulsaba, se pintaba
             * encendido, el servidor lo tumbaba y el aviso le decía que
             * revisara su conexión — que no era el problema.
             *
             * Enseñarle en su lugar de qué depende es más útil que esconderlo:
             * la pregunta "¿por qué no me llegan urgencias?" tiene respuesta.
             */}
            <InfoCard style={styles.availability}>
              <View style={styles.availabilityRow}>
                <View style={styles.availabilityText}>
                  <Text style={styles.availabilityTitle}>Disponible ahora</Text>
                  <Text style={styles.availabilityBody}>
                    {isEmployee
                      ? `Tus horas de urgencia las fija ${pro.employerName}. Dentro de esas franjas apareces disponible y el cliente puede avisarte directamente.`
                      : pro.availableNow
                        ? `Te avisamos de las urgencias de ${pro.tradeLabel.toLowerCase()} a menos de ${pro.radiusKm} km.`
                        : 'Actívalo y te llegarán las urgencias de tu zona en cuanto se publiquen.'}
                  </Text>
                </View>

                {!isEmployee && (
                  <Switch
                    value={pro.availableNow}
                    onValueChange={setAvailableNow}
                    disabled={isSaving}
                    testID="home-pro-available-now"
                    accessibilityLabel="Disponible ahora para urgencias"
                  />
                )}
              </View>

              {!isEmployee && pro.availableNow && (
                <Text style={styles.availabilityNote}>
                  Sales en la lista de quien tenga una urgencia cerca. Si te
                  eligen, tienes cinco minutos para contestar.
                </Text>
              )}
            </InfoCard>

            {/*
              Las valoraciones, plegadas.
              Son la parte más larga de la pantalla con diferencia —van de
              cuatro en cuatro y con su desglose por criterio—, y quien abre su
              propia home viene casi siempre a otra cosa: a ver si tiene avisos
              o a ponerse disponible. Con veinte reseñas, todo lo de abajo
              quedaba a un minuto de scroll.

              Plegadas de verdad, además: sin desplegar no se piden al
              servidor, así que la home entra con una petición menos.
            */}
            {pro.reviewCount === 0 ? (
              /*
                Sin ninguna no hay nada que plegar, y el mensaje de "todavía no
                te han valorado" explica cómo llega la primera: esconderlo tras
                un botón sería esconder justo lo que hay que leer.
              */
              <ReviewList
                proId={pro.id}
                proName={pro.name}
                emptyMessage="Todavía no te han valorado. Al terminar tu primer trabajo, el cliente podrá puntuarte en ocho aspectos."
                testID="home-pro-reviews"
              />
            ) : showReviews ? (
              <>
                <ReviewList
                  proId={pro.id}
                  proName={pro.name}
                  /*
                    También aquí: el contador viene del perfil y la lista del
                    servidor, y si alguna vez discrepan, el texto por defecto
                    le hablaría de sí mismo en tercera persona.
                  */
                  emptyMessage="Todavía no te han valorado. Al terminar tu primer trabajo, el cliente podrá puntuarte en ocho aspectos."
                  testID="home-pro-reviews"
                />

                <Button
                  variant="secondary"
                  onPress={() => setShowReviews(false)}
                  style={styles.reviewsToggle}
                  testID="home-pro-reviews-hide"
                >
                  Ocultar las valoraciones
                </Button>
              </>
            ) : (
              <InfoCard>
                <Text style={styles.stateTitle}>Tus valoraciones</Text>
                <Text style={styles.stateBody}>
                  {pro.reviewCount === 1
                    ? 'Tienes una valoración'
                    : `Tienes ${pro.reviewCount} valoraciones`}
                  , con una nota media de {pro.rating.toFixed(1)}.
                </Text>

                <Button
                  variant="secondary"
                  onPress={() => setShowReviews(true)}
                  style={styles.reviewsToggle}
                  testID="home-pro-reviews-show"
                >
                  Verlas
                </Button>
              </InfoCard>
            )}

            <InfoCard style={styles.pendingCard}>
              <Text style={styles.stateTitle}>Todavía no disponible</Text>
              <Text style={styles.stateBody}>
                Los trabajos cerca de ti y tus ingresos llegan con las
                siguientes fases del roadmap.
              </Text>
            </InfoCard>
          </>
        )}
      </Animated.ScrollView>

      {/*
        Con lo que hay esperando. Se pide al montar la home: quien abre la app
        tiene que ver en el propio botón que le han escrito, sin entrar a la
        bandeja para descubrirlo.
      */}
      <MessagesFab
        onPress={onMessages}
        unread={unread.data?.total ?? 0}
        testID="home-pro-messages-fab"
      />

      {/*
        Para qué se le pide la ubicación, antes de que el sistema pregunte. Si
        el permiso ya estaba dado esto no llega a verse: `useLocationGate` va
        derecho a situarle.
      */}
      <LocationAsk
        visible={zoneGate.visible}
        reason="be-found"
        busy={zoneGate.busy}
        onAccept={() => void zoneGate.accept()}
        onDismiss={zoneGate.dismiss}
        testID="home-pro-zone-ask"
      />
    </SafeAreaView>
  )
}
