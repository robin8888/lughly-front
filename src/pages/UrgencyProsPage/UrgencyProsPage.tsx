/**
 * UrgencyProsPage
 * A quién llamar para una urgencia, ahora mismo.
 *
 * Es la pantalla que sale justo después de describir la avería, y es lo que
 * cambió el modelo: antes la urgencia se publicaba al aire, se avisaba a los
 * que estuvieran de guardia y se la llevaba el primero que aceptara. El cliente
 * no elegía a nadie y no sabía el precio hasta el final, que en una urgencia es
 * justo cuando peor sienta.
 *
 * Quién sale lo decide el servidor: tiene el oficio, está de guardia, le llega
 * con su radio, no atiende otra, tiene precio de urgencia y la identidad
 * verificada. Aquí solo se pinta, ordenado por cercanía —lo que cuenta es
 * cuánto tarda en llegar— con el precio a la vista para quien prefiera mirarlo.
 *
 * **Y si no hay nadie no se deja al cliente colgado**: se le manda al
 * directorio, donde puede encontrar a alguien que no esté de guardia pero que
 * quizá pueda echarle una mano.
 */

import { View, Text, ActivityIndicator, Pressable, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
import { Avatar } from '@/components/atoms/Avatar'
import { EmptyState } from '@/components/molecules/EmptyState'
import { InfoCard } from '@/components/molecules/InfoCard'
import { API_BASE_URL } from '@/api'
import { formatAmount } from '@/components/atoms/Money'
import { usePaymentMethods } from '@/hooks/domain/usePaymentMethods'
import { useUrgencyPros, useAskUrgency } from '@/hooks/domain/useUrgencyPros'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { theme } from '@/theme'
import { styles } from './UrgencyProsPage.styles'

export interface UrgencyProsPageProps {
  /** La urgencia que se acaba de crear, o una rechazada que busca a otro */
  jobId: string | undefined
  tradeSlug: string | undefined
  /** Dónde es la avería: de ahí sale quién llega */
  point: { lat: number; lng: number } | null
  /**
   * Quién ya dijo que no, si se entra desde una urgencia rechazada.
   *
   * Sigue saliendo en la lista —está de guardia y le llega—, pero apagado y
   * diciendo por qué. Quitarlo sin más haría pensar que se ha ido, y el
   * servidor tampoco deja volver a preguntarle: sin nada que haya cambiado,
   * la respuesta sería la misma y se habrían perdido cinco minutos más.
   */
  declinedProId?: string | null
  onAsked: (jobId: string) => void
  /** Buscar en el directorio, cuando no hay nadie de guardia */
  onSeeDirectory: () => void
  /** Sin tarjeta guardada no hay salida que retener */
  onAddPaymentMethod: () => void
  onBack: () => void
}

export function UrgencyProsPage({
  jobId,
  tradeSlug,
  point,
  declinedProId,
  onAsked,
  onSeeDirectory,
  onAddPaymentMethod,
  onBack,
}: UrgencyProsPageProps) {
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()
  const { data, isPending, isError, refetch } = useUrgencyPros(tradeSlug, point)
  const { data: methods, isPending: isPendingMethods } = usePaymentMethods()
  const { ask, isAsking } = useAskUrgency()

  const pros = data?.items ?? []
  const method = methods?.[0] ?? null

  /**
   * Se pregunta antes: se llega aquí con prisa y desde una lista, y un toque
   * en la ficha equivocada manda a alguien a tu casa a un precio que no era.
   *
   * **Y ahora se dice el dinero**, que hasta el 3 de septiembre de 2026 no
   * existía: la urgencia era el camino más caro de la app y el único gratis de
   * punta a punta. Lo que se aparta es la salida —una hora a su precio—, y la
   * primera hora va dentro: quien abre una puerta en veinte minutos cobra la
   * salida entera, porque lo que ha vendido es venir a las tres de la mañana.
   */
  const choose = (proId: string, name: string, rate: number) => {
    if (!jobId) return

    /*
      Sin tarjeta no se puede avisar a nadie, y decirlo aquí —no al pulsar
      enviar— es lo único honesto: con una avería delante, descubrir el muro
      después de elegir persona es perder minutos que cuestan.
    */
    if (!method) {
      Alert.alert(
        'Necesitas una tarjeta guardada',
        'La salida se aparta en tu tarjeta al avisarle, y solo se cobra si acepta. Guárdala en Mis pagos y vuelve: la urgencia se queda esperando.',
        [
          { text: 'Volver', style: 'cancel' },
          { text: 'Guardar tarjeta', onPress: onAddPaymentMethod },
        ],
      )
      return
    }

    Alert.alert(
      `¿Llamamos a ${name}?`,
      `Cobra ${rate} €/h. Se apartan ${formatAmount(rate)} € de salida —la primera hora va incluida— y solo se cobran si acepta. Si tarda más de una hora, el rato de más se cobra al cerrar.

Tiene cinco minutos para contestar; si no lo hace, se suelta el dinero y podrás elegir a otro.`,
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Sí, avisarle',
          onPress: () => {
            void (async () => {
              const { ok, error } = await ask(jobId, proId, method.id)

              if (!ok) {
                Alert.alert(
                  'No se ha podido avisar',
                  error ?? 'Inténtalo de nuevo en un momento.',
                )
                void refetch()
                return
              }

              onAsked(jobId)
            })()
          },
        },
      ],
    )
  }

  const header = (
    <View style={styles.header}>
      {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
        <Text style={styles.backIcon}>←</Text>
      </Pressable>
      <Text style={styles.title}>¿A quién llamamos?</Text>
    </View>
  )

  if (isPending || isPendingMethods) {
    return (
      <View style={styles.screen} testID="urgency-pros-page">
        {header}
        <View style={styles.state} testID="urgency-pros-loading">
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.screen} testID="urgency-pros-page">
        {header}
        <EmptyState
          title="No hemos podido mirar quién está disponible"
          message="Revisa tu conexión e inténtalo de nuevo."
          actions={[
            {
              label: 'Reintentar',
              onPress: () => void refetch(),
              testID: 'urgency-pros-retry',
            },
          ]}
          testID="urgency-pros-error"
        />
      </View>
    )
  }

  if (pros.length === 0) {
    return (
      <View style={styles.screen} testID="urgency-pros-page">
        {header}
        <EmptyState
          title="Ahora mismo no hay nadie de guardia cerca"
          message="Nadie de tu zona tiene este oficio activo para urgencias en este momento. Prueba en el directorio: puede que alguien que no esté de guardia pueda echarte una mano igualmente."
          actions={[
            {
              label: 'Buscar en el directorio',
              onPress: onSeeDirectory,
              testID: 'urgency-pros-directory',
            },
            {
              label: 'Volver a mirar',
              variant: 'secondary',
              onPress: () => void refetch(),
              testID: 'urgency-pros-recheck',
            },
          ]}
          testID="urgency-pros-empty"
        />
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="urgency-pros-page">
      {header}

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        <InfoCard variant="accent">
          <Text style={styles.intro}>
            {pros.length === 1
              ? 'Hay uno de guardia que llega a tu dirección.'
              : `Hay ${pros.length} de guardia que llegan a tu dirección.`}{' '}
            Están por cercanía: lo que cuenta en una urgencia es cuánto tarda en
            llegar.
          </Text>

          <Text style={styles.note}>
            El precio es por hora e incluye el recargo de urgencia. Al avisar se
            aparta una hora en tu tarjeta —la salida— y solo se cobra si acepta.
            Quien elijas tiene cinco minutos para contestar.
          </Text>
        </InfoCard>

        <View style={styles.list}>
          {pros.map((pro) => {
            const declined = pro.id === declinedProId

            return (
            <Pressable
              key={pro.id}
              onPress={() => choose(pro.id, pro.name, pro.urgencyRate)}
              disabled={isAsking || declined}
              accessibilityRole="button"
              accessibilityState={{ disabled: declined }}
              testID={`urgency-pro-${pro.id}`}
            >
              <InfoCard style={declined ? styles.cardOff : styles.card}>
                <View style={styles.row}>
                  <Avatar
                    uri={pro.avatarUrl ? `${API_BASE_URL}${pro.avatarUrl}` : null}
                    size={48}
                    available
                  />

                  <View style={styles.identity}>
                    <Text style={styles.name} numberOfLines={1}>
                      {pro.employerName ?? pro.name}
                    </Text>

                    {pro.employerName && (
                      <Text style={styles.worker} numberOfLines={1}>
                        Va {pro.name}
                      </Text>
                    )}

                    <Text style={styles.meta} numberOfLines={1}>
                      {pro.tradeLabel} · a {pro.distanceKm} km
                    </Text>

                    {/* Con texto y no solo apagado: un gris no se lee */}
                    {declined && (
                      <Text style={styles.declined}>
                        No puede con este trabajo
                      </Text>
                    )}

                    <Text style={styles.rating}>
                      ★ {pro.rating.toFixed(1)} ·{' '}
                      {pro.reviewCount === 0
                        ? 'sin reseñas'
                        : `${pro.reviewCount} reseñas`}
                    </Text>
                  </View>

                  <View style={styles.rateBox}>
                    <Text style={styles.rate}>{pro.urgencyRate} €/h</Text>
                    <Text style={styles.rateLabel}>urgencia</Text>
                  </View>
                </View>
              </InfoCard>
            </Pressable>
            )
          })}
        </View>
      </Animated.ScrollView>
    </View>
  )
}
