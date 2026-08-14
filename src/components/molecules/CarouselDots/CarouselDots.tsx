/**
 * CarouselDots Molecule
 * Los cuatro puntos del carrusel (HOME_MOBILE.md §1).
 *
 * Con 18 oficios no se pinta un punto por oficio: eso sería ilegible y no
 * diría nada. Son SIEMPRE cuatro puntos que representan la ventana visible,
 * y el activo es siempre el segundo. Pulsar el punto `n` mueve `n - 1`
 * posiciones, así que sirven además como avance rápido.
 */

import { View, Pressable } from 'react-native'
import { theme } from '@/theme'
import { styles } from './CarouselDots.styles'

const SLOTS = [0, 1, 2, 3]
const ACTIVE_SLOT = 1

export interface CarouselDotsProps {
  onPressSlot: (slot: number) => void
  testID?: string
}

export function CarouselDots({ onPressSlot, testID }: CarouselDotsProps) {
  return (
    <View style={styles.container} testID={testID}>
      {SLOTS.map((slot) => {
        const active = slot === ACTIVE_SLOT
        const small = slot === 0 || slot === 3

        return (
          <Pressable
            key={slot}
            onPress={() => onPressSlot(slot)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={active ? 'Oficio actual' : 'Ir a otro oficio'}
            accessibilityState={{ selected: active }}
            testID={testID ? `${testID}-${slot}` : undefined}
            style={{
              width: active ? 20 : small ? 5 : 7,
              height: active ? 7 : small ? 5 : 7,
              borderRadius: theme.radius.pill,
              opacity: small ? 0.45 : 1,
              backgroundColor: active
                ? theme.colors.accent600
                : 'rgba(255, 255, 255, 0.3)',
            }}
          />
        )
      })}
    </View>
  )
}
