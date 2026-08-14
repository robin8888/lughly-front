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

import { View, Text, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch } from '@/components/atoms/Switch'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatCard } from '@/components/molecules/StatCard'
import { HeroCard } from '@/components/organisms/HeroCard'
import { ReviewList } from '@/components/organisms/ReviewList'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useProProfile } from '@/hooks/domain/useProProfile'
import { useAvailableNow } from '@/hooks/domain/useAvailableNow'
import { theme } from '@/theme'
import { styles } from './HomePagePro.styles'

export interface HomePageProProps {
  /** Id del usuario en sesión: su ficha es la de este profesional */
  userId: string | undefined
  onPrimary: () => void
  onSecondary: () => void
}

export function HomePagePro({
  userId,
  onPrimary,
  onSecondary,
}: HomePageProProps) {
  const onScroll = useNavScrollHandler()
  const { data: pro, isPending, isError } = useProProfile(userId)
  const { setAvailableNow, isSaving } = useAvailableNow(userId)

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
          onPrimary={onPrimary}
          onSecondary={onSecondary}
          testID="home-pro-hero"
        />

        {isPending ? (
          <View style={styles.state} testID="home-pro-loading">
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : isError || !pro ? (
          /**
           * Una cuenta profesional sin perfil llega aquí: se registró y no
           * completó el alta. No es un error de red, así que no se ofrece
           * reintentar sino completar lo que falta.
           */
          <InfoCard style={styles.stateCard} testID="home-pro-no-profile">
            <Text style={styles.stateTitle}>Aún no tienes perfil profesional</Text>
            <Text style={styles.stateBody}>
              Sin oficio, tarifa y ciudad no apareces en el directorio ni
              recibes avisos. El alta llega en la pantalla de configuración.
            </Text>
          </InfoCard>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tu actividad</Text>

              <View style={styles.grid}>
                <StatCard
                  label="Valoración"
                  value={pro.reviewCount > 0 ? pro.rating.toFixed(1) : '—'}
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
                <StatCard
                  label="Tu tarifa"
                  value={`${pro.hourlyRate} €/h`}
                  testID="stat-rate"
                />
                <StatCard
                  label="Cobertura"
                  value={`${pro.radiusKm} km`}
                  hint={`desde ${pro.city}`}
                  testID="stat-radius"
                />
              </View>
            </View>

            <InfoCard style={styles.availability}>
              <View style={styles.availabilityRow}>
                <View style={styles.availabilityText}>
                  <Text style={styles.availabilityTitle}>Disponible ahora</Text>
                  <Text style={styles.availabilityBody}>
                    {pro.availableNow
                      ? `Te avisamos de las urgencias de ${pro.tradeLabel.toLowerCase()} a menos de ${pro.radiusKm} km.`
                      : 'Actívalo y te llegarán las urgencias de tu zona en cuanto se publiquen.'}
                  </Text>
                </View>

                <Switch
                  value={pro.availableNow}
                  onValueChange={setAvailableNow}
                  disabled={isSaving}
                  testID="home-pro-available-now"
                  accessibilityLabel="Disponible ahora para urgencias"
                />
              </View>

              {pro.availableNow && (
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
