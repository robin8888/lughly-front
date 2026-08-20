/**
 * ProFeedCard — PROPUESTA, 20 Agosto 2026.
 *
 * La misma tarjeta del directorio contada como una publicación de red social.
 * Convive con `ProDirectoryCard`, que es la de ahora, para poder verlas al
 * lado. Si se adopta, esta sustituye a aquella.
 *
 * ## Qué cambia respecto a la actual, y por qué
 *
 * - **Una foto grande en vez de cuatro pequeñas.** En oficios se decide
 *   mirando, y una tira de miniaturas de 60 px no deja ver un baño terminado.
 *   Las demás se dicen con un "+3" encima, que además invita a entrar.
 * - **La cara primero y grande.** Avatar de 52 en vez de 40: es un mercado de
 *   personas, y la foto de quien va a entrar en tu casa importa más que
 *   cualquier dato de la ficha.
 * - **Los números dejan de ir en columna a la derecha.** Ahí competían los
 *   tres —tarifa, nota y reseñas— y ganaba el que más grande estuviera. Ahora
 *   la nota acompaña al nombre y **el precio va abajo, junto a la acción**,
 *   que es el orden en que se decide: quién es, qué ha hecho, cuánto cuesta.
 * - **Una sola acción, en azul.** La tarjeta entera sigue siendo pulsable,
 *   pero el botón dice a dónde lleva.
 *
 * Lo que **no** cambia es la regla de la empresa: cuando el profesional
 * trabaja para alguien, la tarjeta la encabeza el empleador y el trabajador va
 * debajo. A quien se contrata es a la empresa.
 */

import { View, Text, Pressable, Image } from 'react-native'
import { Icon } from '@/components/atoms/Icon'
import { API_BASE_URL } from '@/api'
import type { ApiPro } from '@/api/pros.api'
import { feed } from '@/theme/feed'
import { styles } from './ProFeedCard.styles'

export interface ProFeedCardProps {
  pro: ApiPro
  onPress: () => void
  testID?: string
}

export function ProFeedCard({ pro, onPress, testID }: ProFeedCardProps) {
  const otherTrades = pro.trades.filter((trade) => trade.slug !== pro.trade)
  const cover = pro.photos[0]
  const extraPhotos = pro.photos.length - 1

  /**
   * La línea de debajo del nombre, con lo que sitúa: qué hace, dónde, y a qué
   * distancia. Se compone aquí y no en la plantilla para que los separadores
   * no queden sueltos cuando falta alguna pieza —"Fontanero · · Madrid"—.
   */
  const meta = [
    pro.tradeLabel,
    pro.city,
    pro.distanceKm !== null ? `a ${pro.distanceKm} km` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ')

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.head}>
        <View style={styles.avatar}>
          {pro.avatarUrl ? (
            <Image
              source={{ uri: `${API_BASE_URL}${pro.avatarUrl}` }}
              style={styles.avatarImage}
            />
          ) : (
            <Icon name="user-circle" size={26} color={feed.colors.textSoft} />
          )}
        </View>

        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {pro.employerName ?? pro.name}
            </Text>

            {/*
              El verificado, un punto azul con su marca al lado del nombre.
              Antes era una etiqueta al pie de la tarjeta, donde se leía como
              una más entre los oficios; junto al nombre es lo que es: quién
              responde de esta persona.
            */}
            {pro.verified && (
              <View style={styles.verified}>
                <Text style={styles.verifiedMark}>✓</Text>
              </View>
            )}
          </View>

          {pro.employerName && (
            <Text style={styles.worker} numberOfLines={1}>
              Trabajo de {pro.name}
            </Text>
          )}

          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        </View>

        <View style={styles.rating}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingValue}>{pro.rating.toFixed(1)}</Text>
        </View>
      </View>

      {pro.availableNow && (
        <View style={styles.available}>
          <View style={styles.availableDot} />
          <Text style={styles.availableText}>Disponible ahora</Text>
        </View>
      )}

      {/*
        La foto manda: ocupa el ancho entero y va en 16:9. Sin fotos no se
        dibuja ningún hueco —un placeholder gris haría parecer la ficha
        incompleta a quien simplemente no las tenía a mano al registrarse—.
      */}
      {cover && (
        <View style={styles.cover} testID="pro-feed-cover">
          <Image
            source={{ uri: `${API_BASE_URL}${cover}` }}
            style={styles.coverImage}
            resizeMode="cover"
          />

          {extraPhotos > 0 && (
            <View style={styles.coverMore}>
              <Text style={styles.coverMoreText}>+{extraPhotos}</Text>
            </View>
          )}
        </View>
      )}

      {pro.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {pro.bio}
        </Text>
      )}

      {otherTrades.length > 0 && (
        <View style={styles.chips}>
          {otherTrades.slice(0, 3).map((trade) => (
            <View key={trade.slug} style={styles.chip}>
              <Text style={styles.chipText}>
                {trade.label} · {trade.hourlyRate} €/h
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.foot}>
        <View>
          <Text style={styles.rate}>{pro.hourlyRate} €/h</Text>
          <Text style={styles.reviews}>
            {pro.reviewCount === 0
              ? 'Sin reseñas todavía'
              : `${pro.reviewCount} reseñas`}
          </Text>
        </View>

        <View style={styles.action}>
          <Text style={styles.actionText}>Ver perfil</Text>
        </View>
      </View>
    </Pressable>
  )
}
