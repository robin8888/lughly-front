/**
 * TradeCarouselItem Molecule
 * Una tarjeta del carrusel: ilustración + etiqueta.
 *
 * Recibe el slot ya calculado (HOME_MOBILE.md §1) y solo se encarga de
 * animarse hacia él. Toda la mecánica vive en `useCarousel`.
 *
 * La animación va con Reanimated, en el hilo de UI: 350 ms con
 * `Easing.inOut(Easing.ease)`, igual que el `transition .35s ease` del diseño.
 * Con `LayoutAnimation` la escala no interpola con precisión suficiente.
 */

import { Image, Pressable, Text } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import type { Slot } from '@/hooks/ui/useCarousel'
import { ITEM_SIZE } from '@/hooks/ui/useCarousel'
import { styles } from './TradeCarouselItem.styles'

const DURATION_MS = 350

export interface TradeCarouselItemProps {
  label: string
  image: number
  slot: Slot
  onPress: () => void
  testID?: string
}

export function TradeCarouselItem({
  label,
  image,
  slot,
  onPress,
  testID,
}: TradeCarouselItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const timing = { duration: DURATION_MS, easing: Easing.inOut(Easing.ease) }

    return {
      // -50% del ancho para centrar, más el desplazamiento de su posición
      transform: [
        { translateX: withTiming(-ITEM_SIZE / 2 + slot.offset, timing) },
        { scale: withTiming(slot.scale, timing) },
      ],
      opacity: withTiming(slot.visible ? slot.opacity : 0, timing),
      zIndex: slot.zIndex,
    }
  }, [slot])

  return (
    <Animated.View
      style={[styles.item, animatedStyle]}
      // Las tarjetas laterales no deben robar el toque a la central,
      // aunque queden por encima al solaparse.
      pointerEvents={slot.interactive ? 'auto' : 'none'}
    >
      <Pressable
        onPress={onPress}
        disabled={!slot.interactive}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.pressable}
      >
        {/*
          Sin `blurRadius`: obliga a reprocesar la imagen entera cada vez que
          cambia, y con PNG grandes se ve el retardo al llegar al centro.
          El desenfoque de los lados lo hacen dos velos fijos en TradesCarousel.
        */}
        <Image source={image} style={styles.image} resizeMode="contain" />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}
