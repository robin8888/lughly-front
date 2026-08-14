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
import { Input } from '@/components/atoms/Input'
import { searchTrades } from '@/utils/tradeSearch'
import type { TradeSlug } from '@/utils/trades'
import { styles } from './QuickSearch.styles'

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
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="¿Qué necesitas? Ej. cerrajero…"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.input}
        testID={testID}
      />

      {suggestions.length > 0 && (
        <View style={styles.suggestions} testID={testID ? `${testID}-list` : undefined}>
          {suggestions.map(({ trade, hint }) => (
            <Pressable
              key={trade.slug}
              onPress={() => handleSelect(trade.slug)}
              testID={testID ? `${testID}-${trade.slug}` : undefined}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.suggestion,
                pressed && styles.suggestionPressed,
              ]}
            >
              <Text style={styles.label}>{trade.label}</Text>
              {hint && <Text style={styles.hint}>{hint}</Text>}
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.note}>Primero los cercanos que pueden ir ya.</Text>
    </View>
  )
}
