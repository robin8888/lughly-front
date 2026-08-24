/**
 * FavoritesPage
 * Los profesionales que el cliente ha marcado como favoritos
 * (COMO_SE_CONTRATA.md §11): volver a encontrarlos sin rebuscar en el
 * directorio la próxima vez que hagan falta.
 *
 * Misma tarjeta que el directorio (`ProDirectoryCard`): la lista de
 * favoritos es la del directorio, solo que el servidor la filtra a estos.
 */

import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ProDirectoryCard, type CartaSelection } from '@/components/molecules/ProDirectoryCard'
import { useFavorites, useToggleFavorite } from '@/hooks/domain/useFavorites'
import { theme } from '@/theme'
import { styles } from './FavoritesPage.styles'

export interface FavoritesPageProps {
  /**
   * Abre la ficha. Si se marcó algo de la carta en la propia tarjeta antes
   * de tocarla, viaja aquí, igual que en el directorio.
   */
  onSelectPro: (id: string, selection?: CartaSelection) => void
  /** Contratar la carta directamente desde la tarjeta, sin pasar por la ficha */
  onHireCarta: (proId: string, tradeSlug: string, serviceIds: string[]) => void
  onBack: () => void
}

export function FavoritesPage({ onSelectPro, onHireCarta, onBack }: FavoritesPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas las
   * pantallas con scroll, no solo en el inicio: si en una se moviera y en la
   * siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  const { data, isPending, isError, refetch, isFetching } = useFavorites()
  const { toggle: toggleFavorite } = useToggleFavorite()

  const pros = data?.items ?? []

  return (
    <View style={styles.screen} testID="favorites-page">
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          testID="favorites-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Mis favoritos</Text>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        showsVerticalScrollIndicator={false}
      >
        {isPending ? (
          <View style={styles.state} testID="favorites-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar tus favoritos"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              { label: 'Reintentar', onPress: () => void refetch(), testID: 'favorites-retry' },
              {
                label: 'Volver',
                onPress: onBack,
                variant: 'secondary',
                testID: 'favorites-back-error',
              },
            ]}
            testID="favorites-error"
          />
        ) : pros.length === 0 ? (
          <EmptyState
            title="Todavía no tienes favoritos"
            message="Cuando un profesional te haga un buen trabajo, márcalo con el corazón de su ficha o de su tarjeta en el directorio. La próxima vez lo tienes aquí, sin rebuscar entre todos los del oficio."
            actions={[{ label: 'Volver', onPress: onBack, testID: 'favorites-back-empty' }]}
            testID="favorites-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {data?.total} {data?.total === 1 ? 'favorito' : 'favoritos'}
              {isFetching ? ' · actualizando…' : ''}
            </Text>

            <View style={styles.list}>
              {pros.map((pro) => (
                <ProDirectoryCard
                  key={pro.id}
                  pro={pro}
                  onPress={(selection) => onSelectPro(pro.id, selection)}
                  onHireCarta={onHireCarta}
                  isFavorite
                  onToggleFavorite={() => toggleFavorite(pro, true)}
                  testID={`favorite-${pro.id}`}
                />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
