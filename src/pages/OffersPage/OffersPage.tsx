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
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Picker } from '@/components/molecules/Picker'
import { AuctionCard } from '@/components/organisms/AuctionCard'
import { useOpenJobs } from '@/hooks/domain/useOpenJobs'
import { TRADE_OPTIONS } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './OffersPage.styles'

const MY_TRADE = { value: '', label: 'Mi oficio' }

export interface OffersPageProps {
  onBack: () => void
}

export function OffersPage({ onBack }: OffersPageProps) {
  const [trade, setTrade] = useState('')

  const { data, isPending, isError, refetch, isFetching } = useOpenJobs(
    trade === '' ? {} : { trade },
  )

  const jobs = data?.items ?? []

  return (
    <View style={styles.screen} testID="offers-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Ofertas</Text>
      </View>

      <ScrollView
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
      </ScrollView>
    </View>
  )
}
