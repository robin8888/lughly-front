/**
 * ProFeedCard — PROPUESTA, 20 Agosto 2026.
 *
 * La tarjeta del directorio con el aspecto nuevo y **la organización de
 * siempre**: la misma que `ProDirectoryCard`, pieza por pieza y en el mismo
 * orden. Lo único que cambia es cómo se ve.
 *
 * Ese reparto ya estaba pensado y funciona: la identidad a la izquierda, los
 * números en columna a la derecha —tarifa, nota y reseñas, que es lo que el
 * cliente compara de un vistazo entre una tarjeta y la siguiente—, y debajo la
 * tira de fotos, la descripción, los demás oficios y el distintivo.
 *
 * **Sin botón.** La tarjeta entera lleva al perfil, así que un "Ver perfil"
 * dentro solo repite lo que ya hace tocarla y roba sitio a lo que se compara.
 *
 * Lo que sí cambia respecto a la actual:
 *
 * - Tarjeta blanca, redondeada y **sin marco ni cuadrícula**; se separa de la
 *   siguiente por aire y una sombra muy baja.
 * - **Nada en mayúsculas**: el nombre en caja alta se leía como un rótulo.
 * - Fotos con las esquinas redondeadas, como todo lo demás.
 * - El azul vivo de la mascota en la tarifa y en el distintivo.
 * - **La disponibilidad, en un anillo alrededor de la cara** —verde si atiende
 *   ahora, rojo si no— en vez de en una píldora con texto debajo del nombre.
 *   Se lee antes, porque la mirada ya está en la foto, y devuelve dos líneas
 *   de alto a la tarjeta.
 *
 * Se mantiene la regla de la empresa: cuando el profesional trabaja para
 * alguien, la tarjeta la encabeza el empleador y el trabajador va debajo. A
 * quien se contrata es a la empresa.
 */

import { View, Text, Pressable, Image } from 'react-native'
import { Icon } from '@/components/atoms/Icon'
import { API_BASE_URL } from '@/api'
import type { ApiPro } from '@/api/pros.api'
import { feed } from '@/theme/feed'
import { styles } from './ProFeedCard.styles'

/**
 * Cuántas fotos caben en la tira sin que la tarjeta crezca de más. Cuatro
 * entran a lo ancho de un móvil normal; la quinta se resume en un "+1".
 */
const MAX_STRIP = 4

export interface ProFeedCardProps {
  pro: ApiPro
  onPress: () => void
  testID?: string
}

export function ProFeedCard({ pro, onPress, testID }: ProFeedCardProps) {
  const otherTrades = pro.trades.filter((trade) => trade.slug !== pro.trade)

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.row}>
        {/*
          El estado va en un anillo alrededor de la cara: verde si atiende
          urgencias ahora mismo, rojo si no. Ocupa el sitio de la píldora que
          había debajo del nombre y se lee antes, porque la mirada ya está en
          la foto.

          El texto no desaparece del todo: viaja en la etiqueta de
          accesibilidad, porque un color por sí solo no dice nada a quien no lo
          distingue ni a quien escucha la pantalla.
        */}
        <View
          style={[
            styles.avatarRing,
            pro.availableNow ? styles.ringAvailable : styles.ringUnavailable,
          ]}
          accessible
          accessibilityLabel={
            pro.availableNow ? 'Disponible ahora' : 'Consultar disponibilidad'
          }
          testID={
            pro.availableNow ? 'pro-feed-available' : 'pro-feed-unavailable'
          }
        >
          <View style={styles.avatar}>
            {pro.avatarUrl ? (
              <Image
                source={{ uri: `${API_BASE_URL}${pro.avatarUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="user-circle" size={22} color={feed.colors.textSoft} />
            )}
          </View>
        </View>

        <View style={styles.identity}>
          {pro.employerName ? (
            <>
              <Text style={styles.name} numberOfLines={1}>
                {pro.employerName}
              </Text>
              <Text style={styles.worker} numberOfLines={1}>
                Trabajo de {pro.name}
              </Text>
            </>
          ) : (
            <Text style={styles.name} numberOfLines={1}>
              {pro.name}
            </Text>
          )}

          <Text style={styles.meta} numberOfLines={1}>
            {pro.tradeLabel} · {pro.city}
          </Text>

          {pro.distanceKm !== null && (
            <Text style={styles.distance}>A {pro.distanceKm} km de ti</Text>
          )}
        </View>

        <View style={styles.numbers}>
          <Text style={styles.rate}>{pro.hourlyRate} €/h</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{pro.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.reviews}>{pro.reviewCount} reseñas</Text>
        </View>
      </View>

      {/*
        Las fotos de sus trabajos, en tira. Van antes de la descripción a
        propósito: en oficios se decide mirando, y un baño terminado convence
        más que dos líneas de texto.

        Sin ninguna, el bloque entero no se dibuja —ni tira ni hueco esperando—.
        Un placeholder haría parecer la ficha incompleta, y quien se registra
        sin las fotos a mano no lo está.
      */}
      {pro.photos.length > 0 && (
        <View style={styles.photos} testID="pro-feed-photos">
          {pro.photos.slice(0, MAX_STRIP).map((photo) => (
            <Image
              key={photo}
              source={{ uri: `${API_BASE_URL}${photo}` }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}

          {/*
            Si tiene más de las que caben, se dice cuántas en vez de cortarlas
            sin avisar: así se sabe que en la ficha hay más.
          */}
          {pro.photos.length > MAX_STRIP && (
            <View style={[styles.photo, styles.photoMore]}>
              <Text style={styles.photoMoreText}>
                +{pro.photos.length - MAX_STRIP}
              </Text>
            </View>
          )}
        </View>
      )}

      {pro.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {pro.bio}
        </Text>
      )}

      {/*
        Los demás oficios que ejerce, con su precio. Van con "También" por
        delante y no como etiquetas sueltas: mezclado con el distintivo de
        identidad verificada, un "Carpintería" a secas se lee como una insignia
        más y no como "esta persona además hace carpintería".
      */}
      {otherTrades.length > 0 && (
        <Text style={styles.alsoDoes} numberOfLines={2}>
          También:{' '}
          {otherTrades
            .map((trade) => `${trade.label} ${trade.hourlyRate} €/h`)
            .join(' · ')}
        </Text>
      )}

      {pro.verified && (
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Identidad verificada</Text>
          </View>
        </View>
      )}
    </Pressable>
  )
}
