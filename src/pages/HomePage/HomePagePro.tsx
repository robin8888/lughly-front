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
 * - Trabajos cerca de ti y contador de pujas del plan → necesitan `Job` y
 *   `Bid` (Fases 4 y 5).
 * - Reserva instantánea con tarifa, mínimo y solicitudes → Fase 7.
 * - Ingresos de los últimos 6 meses → `Payment` (Fase 9).
 *
 * El interruptor de "disponible ahora" sí es real y escribe en el perfil.
 */

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
import { ReviewList } from '@/components/organisms/ReviewList'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { useAvailableNow } from '@/hooks/domain/useAvailableNow'
import { useEmployer } from '@/hooks/domain/useEmployees'
import { useInbox } from '@/hooks/domain/useInbox'
import { theme } from '@/theme'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePagePro.styles'

export interface HomePageProProps {
  /** Id del usuario en sesión: su ficha es la de este profesional */
  userId: string | undefined
  /**
   * No hay `onPrimary`: el hero se quedó sin botón principal. Llevaba a las
   * pujas, que están a un toque en la barra de abajo.
   */
  onSecondary: () => void
  onManageEmployees: () => void
  onInbox: () => void
}

export function HomePagePro({
  userId,
  onSecondary,
  onManageEmployees,
  onInbox,
}: HomePageProProps) {
  const onScroll = useNavScrollHandler()
  const user = useUser()
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
   * Un trabajador por cuenta ajena no ve su tarifa: la fija su empresa y es
   * el precio que ella cobra, no su sueldo. Enseñársela invitaría a
   * confundir una cosa con la otra.
   */
  const isEmployee = pro?.employerName != null

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
  const { data: inboxData } = useInbox(!isEmployee)
  const pendingCount = inboxData?.items.length ?? 0

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

        {pendingCount > 0 && (
          <Pressable
            onPress={onInbox}
            style={styles.inbox}
            accessibilityRole="button"
            testID="home-pro-inbox"
          >
            <View style={styles.employeesText}>
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
         * Quien tiene gente a cargo entra a la app para dar de alta a los
         * suyos, sobre todo al principio. Por eso va aquí arriba y no
         * escondido en Mi cuenta: es lo primero que necesita hacer.
         */}
        {employer && (
          <Pressable
            onPress={onManageEmployees}
            style={({ pressed }) => [
              styles.employees,
              pressed && styles.employeesPressed,
            ]}
            accessibilityRole="button"
            testID="home-pro-employees"
          >
            <View style={styles.employeesText}>
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
            </View>
            <Text style={styles.employeesArrow}>→</Text>
          </Pressable>
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
                     */
                    value={
                      pro.trades.length > 1
                        ? `desde ${Math.min(...pro.trades.map((t) => t.hourlyRate))} €/h`
                        : `${pro.hourlyRate} €/h`
                    }
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
                  Tienes 30 minutos para aceptar cada aviso. Si no respondes,
                  pasa al siguiente profesional.
                </Text>
              )}
            </InfoCard>

            <ReviewList
              proId={pro.id}
              proName={pro.name}
              emptyMessage="Todavía no te han valorado. Al terminar tu primer trabajo, el cliente podrá puntuarte en ocho aspectos."
              testID="home-pro-reviews"
            />

            <InfoCard style={styles.pendingCard}>
              <Text style={styles.stateTitle}>Todavía no disponible</Text>
              <Text style={styles.stateBody}>
                Los trabajos cerca de ti, el contador de pujas de tu plan, la
                reserva instantánea y tus ingresos llegan con las siguientes
                fases del roadmap.
              </Text>
            </InfoCard>
          </>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
