/**
 * ClientHero Organism
 * Cabecera de la home del cliente (25 Agosto 2026).
 *
 * Sustituye al `HeroCard` en modo cliente. El `HeroCard` sigue vivo: lo usa
 * la home del profesional, que entra a diario a mirar su ficha y necesita
 * justo lo contrario que un cliente —foto grande, oficio, valoración—.
 *
 * Aquí la marca ocupa una franja y no un tercio de pantalla: el cliente ya
 * está dentro y viene a encontrar a alguien, no a que le presenten la app.
 * Todo lo que hacía la cabecera anterior sigue estando —logotipo, foto,
 * nombre, buscador de oficios, urgencia y cómo funciona—, pero en 260 px
 * menos.
 *
 * El navy no es decoración: es el único bloque de color fuerte de la
 * pantalla, y sirve para que el buscador —lo primero que hay que hacer aquí—
 * se despegue sobre él en blanco.
 */

import { View, Text, Image, Pressable } from 'react-native'
import { Button } from '@/components/atoms/Button'
import { Icon } from '@/components/atoms/Icon'
import { QuickSearch } from '@/components/molecules/QuickSearch'
import { images } from '@/images'
import { theme } from '@/theme'
import type { TradeSlug } from '@/utils/trades'
import { styles } from './ClientHero.styles'

export interface ClientHeroProps {
  userName?: string
  /** Ya con el prefijo de la API puesto por quien llama */
  avatarUri?: string | null
  onSelectTrade: (slug: TradeSlug) => void
  onUrgent: () => void
  onHowItWorks: () => void
  onMessages: () => void
  testID?: string
}

export function ClientHero({
  userName,
  avatarUri,
  onSelectTrade,
  onUrgent,
  onHowItWorks,
  onMessages,
  testID,
}: ClientHeroProps) {
  /**
   * Sin nombre se saluda igual, sin coma colgando. Pasa entre que se abre la
   * app y responde `/v1/auth/me`, y un "Hola," suelto se ve descuidado.
   */
  const saludo = userName ? `Hola, ${userName.split(' ')[0]}` : 'Hola'

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.topRow}>
        <Image
          source={images.wordmark}
          style={styles.brand}
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Lughly"
        />

        <View style={styles.topActions}>
          <Pressable
            onPress={onMessages}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Mensajes"
            testID="client-hero-messages"
          >
            <Icon name="message" size={20} color="#ffffff" />
          </Pressable>

          {/*
            La foto no abre nada: Mi cuenta es una pestaña de la barra de
            abajo, siempre visible. Un segundo camino al mismo sitio, aquí
            arriba, solo confunde sobre dónde vive cada cosa.
          */}
          <View style={styles.avatarRing}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarEmpty]}>
                <Icon name="user-circle" size={22} color={theme.colors.accent300} />
              </View>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.greeting} numberOfLines={1}>
        {saludo}
      </Text>
      <Text style={styles.subtitle}>
        Dinos qué necesitas y buscamos a quien lo hace
      </Text>

      <View style={styles.search}>
        <QuickSearch onSelect={onSelectTrade} testID="quick-search" />
      </View>

      <View style={styles.actions}>
        <Button
          onPress={onUrgent}
          style={styles.urgent}
          pressedStyle={styles.urgentPressed}
          textStyle={styles.urgentText}
          testID="client-hero-urgent"
        >
          Es urgente
        </Button>

        <Button
          variant="secondary"
          onPress={onHowItWorks}
          style={styles.howItWorks}
          textStyle={styles.howItWorksText}
          testID="client-hero-how"
        >
          Cómo funciona
        </Button>
      </View>
    </View>
  )
}
