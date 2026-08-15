/**
 * OffersPage
 * Las subastas a las que este profesional puede pujar.
 *
 * Por defecto solo las de su oficio, que es lo que va a mirar casi siempre.
 * El filtro permite ampliar a otro —alguien de fontanería puede querer ver
 * climatización— pero el servidor sigue rechazando la puja si el oficio no
 * es el suyo, así que ver no es poder.
 *
 * Vienen ordenadas por cierre más próximo: es donde corre prisa pujar.
 */

import { useState } from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Picker } from '@/components/molecules/Picker'
import { AuctionCard } from '@/components/organisms/AuctionCard'
import { useOpenJobs } from '@/hooks/domain/useOpenJobs'
import { useIsEmployee } from '@/hooks/domain/useIsEmployee'
import { TRADE_OPTIONS } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './OffersPage.styles'

const MY_TRADE = { value: '', label: 'Mi oficio' }

export interface OffersPageProps {
  onBack: () => void
}

export function OffersPage({ onBack }: OffersPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()

  const [trade, setTrade] = useState('')
  const isEmployee = useIsEmployee()

  /**
   * Al empleado ni se le pide la lista: el backend se la niega, y con razón
   * —lleva presupuestos e importes de pujas—, así que pedirla solo sería
   * gastar una llamada para acabar en un 403.
   */
  const { data, isPending, isError, refetch, isFetching } = useOpenJobs(
    trade === '' ? {} : { trade },
    !isEmployee,
  )

  const jobs = data?.items ?? []

  if (isEmployee) {
    return (
      <View style={styles.screen} testID="offers-page">
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <Text style={styles.title}>Ofertas</Text>
        </View>

        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.content}
        >
          <EmptyState
            title="Las subastas las lleva tu empresa"
            message="Quien puja, factura y cobra es quien te dio de alta. Tú verás los trabajos que te asigne en tu agenda, con la dirección y la hora."
            illustration="greeting"
            actions={[
              {
                label: 'Volver al inicio',
                onPress: onBack,
                testID: 'offers-employee-back',
              },
            ]}
            testID="offers-employee"
          />
        </Animated.ScrollView>
      </View>
    )
  }

  return (
    <View style={styles.screen} testID="offers-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Ofertas</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filter}>
          <Picker
            options={[MY_TRADE, ...TRADE_OPTIONS]}
            value={trade}
            onChange={setTrade}
            placeholder="Mi oficio"
            title="Ver subastas de"
            testID="offers-trade"
          />
        </View>

        {isPending ? (
          <View style={styles.state} testID="offers-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar las subastas"
            message="Revisa tu conexión e inténtalo de nuevo."
            illustration="greeting"
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'offers-retry',
              },
            ]}
            testID="offers-error"
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title={
              trade === ''
                ? 'No hay subastas abiertas de tu oficio'
                : 'No hay subastas abiertas de ese oficio'
            }
            message="Las subastas aparecen aquí en cuanto un cliente publica un trabajo. Mantén tu perfil al día para que te encuentren también por el directorio."
            actions={
              trade === ''
                ? []
                : [
                    {
                      label: 'Volver a mi oficio',
                      onPress: () => setTrade(''),
                      testID: 'offers-clear-filter',
                    },
                  ]
            }
            testID="offers-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {data?.total} {data?.total === 1 ? 'subasta abierta' : 'subastas abiertas'}
              {isFetching ? ' · actualizando…' : ''}
            </Text>

            <View style={styles.list}>
              {jobs.map((job) => (
                <AuctionCard key={job.id} job={job} testID={`auction-${job.id}`} />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
