/**
 * HomePage
 * Home del cliente (HOME_MOBILE.md).
 *
 * Solo compone organismos: cero estilos de contenido aquí.
 *
 * **Adelgazada el 18 Agosto 2026.** Tenía cinco secciones numeradas y cuatro
 * eran folleto: los tres pasos, la regla de la subasta inversa, una lista de
 * profesionales destacados con datos inventados y una tarjeta de cierre
 * invitando a publicar. Quien abre la home ya está dentro y viene a hacer
 * algo, no a que le expliquen el producto otra vez.
 *
 * Lo explicativo se mudó entero a la pantalla "Cómo funciona", que ocupa
 * ahora el botón secundario del hero: estaba "Ver profesionales", y era el
 * tercer camino al directorio después de la pestaña de la barra y del
 * buscador de oficios. Los destacados se retiraron sin sustituto:
 * eran tres personas escritas a mano en el código, y enseñar profesionales de
 * mentira en la portada no es un adelanto de nada. Y el cierre repetía un
 * destino —publicar— que es una pestaña fija de la barra de abajo, siempre
 * visible: gastaba el final de la pantalla en un atajo que nadie necesita.
 *
 * Queda lo que se usa: quién eres, el buscador, los oficios, y dos salidas
 * que no repiten a la barra de abajo —cómo funciona y la urgencia—.
 */

import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { API_BASE_URL } from '@/api'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { HeroCard } from '@/components/organisms/HeroCard'
import { TradesCarousel } from '@/components/organisms/TradesCarousel'
import type { TradeSlug } from '@/utils/trades'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePage.styles'

export interface HomePageProps {
  role: 'client' | 'pro'
  onUrgent: () => void
  onSelectTrade: (slug: TradeSlug) => void
  /**
   * Abre la pantalla que explica el modelo. Es el botón secundario del hero:
   * ocupó el sitio de "Ver profesionales", que era el tercer camino al
   * directorio y no hacía falta.
   */
  onHowItWorks: () => void
}

export function HomePage({
  role,
  onUrgent,
  onSelectTrade,
  onHowItWorks,
}: HomePageProps) {
  const isClient = role === 'client'
  // Al bajar el scroll, la barra inferior se encoge
  const onScroll = useNavScrollHandler()
  const user = useUser()

  return (
    <SafeAreaView style={styles.safeArea} testID="home-page">
      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <HeroCard
          role={role}
          variant="light"
          userName={user?.name}
          /*
           * `avatarUrl` llega como ruta relativa a la API, así que el prefijo
           * se pone aquí, igual que en Mi cuenta y en la home del profesional.
           */
          avatarUri={user?.avatarUrl ? `${API_BASE_URL}${user.avatarUrl}` : null}
          onSecondary={onHowItWorks}
          onUrgent={isClient ? onUrgent : undefined}
          onSelectTrade={isClient ? onSelectTrade : undefined}
          testID="home-hero"
        />

        <TradesCarousel onSelect={onSelectTrade} testID="home-carousel" />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
