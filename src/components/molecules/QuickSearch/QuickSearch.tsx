/**
 * QuickSearch Molecule
 * Buscador rápido del hero (HOME_MOBILE.md §2).
 *
 * Filtra por nombre de oficio y por sinónimos: "fuga" → Fontanería,
 * "gotelé" → Pintura, "wifi" → Informática. Se resuelve en local, así que
 * responde mientras se escribe y funciona sin conexión.
 *
 * **Lo elegido se queda escrito.** El campo se vaciaba al elegir, y dejaba la
 * pantalla contestando —el bocadillo diciendo "hay 7 electricistas"— junto a
 * un buscador en blanco, como si no se hubiera buscado nada. Ahora se queda el
 * oficio y aparece una cruz, que es lo que empieza una búsqueda nueva.
 */

import { useState } from 'react'
import { View, Text, Pressable, Keyboard } from 'react-native'
import { Icon } from '@/components/atoms/Icon'
import { Input } from '@/components/atoms/Input'
import { theme } from '@/theme'
import { searchTrades } from '@/utils/tradeSearch'
import { getTradeLabel, type TradeSlug } from '@/utils/trades'
import { CLEAR_SIZE, ICON_SIZE, styles } from './QuickSearch.styles'

export interface QuickSearchProps {
  onSelect: (slug: TradeSlug) => void
  testID?: string
}

export function QuickSearch({ onSelect, testID }: QuickSearchProps) {
  const [query, setQuery] = useState('')
  /**
   * El oficio ya elegido, si lo hay.
   *
   * No se deduce del texto. Con "Electricista" escrito en el campo,
   * `searchTrades` vuelve a proponer Electricista, así que el desplegable
   * reaparecería debajo de lo que se acaba de elegir ofreciendo elegirlo otra
   * vez. Esta bandera es lo que distingue "escribiendo" de "ya elegido".
   */
  const [chosen, setChosen] = useState<TradeSlug | null>(null)

  const suggestions = chosen ? [] : searchTrades(query)

  const handleSelect = (slug: TradeSlug) => {
    setChosen(slug)
    // Lo elegido se queda escrito: es lo que dice a qué contesta el bocadillo
    setQuery(getTradeLabel(slug))
    /*
      Y se retira el teclado. Ocupa media pantalla, y justo debajo del hero
      está la respuesta a lo que se acaba de buscar —cuántos hay de ese
      oficio—: dejarlo abierto la tapa entera. No se va solo al tocar una
      sugerencia, porque el desplegable la recoge con
      `keyboardShouldPersistTaps` y para React Native ese toque no cuenta como
      tocar fuera del campo.
    */
    Keyboard.dismiss()
    onSelect(slug)
  }

  /** Escribir encima deshace la elección y vuelve a proponer */
  const handleChangeText = (text: string) => {
    setQuery(text)
    if (chosen) setChosen(null)
  }

  /**
   * La cruz: deja el campo listo para otra búsqueda.
   *
   * **No le dice a la pantalla que ya no hay oficio**, y es a propósito: el
   * bocadillo sigue contestando a lo último que se buscó. Quien borra para
   * escribir otra cosa no ha dejado de querer ver a los siete electricistas
   * de antes hasta que encuentre algo mejor, y vaciar la respuesta al primer
   * toque le quitaría la salida que ya tenía delante.
   */
  const handleClear = () => {
    setQuery('')
    setChosen(null)
  }

  /**
   * El intro del teclado se queda con la primera sugerencia, que es la que se
   * está mirando al pulsarlo. Sin ninguna no hay adónde ir, y entonces al
   * menos se quita el teclado de en medio.
   */
  const handleSubmit = () => {
    const primera = suggestions[0]

    if (primera) handleSelect(primera.trade.slug)
    else Keyboard.dismiss()
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
          onChangeText={handleChangeText}
          placeholder="¿Qué necesitas? Ej. cerrajero…"
          /*
           * El átomo lo pone al 50% de negro, que sobre el blanco de este
           * campo se queda en 3,1:1. Al 62% sube a 5,3:1 y el ejemplo se lee
           * de verdad, que es lo que le dice a alguien qué puede escribir.
           */
          placeholderTextColor="rgba(29, 31, 32, 0.62)"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          style={styles.input}
          testID={testID}
        />

        {query !== '' && (
          <Pressable
            onPress={handleClear}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel="Borrar la búsqueda"
            /*
              El dibujo mide 18 y un objetivo táctil pide 44: el `hitSlop` los
              reconcilia sin agrandar el icono ni robarle ancho al texto.
            */
            hitSlop={13}
            testID={testID ? `${testID}-clear` : undefined}
          >
            <Icon name="close" size={CLEAR_SIZE} color={theme.colors.textSoft} />
          </Pressable>
        )}

        {/*
          El desplegable cuelga **del campo**, no del bloque entero. Estaba
          fuera, hermano de la nota de abajo, y con `top: '100%'` medido sobre
          el bloque salía por debajo de esa nota: aparecía a un buen trecho del
          campo, lo bastante lejos como para no leerse como su continuación.
        */}
        {suggestions.length > 0 && (
          <View
            style={styles.suggestions}
            testID={testID ? `${testID}-list` : undefined}
          >
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
      </View>

      <Text style={styles.note}>Primero los cercanos que pueden ir ya.</Text>
    </View>
  )
}
