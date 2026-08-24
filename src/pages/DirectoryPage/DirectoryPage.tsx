/**
 * DirectoryPage
 * Directorio de profesionales, según MobileApp.dc.html (isProfesionales).
 *
 * **Sin mapa** (20 Agosto 2026). Lo tenía, y enseñaba a cada profesional en su
 * punto: eso es decirle a cualquiera dónde encontrar a una persona. La
 * cercanía se sigue diciendo, pero como distancia —"a 2,4 km de ti"—, que es
 * lo que el cliente necesita saber y no lleva a nadie a ninguna puerta.
 *
 * El orden lo decide el backend (cercanía y disponibilidad, según README):
 * la app no reordena nada. Si lo hiciera, la regla de negocio viviría en dos
 * sitios y acabarían discrepando.
 */

import { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { useTabBarClearance } from '@/hooks/ui/useTabBarClearance'
import { Input } from '@/components/atoms/Input'
import { Picker } from '@/components/molecules/Picker'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ProDirectoryCard, type CartaSelection } from '@/components/molecules/ProDirectoryCard'
import { useEffectiveRole } from '@/hooks/auth/useEffectiveRole'
import { useFavoriteIds, useToggleFavorite } from '@/hooks/domain/useFavorites'
import { usePros } from '@/hooks/domain/usePros'
import { searchTrades } from '@/utils/tradeSearch'
import { TRADE_OPTIONS, getTradeLabel } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './DirectoryPage.styles'

const ALL_TRADES = { value: '', label: 'Todos los oficios' }

export interface DirectoryPageProps {
  /** Oficio con el que se llega desde la home */
  initialTrade?: string
  /**
   * Abre la ficha. Si se marcó algo de la carta en la propia tarjeta antes
   * de tocarla, viaja aquí para que la ficha arranque con esa selección
   * puesta.
   */
  onSelectPro: (id: string, selection?: CartaSelection) => void
  /** Contratar la carta directamente desde la tarjeta, sin pasar por la ficha */
  onHireCarta: (proId: string, tradeSlug: string, serviceIds: string[]) => void
  /** Volver a la home; se ofrece cuando no hay resultados */
  onBack: () => void
  /**
   * Se ha entrado a buscar otro profesional para un trabajo que se quedó sin
   * nadie. Cambia lo que hace tocar una ficha: en vez de abrirla, se le
   * encarga el trabajo.
   */
  reassign?: {
    jobId: string
    /** Quién dijo que no. Su ficha sale apagada para no volver a elegirle */
    declinedProId?: string
    onChoose: (proId: string, proName: string) => void
    onCancel: () => void
  }
}

export function DirectoryPage({
  initialTrade,
  onSelectPro,
  onHireCarta,
  onBack,
  reassign,
}: DirectoryPageProps) {
  /**
   * La barra inferior se encoge al bajar y vuelve al subir. Va en todas
   * las pantallas con scroll, no solo en el inicio: si en una se moviera
   * y en la siguiente no, parecería que la barra falla.
   */
  const onScroll = useNavScrollHandler()
  const tabBarClearance = useTabBarClearance()

  /**
   * Favoritos (COMO_SE_CONTRATA.md §11): es cosa del cliente. Quien entra
   * aquí en modo profesional —se puede llegar sin pasar por su pestaña,
   * como al buscar sustituto para un trabajo— no ve el corazón.
   */
  const isClient = useEffectiveRole() === 'client'
  const favoriteIds = useFavoriteIds()
  const { toggle: toggleFavorite } = useToggleFavorite()

  const [trade, setTrade] = useState(initialTrade ?? '')
  const [availableNow, setAvailableNow] = useState(false)
  const [query, setQuery] = useState('')

  /**
   * La pestaña no se desmonta al salir de ella, así que el valor inicial solo
   * se leería la primera vez. Sin esto, tocar Fontanería y luego Pintura en
   * el carrusel mostraría siempre el primer oficio elegido.
   *
   * Si se llega sin oficio ("Ver profesionales"), se limpia el filtro: es lo
   * que espera quien entra al directorio general.
   */
  useEffect(() => {
    setTrade(initialTrade ?? '')
  }, [initialTrade])

  const suggestions = searchTrades(query)

  const { data, isPending, isError, refetch, isFetching } = usePros({
    trade: trade || undefined,
    availableNow: availableNow || undefined,
  })

  const pros = data?.items ?? []

  return (
    <View style={styles.screen} testID="directory-page">
      <View style={styles.header}>
        <Text style={styles.title}>Profesionales</Text>
        {trade !== '' && (
          <Text style={styles.subtitle}>{getTradeLabel(trade)}</Text>
        )}
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarClearance }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrapper}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="¿Qué necesitas? Ej. cerrajero…"
            autoCorrect={false}
            returnKeyType="search"
            testID="directory-search"
          />

          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map(({ trade: suggestion, hint }) => (
                <Pressable
                  key={suggestion.slug}
                  onPress={() => {
                    setTrade(suggestion.slug)
                    setQuery('')
                  }}
                  testID={`directory-suggestion-${suggestion.slug}`}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.suggestion,
                    pressed && styles.suggestionPressed,
                  ]}
                >
                  <Text style={styles.suggestionLabel}>{suggestion.label}</Text>
                  {hint && <Text style={styles.suggestionHint}>{hint}</Text>}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filters}>
          <Pressable
            onPress={() => setAvailableNow((value) => !value)}
            testID="directory-available-now"
            accessibilityRole="switch"
            accessibilityState={{ checked: availableNow }}
            style={[styles.chip, availableNow && styles.chipActive]}
          >
            <View
              style={[styles.chipDot, availableNow && styles.chipDotActive]}
            />
            <Text style={[styles.chipText, availableNow && styles.chipTextActive]}>
              Disponibles
            </Text>
          </Pressable>

          <View style={styles.tradeFilter}>
            <Picker
              options={[ALL_TRADES, ...TRADE_OPTIONS]}
              value={trade}
              onChange={setTrade}
              placeholder="Todos los oficios"
              title="Filtrar por oficio"
              testID="directory-trade"
            />
          </View>
        </View>

        {/*
          Buscando sustituto. Se dice arriba y con salida: el directorio se ve
          igual que siempre y sin esto nadie sabría por qué al tocar una ficha
          pasa algo distinto.
        */}
        {reassign && (
          <View style={styles.reassigning}>
            <Text style={styles.reassigningText}>
              Elige otro profesional que pueda encargarse de tu trabajo.
            </Text>
            <Pressable
              onPress={reassign.onCancel}
              accessibilityRole="button"
              style={styles.reassigningButton}
              testID="directory-reassign-cancel"
            >
              <Text style={styles.reassigningCancel}>Dejarlo</Text>
            </Pressable>
          </View>
        )}

        {isPending ? (
          <View style={styles.state} testID="directory-loading">
            <ActivityIndicator size="large" color={theme.colors.accent} />
            <Text style={styles.stateText}>Buscando profesionales…</Text>
          </View>
        ) : isError ? (
          <EmptyState
            title="No hemos podido cargar la lista"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'directory-retry',
              },
              {
                label: 'Volver al inicio',
                onPress: onBack,
                variant: 'secondary',
                testID: 'directory-back',
              },
            ]}
            testID="directory-error"
          />
        ) : pros.length === 0 ? (
          <EmptyState
            title={
              trade
                ? `Sin ${getTradeLabel(trade).toLowerCase()} por ahora`
                : 'Ningún profesional por ahora'
            }
            message={
              trade
                ? `Todavía no hay profesionales de ${getTradeLabel(trade)}${availableNow ? ' disponibles ahora mismo' : ''}. Prueba con otro oficio o vuelve al inicio.`
                : 'No hay profesionales que cumplan estos filtros. Prueba a quitarlos.'
            }
            actions={[
              // Quitar el filtro es la salida más útil: casi siempre hay
              // alguien en otro oficio, y así no se acaba en un callejón.
              ...(trade || availableNow
                ? [
                    {
                      label: 'Ver todos los profesionales',
                      onPress: () => {
                        setTrade('')
                        setAvailableNow(false)
                      },
                      testID: 'directory-clear-filters',
                    },
                  ]
                : []),
              {
                label: 'Volver al inicio',
                onPress: onBack,
                variant: 'secondary' as const,
                testID: 'directory-back',
              },
            ]}
            testID="directory-empty"
          />
        ) : (
          <>
            <Text style={styles.count}>
              {data?.total} {data?.total === 1 ? 'profesional' : 'profesionales'}
              {isFetching ? ' · actualizando…' : ''}
            </Text>

            <View style={styles.list}>
              {pros.map((pro) => (
                <ProDirectoryCard
                  key={pro.id}
                  pro={pro}
                  /*
                    Reasignando, tocar una ficha le encarga el trabajo en vez
                    de abrirla: se ha entrado a elegir, no a mirar.
                  */
                  onPress={(selection) =>
                    reassign
                      ? reassign.onChoose(pro.id, pro.name)
                      : onSelectPro(pro.id, selection)
                  }
                  onHireCarta={onHireCarta}
                  {...(isClient && {
                    isFavorite: favoriteIds.has(pro.id),
                    onToggleFavorite: () => toggleFavorite(pro, favoriteIds.has(pro.id)),
                  })}
                  disabled={reassign?.declinedProId === pro.id}
                  disabledNote="Ya te ha dicho que no puede con este trabajo"
                  testID={`pro-${pro.id}`}
                />
              ))}
            </View>
          </>
        )}
      </Animated.ScrollView>
    </View>
  )
}
