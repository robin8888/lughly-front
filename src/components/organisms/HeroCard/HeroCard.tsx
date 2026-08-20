/**
 * HeroCard Organism
 * Cabecera de la home (HOME_MOBILE.md §2).
 *
 * Los dos roles comparten ahora la misma forma —logotipo, foto y nombre
 * centrados— y se diferencian en lo que cuelga debajo:
 *
 * - El profesional ve su ficha: oficio, ciudad y valoración. Entra todos los
 *   días a mirar cómo le va.
 * - El cliente ve por dónde empezar: el buscador de oficios y las dos salidas
 *   que no están ya en la barra de abajo, cómo funciona y la urgencia.
 *
 * Se quedó por el camino todo lo que era discurso de captación: el titular,
 * el párrafo explicativo y la etiqueta de "Nuevo · Subastas inversas". Eran
 * textos para convencer a quien no conoce la app, en la pantalla de alguien
 * que ya ha entrado. Lo que explicaban vive ahora en "Cómo funciona", donde
 * se puede contar entero.
 */

import { View, Text, Image } from 'react-native'
import { Avatar } from '@/components/atoms/Avatar'
import { Button } from '@/components/atoms/Button'
import { StarRating } from '@/components/atoms/StarRating'
import { InfoCard } from '@/components/molecules/InfoCard'
import { QuickSearch } from '@/components/molecules/QuickSearch'
import { images } from '@/images'
import type { TradeSlug } from '@/utils/trades'
import { palettes, styles, PROFILE_STAR_SIZE, type HeroVariant } from './HeroCard.styles'

/**
 * Lo único que queda distinto en palabras. El botón lleva a lo que cada uno no
 * tiene a un toque en la barra de abajo.
 */
const COPY = {
  /**
   * Decía "Ver profesionales" y llevaba al directorio, que es pestaña fija de
   * la barra —y adonde llevan además el buscador rápido y el carrusel, ya
   * filtrados por oficio—. Era el tercer camino al mismo sitio. Cómo funciona,
   * en cambio, no se alcanza desde ningún otro lado.
   */
  client: { secondary: 'Cómo funciona' },
  /**
   * Antes decía "Mi panel" y llevaba a la Cartera, que todavía es un "Pronto":
   * un callejón sin salida en el sitio más visible de su pantalla.
   */
  pro: { secondary: 'Mi agenda' },
} as const

/** Lo que se enseña bajo el nombre en la ficha del profesional */
export interface HeroProfile {
  tradeLabel?: string | null
  city?: string | null
  rating?: number | null
  reviewCount?: number | null
}

export interface HeroCardProps {
  role: 'client' | 'pro'
  /**
   * Nombre de quien ha entrado. No es decoración: es lo que distingue "una
   * app" de "mi app", y el sitio donde se comprueba de un vistazo con qué
   * cuenta se está trabajando cuando alguien tiene dos.
   */
  userName?: string | null
  /**
   * Foto de perfil. URI ya montada: el servidor la devuelve como ruta relativa
   * y el prefijo lo pone quien llama. Sin ella sale la reserva del avatar, que
   * también es una respuesta.
   */
  avatarUri?: string | null
  /**
   * Oficio, ciudad y valoración, solo en la home del profesional.
   *
   * Es opcional entero porque la cabecera se dibuja antes de que su ficha
   * termine de cargar: mientras tanto se ven la foto y el nombre, que ya salen
   * de la sesión, y el resto aparece cuando llega.
   */
  profile?: HeroProfile
  /**
   * Paleta de la tarjeta. Debe corresponderse con el fondo de la pantalla:
   * `dark` sobre fondo negro, `light` sobre el claro de la app. Por defecto la
   * del diseño original.
   */
  variant?: HeroVariant
  onSecondary: () => void
  /** Solo cliente */
  onUrgent?: () => void
  /** Solo cliente */
  onSelectTrade?: (slug: TradeSlug) => void
  testID?: string
}

export function HeroCard({
  role,
  userName,
  avatarUri,
  profile,
  variant = 'dark',
  onSecondary,
  onUrgent,
  onSelectTrade,
  testID,
}: HeroCardProps) {
  const isClient = role === 'client'
  const palette = palettes[variant]

  /**
   * Oficio y ciudad en una línea. Se monta filtrando en vez de encadenando
   * condiciones porque cualquiera de los dos puede faltar, y un " · " suelto
   * al principio o al final canta más que la línea entera ausente.
   */
  const identity = isClient
    ? ''
    : [profile?.tradeLabel, profile?.city].filter(Boolean).join(' · ')

  /*
   * El `!isClient` no sobra aunque `profile` sea "solo del profesional": la
   * prop es opcional y nada impedía pasársela a un cliente, que no tiene
   * oficio ni valoración que enseñar. Mejor que la condición esté aquí y no
   * en la confianza de quien lo use.
   */
  const hasRating =
    !isClient && profile?.rating != null && (profile.reviewCount ?? 0) > 0

  /*
   * Ya no hace falta pedir nada para que esta no lleve marco: desde el 20
   * Agosto 2026 ninguna tarjeta lo lleva. Antes había que quitárselo a mano,
   * porque esta no es una tarjeta dentro de la pantalla sino su cabecera, y
   * enmarcarla la convertía en un recuadro pegado arriba.
   */
  return (
    <InfoCard variant={variant} style={styles.card} testID={testID}>
      {/*
        El logotipo en lugar del nombre escrito. No lleva color de paleta: las
        letras son blancas pero el contorno es navy oscuro, así que se lee
        igual sobre la tarjeta clara que sobre la negra.
      */}
      <Image
        source={images.wordmark}
        style={styles.brand}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Lughly"
        testID="hero-brand"
      />

      <View style={styles.profile}>
        <Avatar uri={avatarUri} size={88} testID="hero-avatar" />

        {userName ? (
          <Text style={[styles.userName, palette.userName]} numberOfLines={2}>
            {userName}
          </Text>
        ) : null}

        {identity ? (
          <Text
            style={[styles.profileMeta, palette.body]}
            numberOfLines={1}
            testID="hero-profile-identity"
          >
            {identity}
          </Text>
        ) : null}

        {hasRating ? (
          <View style={styles.profileRating} testID="hero-profile-rating">
            <StarRating rating={profile.rating!} size={PROFILE_STAR_SIZE} />
            <Text style={[styles.profileRatingText, palette.body]}>
              {profile.rating!.toFixed(1)} · {profile.reviewCount}{' '}
              {profile.reviewCount === 1 ? 'valoración' : 'valoraciones'}
            </Text>
          </View>
        ) : null}
      </View>

      {isClient && onSelectTrade && (
        <QuickSearch onSelect={onSelectTrade} testID="quick-search" />
      )}

      {/*
        Los dos roles no llevan el mismo botón. Al cliente le va relleno: es
        lo único que le queda ahí y no compite con nada. Al profesional le va
        hueco, porque debajo no hay nada que destaque más y un botón sólido en
        mitad de su ficha pesaría de más.
      */}
      {isClient ? (
        <Button
          variant="primary"
          fullWidth
          onPress={onSecondary}
          textStyle={styles.actionText}
          testID="hero-secondary"
        >
          {COPY.client.secondary}
        </Button>
      ) : (
        <Button
          variant="secondary"
          fullWidth
          onPress={onSecondary}
          style={[styles.actionSecondary, palette.actionSecondary]}
          textStyle={[styles.actionSecondaryText, palette.actionSecondaryText]}
          testID="hero-secondary"
        >
          {COPY.pro.secondary}
        </Button>
      )}

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
