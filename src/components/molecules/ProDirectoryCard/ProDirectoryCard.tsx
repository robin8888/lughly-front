/**
 * ProDirectoryCard Molecule
 * Tarjeta del directorio, según MobileApp.dc.html (isProfesionales).
 *
 * Más completa que la de la home: incluye distancia, distintivo de
 * disponibilidad y tarifa destacada, que es lo que el cliente compara.
 *
 * Cuando el profesional trabaja para alguien, la tarjeta la encabeza el
 * empleador y el trabajador va debajo. No es un detalle de maquetación: a
 * quien se contrata es a la empresa —es quien pone el precio, quien factura
 * y quien responde—, y el trabajador es quien irá a la casa. Poner el nombre
 * del trabajador arriba haría pensar que se contrata a un autónomo.
 */

import { View, Text, Pressable, Image } from 'react-native'
import { InfoCard } from '@/components/molecules/InfoCard'
import { Icon } from '@/components/atoms/Icon'
import { API_BASE_URL } from '@/api'
import type { ApiPro } from '@/api/pros.api'
import { theme } from '@/theme'
import { styles } from './ProDirectoryCard.styles'

export interface ProDirectoryCardProps {
  pro: ApiPro
  onPress: () => void
  testID?: string
}

export function ProDirectoryCard({ pro, onPress, testID }: ProDirectoryCardProps) {
  const otherTrades = pro.trades.filter((trade) => trade.slug !== pro.trade)

  return (
    <Pressable onPress={onPress} testID={testID} accessibilityRole="button">
      <InfoCard>
        <View style={styles.row}>
          <View style={styles.avatar}>
            {pro.avatarUrl ? (
              <Image
                source={{ uri: `${API_BASE_URL}${pro.avatarUrl}` }}
                style={styles.avatarImage}
              />
            ) : (
              <Icon name="user-circle" size={22} color={theme.colors.accent} />
            )}
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
              <Text style={styles.distance}>
                A {pro.distanceKm} km de ti
              </Text>
            )}

            {pro.availableNow ? (
              <View style={[styles.badge, styles.badgeAvailable]}>
                <View style={[styles.dot, styles.dotAvailable]} />
                <Text style={styles.badgeAvailableText}>Disponible ahora</Text>
              </View>
            ) : (
              <View style={styles.badge}>
                <View style={styles.dot} />
                <Text style={styles.badgeText}>Consultar disponibilidad</Text>
              </View>
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

        {pro.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {pro.bio}
          </Text>
        )}

        {/**
         * Los demás oficios que ejerce, con su precio. El de la cabecera ya
         * está dicho arriba, así que repetirlo sería ruido; los otros
         * importan porque el cliente que busca limpieza puede necesitar
         * además quien le cuide al perro.
         *
         * Va con la palabra "También" por delante y no como etiquetas
         * sueltas: mezclado con el distintivo de identidad verificada, un
         * "Carpintería" a secas se lee como una insignia más y no como "esta
         * persona además hace carpintería".
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
      </InfoCard>
    </Pressable>
  )
}
