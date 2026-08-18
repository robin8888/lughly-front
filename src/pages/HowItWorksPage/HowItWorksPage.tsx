/**
 * HowItWorksPage
 * "Cómo funciona", explicado para el cliente.
 *
 * Recoge lo que antes iba suelto por la home: los tres pasos y la regla de la
 * subasta inversa ocupaban dos secciones de la pantalla principal, y el
 * titular y el párrafo de arriba salen del hero. Eran textos para explicarse
 * a quien no conoce la app, repartidos por la pantalla de alguien que ya ha
 * entrado; aquí se cuentan seguidos y en su sitio, y la home se queda para
 * hacer cosas.
 *
 * No hay contenido nuevo: es el mismo que ya estaba, mudado.
 */

import { View, Text, Pressable } from 'react-native'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { ReverseAuctionCard } from '@/components/organisms/ReverseAuctionCard'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { styles } from './HowItWorksPage.styles'

export interface HowItWorksPageProps {
  onBack: () => void
  /** Publicar un trabajo: el final natural de haber leído esto */
  onPublish: () => void
  testID?: string
}

export function HowItWorksPage({
  onBack,
  onPublish,
  testID,
}: HowItWorksPageProps) {
  const onScroll = useNavScrollHandler()

  return (
    <SafeAreaView style={styles.screen} testID={testID ?? 'how-it-works-page'}>
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          testID="how-it-works-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Cómo funciona</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            Encuentra al profesional de confianza.
          </Text>
          <Text style={styles.introBody}>
            Publica tu trabajo, recibe pujas de profesionales valorados y
            adjudica tú mismo comparando precio, plazo y reputación.
          </Text>
        </View>

        <HowItWorks testID="how-it-works-steps" />

        <ReverseAuctionCard
          onPublish={onPublish}
          testID="how-it-works-auction"
        />
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
