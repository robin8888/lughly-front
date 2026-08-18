/**
 * QuickSearch Molecule
 * Buscador rápido del hero (HOME_MOBILE.md §2).
 *
 * Filtra por nombre de oficio y por sinónimos: "fuga" → Fontanería,
 * "gotelé" → Pintura, "wifi" → Informática. Se resuelve en local, así que
 * responde mientras se escribe y funciona sin conexión.
 */

import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Icon } from '@/components/atoms/Icon'
import { Input } from '@/components/atoms/Input'
import { theme } from '@/theme'
import { searchTrades } from '@/utils/tradeSearch'
import type { TradeSlug } from '@/utils/trades'
import { ICON_SIZE, styles } from './QuickSearch.styles'

export interface QuickSearchProps {
  onSelect: (slug: TradeSlug) => void
  testID?: string
}

export function QuickSearch({ onSelect, testID }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  const suggestions = searchTrades(query)

  const handleSelect = (slug: TradeSlug) => {
    setQuery('')
    onSelect(slug)
  }

  return (
    <View style={styles.wrapper}>
      {/* Variante clara: el hero dejó de ser una tarjeta negra */}
      <View style={styles.field}>
        <View style={styles.icon}>
          <Icon name="search" size={ICON_SIZE} color={theme.colors.accent700} />
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="¿Qué necesitas? Ej. cerrajero…"
          /*
           * El átomo lo pone al 50% de negro, que sobre el blanco de este
           * campo se queda en 3,1:1. Al 62% sube a 5,3:1 y el ejemplo se lee
           * de verdad, que es lo que le dice a alguien qué puede escribir.
           */
          placeholderTextColor="rgba(29, 31, 32, 0.62)"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.input}
          testID={testID}
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestions} testID={testID ? `${testID}-list` : undefined}>
          {suggestions.map(({ trade, hint }, index) => (
            <Pressable
              key={trade.slug}
              onPress={() => handleSelect(trade.slug)}
              testID={testID ? `${testID}-${trade.slug}` : undefined}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.suggestion,
                index === suggestions.length - 1 && styles.suggestionLast,
                pressed && styles.suggestionPressed,
              ]}
            >
              <Text style={styles.label}>{trade.label}</Text>
              {hint && (
                <Text style={styles.hint} numberOfLines={1}>
                  {hint}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.note}>Primero los cercanos que pueden ir ya.</Text>
    </View>
  )
}
