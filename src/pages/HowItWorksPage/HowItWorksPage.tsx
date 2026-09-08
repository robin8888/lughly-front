/**
 * HowItWorksPage
 * «Cómo funciona», **como un recorrido**: una pantalla por paso, con su
 * imagen, su explicación y un botón de siguiente.
 *
 * Así lo pidió Robin el 7 de septiembre de 2026, y el cambio no es de forma.
 * Antes era una página de leer de corrido —tres tarjetas y un botón— y una
 * página de leer no se lee: se baja de un scroll. Un paso por pantalla obliga
 * a pasar página, que es lo único que hace que alguien llegue al final.
 *
 * **Y son dos recorridos**: al cliente se le cuenta cómo se contrata y al
 * profesional cómo se trabaja. Cuál toca lo decide la cuenta (`useEffectiveRole`
 * en la ruta), no una pestaña: quien entra ya sabe quién es.
 *
 * El botón de volver de la cabecera retrocede un paso y solo sale de la
 * pantalla en el primero. Es lo que espera cualquiera que haya pasado tres
 * páginas: si saliera del todo, volver a mirar el paso anterior costaría
 * empezar otra vez.
 */

import { useState } from 'react'
import { View, Text, Pressable, Image } from 'react-native'
import { StatusBar } from 'expo-status-bar'
// El de `react-native` está deprecado; este además respeta el notch en Android
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/atoms/Button'
import { images } from '@/images'
import { stepsFor } from './steps'
import { styles } from './HowItWorksPage.styles'

export interface HowItWorksPageProps {
  /** Qué recorrido toca. Lo decide la cuenta, no la pantalla. */
  role: 'client' | 'pro'
  onBack: () => void
  /**
   * El final del recorrido: el directorio para el cliente, sus encargos para
   * el profesional. Lo pone quien llama porque es una pantalla de cada rol y
   * esta no sabe navegar.
   */
  onFinish: () => void
  testID?: string
}

export function HowItWorksPage({
  role,
  onBack,
  onFinish,
  testID,
}: HowItWorksPageProps) {
  const steps = stepsFor(role)
  const [index, setIndex] = useState(0)

  const step = steps[index]!
  const isLast = index === steps.length - 1

  /* Atrás retrocede un paso, y solo sale de la pantalla en el primero */
  const goBack = () => (index === 0 ? onBack() : setIndex(index - 1))

  return (
    <SafeAreaView
      style={styles.screen}
      /*
        Sin el borde de arriba: la cabecera azul marino tiene que llegar hasta
        el filo, como en las otras veintisiete pantallas, y el hueco del
        sistema se lo reserva ella con su propio `paddingTop`.
      */
      edges={['bottom', 'left', 'right']}
      testID={testID ?? 'how-it-works-page'}
    >
      <View style={styles.header}>
        {/* La cabecera ocupa también la franja del sistema: la hora, en claro */}
        <StatusBar style="light" />
        <Pressable
          onPress={goBack}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={index === 0 ? 'Volver' : 'Paso anterior'}
          testID="how-it-works-back"
        >
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.title}>Cómo funciona</Text>
        {/*
          En qué paso va, con números y no solo con puntos: los puntos dicen
          "vas por la mitad" y el número dice cuánto queda, que es lo que
          decide si alguien sigue o se sale.
        */}
        <Text style={styles.progress} testID="how-it-works-progress">
          {index + 1} de {steps.length}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.figure}>
          <Image
            source={images[step.image]}
            style={styles.image}
            /*
              `contain`: las tres son de proporción distinta entre sí, y
              recortarlas al hueco le cortaría la cabeza a alguna.
            */
            resizeMode="contain"
            accessible={false}
          />
        </View>

        <View style={styles.text}>
          <Text style={styles.stepTitle} testID="how-it-works-title">
            {step.title}
          </Text>
          <Text style={styles.stepBody}>{step.body}</Text>
        </View>

        <View style={styles.footer}>
          {/*
            Los puntos, además del número: se ven de reojo mientras se lee, sin
            tener que subir a la cabecera a comprobar por dónde vas.
          */}
          <View style={styles.dots} accessible={false}>
            {steps.map((each, position) => (
              <View
                key={each.title}
                style={[styles.dot, position === index && styles.dotOn]}
              />
            ))}
          </View>

          <Button
            fullWidth
            onPress={() => (isLast ? onFinish() : setIndex(index + 1))}
            testID="how-it-works-next"
          >
            {isLast
              ? role === 'pro'
                ? 'Ver mis encargos'
                : 'Buscar un profesional'
              : 'Siguiente'}
          </Button>

          {/*
            Salirse a mitad, sin tener que pulsar cinco veces siguiente. Solo
            mientras quedan pasos: en el último ya está el botón de acabar, y
            dos salidas juntas obligan a elegir entre cosas que hacen lo mismo.
          */}
          {!isLast && (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              style={styles.skip}
              testID="how-it-works-skip"
            >
              <Text style={styles.skipText}>Saltar</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
