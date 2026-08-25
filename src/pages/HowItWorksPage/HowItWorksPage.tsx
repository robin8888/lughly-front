/**
 * HowItWorksPage
 * "Cómo funciona", explicado para el cliente.
 *
 * Recoge lo que antes iba suelto por la home: los tres pasos ocupaban una
 * sección de la pantalla principal, y el titular y el párrafo de arriba
 * salen del hero. Eran textos para explicarse a quien no conoce la app,
 * repartidos por la pantalla de alguien que ya ha entrado; aquí se cuentan
 * seguidos y en su sitio, y la home se queda para hacer cosas.
 */

import { View, Text, Pressable } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Animated from 'react-native-reanimated'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/atoms/Button'
import { HowItWorks } from '@/components/organisms/HowItWorks'
import { useNavScrollHandler } from '@/hooks/ui/useCompactNav'
import { styles } from './HowItWorksPage.styles'

export interface HowItWorksPageProps {
  onBack: () => void
  /** Ir al directorio: el final natural de haber leído esto */
  onBrowse: () => void
  testID?: string
}

export function HowItWorksPage({
  onBack,
  onBrowse,
  testID,
}: HowItWorksPageProps) {
  const onScroll = useNavScrollHandler()

  return (
    <SafeAreaView
      style={styles.screen}
      /*
        Sin el borde de arriba: la cabecera azul marino tiene que llegar hasta
        el filo, como en las otras veintisiete pantallas, y el hueco del
        sistema se lo reserva ella con su propio `paddingTop`. Con el borde
        puesto quedaba una franja blanca encima del azul y la hora, en claro,
        desaparecía dentro de ella.
      */
      edges={['bottom', 'left', 'right']}
      testID={testID ?? 'how-it-works-page'}
    >
      <View style={styles.header}>
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
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
            Busca en el directorio, compara valoraciones y encárgale el
            trabajo por hora, a tarifa cerrada o pidiendo presupuesto.
          </Text>
        </View>

        <HowItWorks testID="how-it-works-steps" />

        <Button
          fullWidth
          onPress={onBrowse}
          style={styles.browse}
          testID="how-it-works-browse"
        >
          Buscar un profesional
        </Button>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}
