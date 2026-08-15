/**
 * HomePage
 * Home de la app móvil (HOME_MOBILE.md).
 *
 * Solo compone organismos: cero estilos sueltos aquí. El orden de las
 * secciones es el del documento y no debe alterarse.
 */

import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { HeroCard } from '@/components/organisms/HeroCard'
import { TradesCarousel } from '@/components/organisms/TradesCarousel'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { ReverseAuctionCard } from '@/components/organisms/ReverseAuctionCard'
import { FeaturedPros } from '@/components/organisms/FeaturedPros'
import { StartCard } from '@/components/organisms/StartCard'
import type { TradeSlug } from '@/utils/trades'
import { useUser } from '@/stores/useAuthStore'
import { styles } from './HomePage.styles'

export interface HomePageProps {
  role: 'client' | 'pro'
  onPrimary: () => void
  onSecondary: () => void
  onUrgent: () => void
  onSelectTrade: (slug: TradeSlug) => void
  onSelectPro: () => void
}

export function HomePage({
  role,
  onPrimary,
  onSecondary,
  onUrgent,
  onSelectTrade,
  onSelectPro,
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
          onPrimary={onPrimary}
          onSecondary={onSecondary}
          onUrgent={isClient ? onUrgent : undefined}
          onSelectTrade={isClient ? onSelectTrade : undefined}
          testID="home-hero"
        />

        <TradesCarousel onSelect={onSelectTrade} testID="home-carousel" />

        <HowItWorks testID="home-how" />

        <ReverseAuctionCard onPublish={onPrimary} testID="home-auction" />

        <FeaturedPros onSelectPro={onSelectPro} testID="home-featured" />

        <StartCard role={role} onPress={onPrimary} testID="home-start" />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
