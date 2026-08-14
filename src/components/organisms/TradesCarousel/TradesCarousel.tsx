/**
 * TradesCarousel Organism
 * "01 · Un experto para cada trabajo" (HOME_MOBILE.md §1).
 *
 * Las 18 tarjetas están posicionadas en absoluto sobre un contenedor de 410 px
 * de alto y solo se ven cinco: la central y dos a cada lado, alejándose con
 * escala y opacidad decrecientes. No es un FlatList ni un scroll horizontal:
 * ese efecto de profundidad no se consigue con una lista.
 */

import { useRef } from 'react'
import { View, Text, Pressable } from 'react-native'
import { BlurView } from 'expo-blur'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { Chevron } from '@/components/atoms/Chevron'
import { CarouselDots } from '@/components/molecules/CarouselDots'
import { TradeCarouselItem } from '@/components/molecules/TradeCarouselItem'
import { useCarousel } from '@/hooks/ui/useCarousel'
import { useTrades } from '@/hooks/domain/useTrades'
import type { TradeSlug } from '@/utils/trades'
import { theme } from '@/theme'
import { styles } from './TradesCarousel.styles'

export interface TradesCarouselProps {
  onSelect: (slug: TradeSlug) => void
  testID?: string
}

/** Arrastre mínimo para cambiar de oficio */
const SWIPE_DISTANCE = 45
/** …o un gesto rápido, aunque recorra poco */
const SWIPE_VELOCITY = 500
const SNAP_BACK_MS = 350

export function TradesCarousel({ onSelect, testID }: TradesCarouselProps) {
  const trades = useTrades()
  const { next, prev, goToSlot, slotFor } = useCarousel(trades.length)

  /** Desplazamiento en vivo mientras el dedo arrastra */
  const dragX = useSharedValue(0)

  /**
   * Marca que ha habido arrastre.
   *
   * Al levantar el dedo, el `Pressable` de la tarjeta dispara su `onPress`
   * aunque el gesto haya sido un desplazamiento: para él, tocar y soltar es
   * un toque. Con esta bandera se ignora ese falso toque.
   *
   * Solo se activa cuando el gesto de arrastre ARRANCA de verdad, y eso
   * requiere haber movido 12 px en horizontal (`activeOffsetX`). Un toque
   * limpio no lo activa nunca.
   */
  const draggedRef = useRef(false)

  const markDragged = () => {
    draggedRef.current = true
  }

  const clearDragged = () => {
    // Un respiro antes de limpiarla: `onPress` puede llegar justo después
    // de que termine el gesto.
    setTimeout(() => {
      draggedRef.current = false
    }, 150)
  }

  const handleSelect = (slug: TradeSlug) => {
    if (draggedRef.current) return
    onSelect(slug)
  }

  const settle = () => {
    dragX.value = withTiming(0, {
      duration: SNAP_BACK_MS,
      easing: Easing.inOut(Easing.ease),
    })
  }

  /**
   * Arrastrar mueve TODAS las tarjetas a la vez, que es lo que el dedo
   * espera. Al soltar, el bloque vuelve a su sitio mientras las tarjetas
   * se recolocan en sus nuevas posiciones: las dos transiciones duran lo
   * mismo, así que se ve como un único movimiento.
   */
  const pan = Gesture.Pan()
    // Sin esto, el scroll vertical de la home se comería el gesto
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onStart(() => {
      // Solo llega aquí si de verdad ha sido un arrastre horizontal
      runOnJS(markDragged)()
    })
    .onUpdate((event) => {
      dragX.value = event.translationX
    })
    .onEnd((event) => {
      const far = Math.abs(event.translationX) > SWIPE_DISTANCE
      const fast = Math.abs(event.velocityX) > SWIPE_VELOCITY

      if (far || fast) {
        // Arrastrar a la izquierda trae el siguiente, como pasar una página
        runOnJS(event.translationX < 0 ? next : prev)()
      }

      runOnJS(settle)()
    })
    .onFinalize(() => {
      runOnJS(clearDragged)()
    })

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }))

  return (
    <View style={styles.section} testID={testID}>
      <Text style={styles.sectionLabel}>01 · Un experto para cada trabajo</Text>

      <View style={styles.viewport}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.dragLayer, dragStyle]}>
            {trades.map((trade, index) => (
              <TradeCarouselItem
                key={trade.slug}
                label={trade.label}
                image={trade.image}
                slot={slotFor(index)}
                onPress={() => handleSelect(trade.slug)}
                testID={`trade-item-${trade.slug}`}
              />
            ))}
          </Animated.View>
        </GestureDetector>

        {/*
          Velos laterales: no se desenfoca cada imagen (eso obliga a
          reprocesarla y se nota el retardo al llegar al centro), sino que se
          desenfoca lo que PASA POR DEBAJO de estas dos franjas fijas. La
          tarjeta central queda fuera de ellas y siempre nítida, sin cálculo
          alguno al cambiar de oficio.

          Dos capas por lado, la exterior más ancha e intensa, para que el
          desenfoque no corte en seco.
        */}
        <BlurView
          intensity={38}
          tint="dark"
          style={[styles.veil, styles.veilLeftOuter]}
          pointerEvents="none"
        />
        <BlurView
          intensity={18}
          tint="dark"
          style={[styles.veil, styles.veilLeftInner]}
          pointerEvents="none"
        />
        <BlurView
          intensity={38}
          tint="dark"
          style={[styles.veil, styles.veilRightOuter]}
          pointerEvents="none"
        />
        <BlurView
          intensity={18}
          tint="dark"
          style={[styles.veil, styles.veilRightInner]}
          pointerEvents="none"
        />
      </View>

      <CarouselDots onPressSlot={goToSlot} testID="carousel-dots" />

      <View style={styles.arrows}>
        <Pressable
          onPress={prev}
          style={styles.arrow}
          accessibilityRole="button"
          accessibilityLabel="Anterior"
          testID="carousel-prev"
        >
          <Chevron direction="left" color={theme.colors.text} />
        </Pressable>

        <Pressable
          onPress={next}
          style={styles.arrow}
          accessibilityRole="button"
          accessibilityLabel="Siguiente"
          testID="carousel-next"
        >
          <Chevron direction="right" color={theme.colors.text} />
        </Pressable>
      </View>
    </View>
  )
}
