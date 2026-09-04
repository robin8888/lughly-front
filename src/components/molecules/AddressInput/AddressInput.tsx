/**
 * AddressInput Molecule
 * Un campo de dirección con sugerencias del geocodificador.
 *
 * Se escribe "calle Virgen del Pui" y debajo aparecen las direcciones reales
 * que empiezan así; se elige una y el campo se queda con **sus coordenadas**,
 * no solo con el texto.
 *
 * ## Por qué el valor es un objeto y no una cadena
 *
 * Porque una dirección sin coordenadas no sirve para nada de lo que la app
 * hace con ella: ordenar profesionales por cercanía, saber si una urgencia
 * cae dentro del radio de alguien, colocar un punto en el mapa. El campo
 * devuelve `null` mientras no haya una dirección elegida, y eso es lo que
 * permite que un formulario exija tenerla sin inventarse una validación de
 * texto que no significa nada.
 *
 * Escribir después de haber elegido **descarta la elección**. Es la regla que
 * evita el fallo peor de este tipo de campo: elegir "Gran Vía 1", añadir un
 * "3" al final y mandar unas coordenadas que ya no son las de lo que se lee.
 *
 * ## Qué sustituye
 *
 * Los cuatro campos de dirección que había sueltos por la app, cada uno con
 * su comportamiento: Cobertura buscaba con un botón, Urgencias geocodificaba
 * sola y se quedaba **en silencio con la primera coincidencia** —el cliente
 * no llegaba a saber a qué portal iba a ir el fontanero—, y Contratar y
 * Contratar por carta eran texto plano sin geocodificar.
 */

import { useEffect, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
import { Input } from '@/components/atoms/Input'
import { Icon } from '@/components/atoms/Icon'
import { type ApiGeocodeMatch } from '@/api/geocode.api'
import { numberFromLabel, type AddressDetail } from '@/utils/address'
import {
  useAddressSuggestions,
  MIN_SUGGEST_QUERY,
} from '@/hooks/domain/useAddressSuggestions'
import { theme } from '@/theme'
import { ICON_SIZE, styles } from './AddressInput.styles'

export interface AddressInputProps {
  /** La dirección elegida, o null mientras no haya ninguna */
  value: ApiGeocodeMatch | null
  onChange: (address: ApiGeocodeMatch | null) => void
  placeholder?: string
  error?: boolean
  editable?: boolean
  /**
   * Las piezas que acompañan a la calle —número, escalera, piso, puerta y
   * código postal—, como se piden en cualquier formulario español.
   *
   * El geocodificador llega al portal y no más allá, y el profesional necesita
   * el resto para llamar al timbre. Van aparte y no dentro de la dirección
   * porque escribirlas ahí rompe la elección: el campo de la calle solo vale
   * si lo que tiene dentro es una sugerencia elegida.
   *
   * Antes era un solo campo de texto libre —«Piso, puerta, escalera…
   * (opcional)»— y eso dejaba fuera lo único que **no** es opcional: el
   * número. Sin él no hay portal al que ir.
   */
  detail?: AddressDetail
  onDetailChange?: (detail: AddressDetail) => void
  testID?: string
}

export function AddressInput({
  value,
  onChange,
  placeholder = 'Ej. Calle Virgen del Puig 4',
  error = false,
  editable = true,
  detail,
  onDetailChange,
  testID,
}: AddressInputProps) {
  const [query, setQuery] = useState(value?.label ?? '')

  /**
   * Que el campo siga a su valor cuando este cambia desde fuera: es lo que
   * hace "Usar mi ubicación actual" y lo que hace un formulario que se
   * rellena con lo que ya había guardado. Sin esto, la dirección cambiaría
   * por dentro y el campo seguiría enseñando lo anterior.
   */
  useEffect(() => {
    if (value) setQuery(value.label)
  }, [value])

  /*
   * Con una dirección ya elegida no se pregunta nada. El texto del campo es
   * exactamente su etiqueta, así que las sugerencias serían ella misma.
   */
  const suggestions = useAddressSuggestions(query, value === null)

  const choose = (match: ApiGeocodeMatch) => {
    setQuery(match.label)
    onChange(match)

    /*
      Lo que la sugerencia ya sabe, puesto: el código postal viene con ella, y
      el número suele venir dentro de la propia línea. Preguntar con el campo
      vacío lo que se acaba de elegir parece que la app no lo ha leído.

      Solo lo que esté en blanco: quien haya escrito ya su piso y cambie de
      calle no debería perderlo.
    */
    if (onDetailChange && detail) {
      onDetailChange({
        ...detail,
        number: detail.number === '' ? numberFromLabel(match.label, match.city) : detail.number,
        postcode: detail.postcode === '' ? (match.postcode ?? '') : detail.postcode,
      })
    }
  }

  const handleChangeText = (text: string) => {
    setQuery(text)
    // Tocar el texto invalida la elección: ver la cabecera
    if (value !== null) onChange(null)
  }

  const matches = suggestions.status === 'ready' ? suggestions.matches : []
  const showList = value === null && matches.length > 0

  return (
    <View style={styles.wrapper}>
      <View style={styles.field}>
        <Input
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(29, 31, 32, 0.62)"
          autoCorrect={false}
          autoCapitalize="words"
          error={error}
          editable={editable}
          style={styles.input}
          testID={testID}
        />

        {/*
          El indicador va dentro del campo y no debajo: debajo empujaría la
          lista de sugerencias hacia abajo cada vez que aparece y desaparece,
          y lo que se está mirando en ese momento es justo esa lista.
        */}
        {suggestions.status === 'searching' && (
          <View style={styles.status} pointerEvents="none">
            <ActivityIndicator size="small" color={theme.colors.accent700} />
          </View>
        )}

        {/*
          Y cuando hay dirección elegida, la chincheta en verde. Es la única
          señal de que este campo ya tiene coordenadas detrás; sin ella, una
          dirección escrita a mano y una elegida de la lista se ven igual y
          solo se distinguen al intentar enviar el formulario.

          Chincheta y no un visto: lo que confirma no es que el texto esté
          bien escrito, es que ese texto es **un punto en el mapa**. El verde
          es el de `available`, el mismo que dice "esto está resuelto" en el
          resto de la app.
        */}
        {value !== null && (
          <View style={styles.status} pointerEvents="none" testID={testID ? `${testID}-chosen` : undefined}>
            <Icon name="map-pin" size={ICON_SIZE} color={theme.colors.available} />
          </View>
        )}

        {/*
          El desplegable cuelga **del campo** y no del bloque entero, que es
          lo que mide su `top: '100%'`. Fuera de aquí, un bloque con notas o
          con el campo del piso debajo lo empujaría hasta debajo de ellos: se
          vería a un trecho de lo que se está escribiendo, como si fuera de
          otra cosa.
        */}
        {showList && (
          <View style={styles.suggestions} testID={testID ? `${testID}-list` : undefined}>
            {matches.map((match, index) => (
              <Pressable
                /*
                  Con el índice delante, y no solo con las coordenadas.

                  Photon devuelve a veces dos resultados **en el mismo punto**
                  —el portal y el comercio que hay en él, o la misma calle como
                  dos objetos distintos de OSM—, y entonces dos hijos comparten
                  `key`: React lo grita por consola en cada pintada y se queda
                  sin forma de emparejar las filas si la lista cambia debajo.
                  El servidor ya no debería mandar repetidos, pero un
                  desplegable no es el sitio donde castigar que lo haga.

                  El índice aquí no tiene el problema de siempre: la lista se
                  rehace entera en cada búsqueda y ninguna fila guarda estado.
                */
                key={`${index}-${match.lat},${match.lng}`}
                onPress={() => choose(match)}
                accessibilityRole="button"
                testID={testID ? `${testID}-match-${match.lat},${match.lng}` : undefined}
                style={({ pressed }) => [
                  styles.suggestion,
                  pressed && styles.suggestionPressed,
                ]}
              >
                <Text style={styles.suggestionLabel} numberOfLines={2}>
                  {match.label}
                </Text>
                {match.postcode && (
                  <Text style={styles.suggestionMeta}>{match.postcode}</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/*
        Los tres estados que no son una lista. Se dicen con palabras y no con
        un hueco vacío: quien escribe una dirección y no ve nada no sabe si la
        app está pensando, si no encuentra su calle o si se ha caído algo.
      */}
      {value === null && suggestions.status === 'ready' && matches.length === 0 && (
        <Text style={styles.note} testID={testID ? `${testID}-empty` : undefined}>
          No encontramos esa dirección. Prueba con la calle y el número, sin el
          piso.
        </Text>
      )}

      {suggestions.status === 'failed' && (
        <Text style={[styles.note, styles.noteError]} testID={testID ? `${testID}-failed` : undefined}>
          No hemos podido buscar direcciones ahora mismo. Revisa la conexión y
          vuelve a escribir.
        </Text>
      )}

      {value === null &&
        suggestions.status === 'idle' &&
        query.trim().length > 0 &&
        query.trim().length < MIN_SUGGEST_QUERY && (
          <Text style={styles.note}>Sigue escribiendo para ver sugerencias.</Text>
        )}

      {/*
        El resto de la dirección, solo cuando ya hay calle elegida: antes no
        hay nada que completar, y enseñar seis campos vacíos desde el principio
        hace parecer que el formulario pide dos direcciones.

        En dos filas y por tamaños: el número y el código postal son cortos y
        obligatorios, y la escalera, el piso y la puerta van debajo porque
        muchos edificios no los tienen.
      */}
      {onDetailChange && detail && value !== null && (
        <View style={styles.detail} testID={testID ? `${testID}-detail` : undefined}>
          <View style={styles.detailRow}>
            <View style={styles.detailNumber}>
              <Text style={styles.detailLabel}>Número</Text>
              <Input
                value={detail.number}
                onChangeText={(number) => onDetailChange({ ...detail, number })}
                placeholder="14"
                placeholderTextColor="rgba(29, 31, 32, 0.62)"
                keyboardType="numbers-and-punctuation"
                editable={editable}
                testID={testID ? `${testID}-number` : undefined}
              />
            </View>

            <View style={styles.detailPostcode}>
              <Text style={styles.detailLabel}>Código postal</Text>
              <Input
                value={detail.postcode}
                /* Cinco dígitos: lo que no sea un dígito no llega a entrar */
                onChangeText={(postcode) =>
                  onDetailChange({
                    ...detail,
                    postcode: postcode.replace(/\D/g, '').slice(0, 5),
                  })
                }
                placeholder="28013"
                placeholderTextColor="rgba(29, 31, 32, 0.62)"
                keyboardType="number-pad"
                editable={editable}
                testID={testID ? `${testID}-postcode` : undefined}
              />
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailSmall}>
              <Text style={styles.detailLabel}>Escalera</Text>
              <Input
                value={detail.stair}
                onChangeText={(stair) => onDetailChange({ ...detail, stair })}
                placeholder="—"
                placeholderTextColor="rgba(29, 31, 32, 0.62)"
                editable={editable}
                testID={testID ? `${testID}-stair` : undefined}
              />
            </View>

            <View style={styles.detailSmall}>
              <Text style={styles.detailLabel}>Piso</Text>
              <Input
                value={detail.floor}
                onChangeText={(floor) => onDetailChange({ ...detail, floor })}
                placeholder="3"
                placeholderTextColor="rgba(29, 31, 32, 0.62)"
                editable={editable}
                testID={testID ? `${testID}-floor` : undefined}
              />
            </View>

            <View style={styles.detailSmall}>
              <Text style={styles.detailLabel}>Puerta</Text>
              <Input
                value={detail.door}
                onChangeText={(door) => onDetailChange({ ...detail, door })}
                placeholder="B"
                placeholderTextColor="rgba(29, 31, 32, 0.62)"
                editable={editable}
                testID={testID ? `${testID}-door` : undefined}
              />
            </View>
          </View>

          <Text style={styles.detailNote}>
            La escalera, el piso y la puerta son opcionales. El número no: sin
            él no hay portal al que ir.
          </Text>
        </View>
      )}
    </View>
  )
}
