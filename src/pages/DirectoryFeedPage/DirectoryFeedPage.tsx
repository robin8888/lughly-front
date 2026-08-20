/**
 * DirectoryFeedPage — PROPUESTA, 20 Agosto 2026. **Pantalla de prueba.**
 *
 * El mismo directorio que `DirectoryPage`, con los mismos datos y el mismo
 * `usePros`, contado como un feed. Existe para poder abrir las dos y
 * compararlas; cuando se decida, o sustituye a la de ahora o se borra entera.
 *
 * Lo que cambia respecto a la actual:
 *
 * - **Cabecera sin caja y sin mayúsculas.** El rótulo actual va en Fredoka en
 *   caja alta sobre una franja con línea debajo, que se lee como el letrero de
 *   una ventanilla. Aquí es un titular y ya.
 * - **Buscador redondeado**, del ancho de la pantalla, con las sugerencias
 *   colgando en una tarjeta flotante en vez de en un cajón cuadrado.
 * - **Los oficios, en chips que se deslizan.** Ahora hay un desplegable con 18
 *   entradas: elegir obliga a abrir, leer y cerrar. En chips se ve lo que hay
 *   y se cambia de uno en uno, que es como se filtra en cualquier app de hoy.
 * - **Fondo blanco y tarjetas sin marco**, que es de donde viene casi todo el
 *   cambio de aire.
 *
 * Se ha dejado fuera el mapa a propósito: es la parte que menos dice del
 * aspecto y arrastraría medio organismo detrás.
 */

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ProFeedCard } from '@/components/molecules/ProFeedCard'
import { usePros } from '@/hooks/domain/usePros'
import { searchTrades } from '@/utils/tradeSearch'
import { TRADES, getTradeLabel } from '@/utils/trades'
import { feed } from '@/theme/feed'
import { styles } from './DirectoryFeedPage.styles'

/**
 * Los que caben sin que la fila se haga interminable. Los 18 siguen estando:
 * el buscador de arriba los encuentra todos por nombre y por sinónimo.
 */
const VISIBLE_TRADES = TRADES.slice(0, 8)

export interface DirectoryFeedPageProps {
  initialTrade?: string
  onSelectPro: (id: string) => void
  onBack: () => void
}

export function DirectoryFeedPage({
  initialTrade,
  onSelectPro,
  onBack,
}: DirectoryFeedPageProps) {
  const onScroll = useNavScrollHandler()

  const [trade, setTrade] = useState(initialTrade ?? '')
  const [availableNow, setAvailableNow] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    setTrade(initialTrade ?? '')
  }, [initialTrade])

  const suggestions = searchTrades(query)

  const { data, isPending, isError, refetch } = usePros({
    trade: trade || undefined,
    availableNow: availableNow || undefined,
  })

  const pros = data?.items ?? []

  return (
    <View style={styles.screen} testID="directory-feed-page">
      <View style={styles.header}>
        <Pressable onPress={onBack} accessibilityRole="button" style={styles.back}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Profesionales</Text>
          <Text style={styles.subtitle}>
            {trade === '' ? 'Todos los oficios' : getTradeLabel(trade)}
          </Text>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchWrapper}>
          {/*
            Campo propio y no el `Input` del sistema: aquel es cuadrado y con
            borde, que es justo lo que esta propuesta quita.
          */}
          <View style={styles.search}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="¿Qué necesitas? Ej. cerrajero…"
              placeholderTextColor={feed.colors.textSoft}
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
              testID="feed-search"
            />
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map(({ trade: suggestion, hint }) => (
                <Pressable
                  key={suggestion.slug}
                  onPress={() => {
                    setTrade(suggestion.slug)
                    setQuery('')
                  }}
                  accessibilityRole="button"
                  testID={`feed-suggestion-${suggestion.slug}`}
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          keyboardShouldPersistTaps="handled"
        >
          {/*
            "Disponible ahora" va el primero y en verde cuando está puesto: es
            el único filtro que cambia lo que se puede hacer hoy, no solo lo
            que se ve.
          */}
          <Pressable
            onPress={() => setAvailableNow((value) => !value)}
            accessibilityRole="switch"
            accessibilityState={{ checked: availableNow }}
            testID="feed-available-now"
            style={[styles.chip, availableNow && styles.chipAvailable]}
          >
            <View
              style={[styles.chipDot, availableNow && styles.chipDotActive]}
            />
            <Text
              style={[
                styles.chipText,
                availableNow && styles.chipTextAvailable,
              ]}
            >
              Disponible ahora
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTrade('')}
            accessibilityRole="button"
            testID="feed-trade-all"
            style={[styles.chip, trade === '' && styles.chipActive]}
          >
            <Text
              style={[styles.chipText, trade === '' && styles.chipTextActive]}
            >
              Todos
            </Text>
          </Pressable>

          {VISIBLE_TRADES.map((option) => (
            <Pressable
              key={option.slug}
              onPress={() => setTrade(option.slug)}
              accessibilityRole="button"
              testID={`feed-trade-${option.slug}`}
              style={[styles.chip, trade === option.slug && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  trade === option.slug && styles.chipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isPending && (
          <View style={styles.state} testID="feed-loading">
            <ActivityIndicator size="large" color={feed.colors.accent} />
          </View>
        )}

        {isError && (
          <EmptyState
            title="No hemos podido cargar el directorio"
            message="Revisa tu conexión e inténtalo de nuevo."
            actions={[
              {
                label: 'Reintentar',
                onPress: () => void refetch(),
                testID: 'feed-retry',
              },
            ]}
            testID="feed-error"
          />
        )}

        {!isPending && !isError && pros.length === 0 && (
          <EmptyState
            title="Aquí no hay nadie todavía"
            message="Prueba con otro oficio, o quita el filtro de disponibles ahora."
            actions={[
              {
                label: 'Ver todos',
                onPress: () => {
                  setTrade('')
                  setAvailableNow(false)
                },
                testID: 'feed-clear',
              },
            ]}
            testID="feed-empty"
          />
        )}

        {pros.map((pro) => (
          <ProFeedCard
            key={pro.id}
            pro={pro}
            onPress={() => onSelectPro(pro.id)}
            testID={`feed-pro-${pro.id}`}
          />
        ))}
      </Animated.ScrollView>
    </View>
  )
}
