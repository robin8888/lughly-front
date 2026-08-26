/**
 * ClientHero Organism
 * Cabecera de la home del cliente (25 Agosto 2026).
 *
 * Sustituye al `HeroCard` en modo cliente. El `HeroCard` sigue vivo: lo usa
 * la home del profesional, que entra a diario a mirar su ficha y necesita
 * justo lo contrario que un cliente —foto grande, oficio, valoración—.
 *
 * La foto va centrada y grande, con el saludo debajo, en las mismas medidas
 * que Mi cuenta: es la misma foto de la misma persona, y dos tamaños distintos
 * en dos pantallas seguidas se leen como dos cosas distintas. Estuvo arriba a
 * la derecha del tamaño de un icono, haciendo pareja con el botón de mensajes,
 * y ahí era un adorno de la barra en vez de la cabecera de su pantalla.
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
import { BADGE_MAX } from '@/components/molecules/MessagesFab'
import { Sparkles } from '@/components/atoms/Sparkles'
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
  /**
   * Mensajes sin leer, para la chapa del icono de mensajes.
   *
   * Aquí y no en un botón flotante como en la home del profesional: el cliente
   * llega a sus mensajes por este icono, y meterle además un botón flotante
   * sería un segundo camino al mismo sitio. La señal va donde ya se pulsa.
   */
  unreadMessages?: number
  testID?: string
}

export function ClientHero({
  userName,
  avatarUri,
  onSelectTrade,
  onUrgent,
  onHowItWorks,
  onMessages,
  unreadMessages = 0,
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
            style={[styles.iconButton, styles.iconButtonChat]}
            accessibilityRole="button"
            /*
              La cifra va en la etiqueta y no solo en la chapa: un lector de
              pantalla no ve el círculo rojo, y "Mensajes" a secas no diría lo
              único que ha cambiado en el botón.
            */
            accessibilityLabel={
              unreadMessages > 0
                ? `Mensajes, ${unreadMessages} sin leer`
                : 'Mensajes'
            }
            testID="client-hero-messages"
          >
            <Icon name="message" size={20} color="#ffffff" />

            {/*
              Las chispas salen del anillo y no paran: no señalan un suceso,
              señalan un sitio. Una animación que ocurre al entrar se la pierde
              quien estaba mirando otra cosa, que es justo a quien hay que
              enseñarle dónde se le contesta.
            */}
            <Sparkles testID="client-hero-messages-sparkles" />

            {unreadMessages > 0 && (
              <View
                style={styles.badge}
                /* Ya lo dice la etiqueta del botón; si no, se leería dos veces */
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                testID="client-hero-messages-badge"
              >
                <Text style={styles.badgeText} numberOfLines={1}>
                  {unreadMessages > BADGE_MAX ? `${BADGE_MAX}+` : unreadMessages}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/*
        La foto y el saludo, centrados y en bloque.
        
        La foto no abre nada: Mi cuenta es una pestaña de la barra de abajo,
        siempre visible. Un segundo camino al mismo sitio, aquí arriba, solo
        confunde sobre dónde vive cada cosa.
      */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatarRing}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Icon name="user-circle" size={46} color={theme.colors.accent300} />
            </View>
          )}
        </View>

        <Text style={styles.greeting} numberOfLines={1}>
          {saludo}
        </Text>
        <Text style={styles.subtitle}>
          Dinos qué necesitas y buscamos a quien lo hace
        </Text>
      </View>

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
