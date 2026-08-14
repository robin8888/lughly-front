/**
 * HeroCard Organism
 * Cabecera de la home (HOME_MOBILE.md §2).
 *
 * Los textos y los botones cambian según el rol: el cliente busca
 * profesional, el profesional busca trabajo. Es la misma pantalla con
 * dos discursos, y por eso el rol se recibe como prop y no se decide aquí.
 */

import { View, Text } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { InfoCard } from '@/components/molecules/InfoCard'
import { QuickSearch } from '@/components/molecules/QuickSearch'
import type { TradeSlug } from '@/utils/trades'
import { palettes, styles, type HeroVariant } from './HeroCard.styles'

const COPY = {
  client: {
    title: 'Encuentra al profesional de confianza.',
    body: 'Publica tu trabajo, recibe pujas de profesionales valorados y adjudica tú mismo comparando precio, plazo y reputación.',
    primary: 'Publicar un trabajo',
    secondary: 'Ver profesionales',
  },
  pro: {
    title: 'Encuentra tu próximo trabajo.',
    body: 'Puja por los trabajos publicados cerca de ti, acepta reservas instantáneas y cobra con pago protegido.',
    // El diseño decía "Ver trabajos disponibles", pero no cabe en media fila
    // sin partirse en dos líneas. "Ver trabajos" dice lo mismo y cabe.
    primary: 'Ver trabajos',
    secondary: 'Mi panel',
  },
} as const

export interface HeroCardProps {
  role: 'client' | 'pro'
  /**
   * Paleta de la tarjeta. Debe corresponderse con el fondo de la pantalla:
   * `dark` sobre la home negra del cliente, `light` sobre la home clara del
   * profesional. Por defecto la del diseño original.
   */
  variant?: HeroVariant
  onPrimary: () => void
  onSecondary: () => void
  /** Solo cliente */
  onUrgent?: () => void
  /** Solo cliente */
  onSelectTrade?: (slug: TradeSlug) => void
  testID?: string
}

export function HeroCard({
  role,
  variant = 'dark',
  onPrimary,
  onSecondary,
  onUrgent,
  onSelectTrade,
  testID,
}: HeroCardProps) {
  const copy = COPY[role]
  const isClient = role === 'client'
  const palette = palettes[variant]

  return (
    <InfoCard variant={variant} style={styles.card} testID={testID}>
      <Text style={[styles.brand, palette.brand]}>Lughly</Text>

      <View style={[styles.tag, palette.tag]}>
        <Text style={[styles.tagText, palette.tagText]}>
          Nuevo · Subastas inversas con pago protegido
        </Text>
      </View>

      <Text style={[styles.title, palette.title]}>{copy.title}</Text>
      <Text style={[styles.body, palette.body]}>{copy.body}</Text>

      {isClient && onSelectTrade && (
        <QuickSearch onSelect={onSelectTrade} testID="quick-search" />
      )}

      <View style={styles.actions}>
        <Button
          onPress={onPrimary}
          style={styles.action}
          textStyle={styles.actionText}
          testID="hero-primary"
        >
          {copy.primary}
        </Button>
        <Button
          variant="secondary"
          onPress={onSecondary}
          style={[styles.actionSecondary, palette.actionSecondary]}
          textStyle={[styles.actionSecondaryText, palette.actionSecondaryText]}
          testID="hero-secondary"
        >
          {copy.secondary}
        </Button>
      </View>

      {isClient && onUrgent && (
        <Button
          fullWidth
          onPress={onUrgent}
          style={styles.urgent}
          textStyle={styles.actionText}
          testID="hero-urgent"
        >
          Lo necesito urgente
        </Button>
      )}
    </InfoCard>
  )
}
